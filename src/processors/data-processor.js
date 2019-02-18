import DeviceInfo from 'react-native-device-info';
import Intercom from 'react-native-intercom';
import moment from 'moment';
import { merge } from 'lodash';
import { Actions } from 'react-native-router-flux';
import ReactNative from 'react-native';
import { sha3_256 } from 'js-sha3';
import randomString from 'random-string';
import base58 from 'bs58';
import { Sentry } from 'react-native-sentry';
import { Linking } from 'react-native';

const {
  PushNotificationIOS,
} = ReactNative;

import {
  EventEmitterService,
  BitmarkService,
  AccountService,
  HealthKitService,
  IndexDBService,
  LocalFileService
} from './services';

import {
  CommonModel, AccountModel, UserModel, BitmarkModel,
  iCloudSyncAdapter, PDFScanner
} from './models';
import {
  FileUtil,
  isImageFile, isPdfFile, isHealthDataRecord, isAssetDataRecord, isDailyHealthDataRecord,
  compareVersion, runPromiseWithoutError, runPromiseIgnoreError, isEMRRecord, bitmarkSortFunction
} from 'src/utils';

import { UserBitmarksStore, UserBitmarksActions, EMRInformationStore, EMRInformationActions, AccountStore, AccountActions } from 'src/views/stores';
import { config } from 'src/configs';
import { CacheData } from './caches';


let mapModalDisplayData = {};
const mapModalDisplayKeyIndex = {
  what_new: 2,
  email_record: 3,
};

let isDisplayingModal = (keyIndex) => {
  return CacheData.keyIndexModalDisplaying === keyIndex && !!mapModalDisplayData[keyIndex];
}

let checkDisplayModal = () => {
  if (CacheData.keyIndexModalDisplaying > 0 && !mapModalDisplayData[CacheData.keyIndexModalDisplaying]) {
    CacheData.keyIndexModalDisplaying = 0;
  }
  let keyIndexArray = Object.keys(mapModalDisplayData).sort();
  for (let index = 0; index < keyIndexArray.length; index++) {
    let keyIndex = parseInt(keyIndexArray[index]);
    if (mapModalDisplayData[keyIndex] && (CacheData.keyIndexModalDisplaying <= 0 || CacheData.keyIndexModalDisplaying > keyIndex)) {
      if (keyIndex === mapModalDisplayKeyIndex.what_new && CacheData.mountedRouter) {
        Actions.whatNew();
        CacheData.keyIndexModalDisplaying = keyIndex;
        break;
      } else if (keyIndex === mapModalDisplayKeyIndex.email_record && CacheData.mountedRouter) {
        Actions.emailRecords(mapModalDisplayData[keyIndex]);
        CacheData.keyIndexModalDisplaying = keyIndex;
        break;
      }
    }
  }
};

let updateModal = (keyIndex, data) => {
  mapModalDisplayData[keyIndex] = data;
  checkDisplayModal();
};

// ================================================================================================================================================
const doCheckNewUserDataBitmarks = async ({ healthDataBitmarks, dailyHealthDataBitmarks, healthAssetBitmarks, latestEMRBitmark, bitmarkAccountNumber }) => {
  bitmarkAccountNumber = bitmarkAccountNumber || CacheData.userInformation.bitmarkAccountNumber;

  let userDataBitmarks = await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_BITMARK) || {};
  userDataBitmarks[bitmarkAccountNumber] = {
    healthDataBitmarks: (healthDataBitmarks || []).filter(b => b.owner === bitmarkAccountNumber),
    dailyHealthDataBitmarks: (dailyHealthDataBitmarks || []).filter(b => b.owner === bitmarkAccountNumber),
    healthAssetBitmarks
  };

  if (latestEMRBitmark) {
    if (latestEMRBitmark.owner === bitmarkAccountNumber) {
      if (CacheData.userInformation.latestEMRAssetId !== latestEMRBitmark.asset.id) {
        let result = await runPromiseIgnoreError(detectLocalAssetFilePath(latestEMRBitmark.asset));
        if (result.filePath && (await FileUtil.exists(result.filePath))) {
          CacheData.userInformation.currentEMRData = JSON.parse(await FileUtil.readFile(result.filePath));
          CacheData.userInformation.latestEMRAssetId = latestEMRBitmark.asset.id;
          latestEMRBitmark.asset.filePath = result.filePath;
          await UserModel.doUpdateUserInfo(CacheData.userInformation);
          await runPromiseWithoutError(LocalFileService.doCheckAndSyncDataWithICloud(latestEMRBitmark));
        }
      }
    } else {
      CacheData.userInformation.currentEMRData = null;
      CacheData.userInformation.latestEMRAssetId = null;
      await UserModel.doUpdateUserInfo(CacheData.userInformation);
    }
  }
  let storeState = { emrInformation: CacheData.userInformation.currentEMRData };
  EMRInformationStore.dispatch(EMRInformationActions.initData(storeState));
  UserBitmarksStore.dispatch(UserBitmarksActions.updateEMRInformation(CacheData.userInformation.currentEMRData));

  if (bitmarkAccountNumber === CacheData.userInformation.bitmarkAccountNumber) {
    let storeState = merge({}, UserBitmarksStore.getState().data);
    storeState.healthDataBitmarks = userDataBitmarks[bitmarkAccountNumber].healthDataBitmarks;
    storeState.dailyHealthDataBitmarks = userDataBitmarks[bitmarkAccountNumber].dailyHealthDataBitmarks;
    storeState.healthAssetBitmarks = healthAssetBitmarks;
    UserBitmarksStore.dispatch(UserBitmarksActions.initBitmarks(storeState));
  }

  // Check daily health data permission
  if (bitmarkAccountNumber === CacheData.userInformation.bitmarkAccountNumber &&
    !CacheData.userInformation.activeHealthDataAt && dailyHealthDataBitmarks && dailyHealthDataBitmarks.length > 0) {
    runPromiseWithoutError(doRequireHealthKitPermission());
  }

  // Update user data into local database
  await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_BITMARK, userDataBitmarks);

  // Issue new daily health data
  if (bitmarkAccountNumber === CacheData.userInformation.bitmarkAccountNumber && CacheData.userInformation.activeHealthDataAt) {
    checkAndIssueNewDailyHealthData(dailyHealthDataBitmarks);
  }
};

let isIssuingBitmarkHealthData = false;
let lastIssuedDailyHealthCollectionDate;
const checkAndIssueNewDailyHealthData = async (dailyHealthDataBitmarks) => {
  if (isIssuingBitmarkHealthData) return;

  console.log('checkAndIssueNewDailyHealthData...');
  let waitingForIssuingDailyHealthDataList = HealthKitService.doCheckBitmarkHealthDataTask(dailyHealthDataBitmarks, CacheData.userInformation.activeHealthDataAt, CacheData.userInformation.restActiveHealthDataAt);
  if (lastIssuedDailyHealthCollectionDate) {
    waitingForIssuingDailyHealthDataList = waitingForIssuingDailyHealthDataList.filter((item) => {
      return item.StepCount.endDate.getTime() > lastIssuedDailyHealthCollectionDate.toDate().getTime();
    });
  }

  console.log('waitingForIssuingDailyHealthDataList:', waitingForIssuingDailyHealthDataList);

  if (waitingForIssuingDailyHealthDataList.length) {
    isIssuingBitmarkHealthData = true;
    try {
      let results = await doBitmarkHealthData(waitingForIssuingDailyHealthDataList);
      console.log('Daily health data issued results:', results);
      if (results && results.length) {
        let lastResult = results[results.length - 1];
        lastIssuedDailyHealthCollectionDate = moment(lastResult.healthData.assetMetadata["Collection Date"]);
      }
    } finally {
      isIssuingBitmarkHealthData = false;
      console.log('Finished issuing Daily health data');
    }
  }
};

let queueGetUserDataBitmarks = {};
const runGetUserBitmarksInBackground = (bitmarkAccountNumber) => {
  bitmarkAccountNumber = bitmarkAccountNumber || CacheData.userInformation.bitmarkAccountNumber;
  return new Promise((resolve) => {
    queueGetUserDataBitmarks[bitmarkAccountNumber] = queueGetUserDataBitmarks[bitmarkAccountNumber] || [];
    queueGetUserDataBitmarks[bitmarkAccountNumber].push(resolve);
    if (queueGetUserDataBitmarks[bitmarkAccountNumber].length > 1) {
      return;
    }
    let doGetAllBitmarks = async () => {
      let canContinue = true;
      let lastOffset, totalAssets = [], totalBitmarks = [];
      while (canContinue) {
        let data = await BitmarkModel.doGet100Bitmarks(bitmarkAccountNumber, lastOffset);
        if (data && data.assets && data.bitmarks && data.assets.length > 0 && data.bitmarks.length > 0) {
          data.assets.forEach(asset => {
            let exist = totalAssets.findIndex(as => as.id == asset.id) >= 0;
            if (bitmarkAccountNumber === CacheData.userInformation.bitmarkAccountNumber && !exist) {
              totalAssets.push(asset);
            }
          });
          data.bitmarks.forEach(bitmark => {
            lastOffset = lastOffset ? Math.max(lastOffset, bitmark.offset) : bitmark.offset;
            let exist = totalBitmarks.findIndex(b => b.id == bitmark.id) >= 0;
            if (bitmarkAccountNumber === CacheData.userInformation.bitmarkAccountNumber && !exist) {
              totalBitmarks.push(bitmark);
            }
          });
          canContinue = true;
        } else {
          canContinue = false;
        }
      }
      return { bitmarks: totalBitmarks, assets: totalAssets };
    };

    doGetAllBitmarks().then(async ({ assets, bitmarks }) => {
      let userBitmarks = (await doGetUserDataBitmarks(CacheData.userInformation.bitmarkAccountNumber)) || {};
      let healthDataBitmarks = [], dailyHealthDataBitmarks = [], healthAssetBitmarks = [];
      let latestEMRBitmark;
      for (let bitmark of bitmarks) {
        let asset = assets.find(as => as.id === bitmark.asset_id);
        if (asset) {
          let oldBitmark = (userBitmarks.healthAssetBitmarks || []).concat((userBitmarks.dailyHealthDataBitmarks || [])).concat(userBitmarks.healthDataBitmarks || []).find(b => b.id === bitmark.id);
          let oldAsset = oldBitmark ? oldBitmark.asset : {};
          bitmark = merge({}, oldBitmark || {}, bitmark);
          asset = merge({}, oldAsset, asset);
          if (isHealthDataRecord(asset)) {
            if (bitmark.owner === bitmarkAccountNumber) {
              let result = await runPromiseIgnoreError(detectLocalAssetFilePath(asset));
              asset.filePath = result ? result.filePath : null;
              asset.viewFilePath = result ? result.viewFilePath : null;
              bitmark.asset = asset;
              await runPromiseWithoutError(LocalFileService.doCheckAndSyncDataWithICloud(bitmark));
            } else {
              bitmark.asset = asset;
            }
            healthDataBitmarks.push(bitmark);
          } else if (isDailyHealthDataRecord(asset)) {
            if (bitmark.owner === bitmarkAccountNumber) {
              let result = await runPromiseIgnoreError(detectLocalAssetFilePath(asset));
              asset.filePath = result ? result.filePath : null;
              asset.viewFilePath = result ? result.viewFilePath : null;
              bitmark.asset = asset;
              await runPromiseWithoutError(LocalFileService.doCheckAndSyncDataWithICloud(bitmark));
            } else {
              bitmark.asset = asset;
            }
            dailyHealthDataBitmarks.push(bitmark);
          } else if (isAssetDataRecord(asset)) {
            if (bitmark.owner === bitmarkAccountNumber) {
              if (!asset.filePath || asset.filePath.indexOf(FileUtil.SharedGroupDirectory) < 0) {
                let result = await runPromiseIgnoreError(detectLocalAssetFilePath(asset));
                asset.filePath = result ? result.filePath : null;
              }
              if (!bitmark.thumbnail || !bitmark.thumbnail.path || bitmark.thumbnail.path.indexOf(FileUtil.SharedGroupDirectory) < 0) {
                bitmark.thumbnail = await runPromiseIgnoreError(CommonModel.checkThumbnailForBitmark(bitmark.id));
              }
              bitmark.asset = asset;
              await runPromiseWithoutError(LocalFileService.doCheckAndSyncDataWithICloud(bitmark));
              healthAssetBitmarks.push(bitmark);
            }
          } else if (isEMRRecord(asset)) {
            if (!latestEMRBitmark || latestEMRBitmark.offset < bitmark.offset) {
              bitmark.asset = asset;
              latestEMRBitmark = bitmark;
            }
          }
        }
      }

      if (healthDataBitmarks.length > 0) {
        healthDataBitmarks = healthDataBitmarks.sort(bitmarkSortFunction);
      }

      if (healthAssetBitmarks.length > 0) {
        healthAssetBitmarks = healthAssetBitmarks.sort(bitmarkSortFunction);
      }

      if (dailyHealthDataBitmarks.length > 0) {
        let dailyHealthCompareFunction = (a, b) => {
          return moment(b.asset.metadata['Collection Date']).toDate().getTime() - moment(a.asset.metadata['Collection Date']).toDate().getTime();
        };

        dailyHealthDataBitmarks = dailyHealthDataBitmarks.sort(dailyHealthCompareFunction);
      }

      await doCheckNewUserDataBitmarks({ healthDataBitmarks, healthAssetBitmarks, dailyHealthDataBitmarks, latestEMRBitmark, bitmarkAccountNumber });

      (queueGetUserDataBitmarks[bitmarkAccountNumber] || []).forEach(queueResolve => queueResolve({ healthDataBitmarks, dailyHealthDataBitmarks, healthAssetBitmarks, latestEMRBitmark }));
      queueGetUserDataBitmarks[bitmarkAccountNumber] = [];
    }).catch(error => {
      (queueGetUserDataBitmarks[bitmarkAccountNumber] || []).forEach(queueResolve => queueResolve());
      queueGetUserDataBitmarks[bitmarkAccountNumber] = [];
      console.log(' runGetUserBitmarksInBackground error:', error);
    });
  });
};

const finishedDisplayEmailRecords = () => {
  updateModal(mapModalDisplayKeyIndex.email_record);
};
let queueGetEmailRecords = [];
const doCheckNewEmailRecords = async (mapEmailRecords) => {
  console.log('mapEmailRecords :', mapEmailRecords);
  if (!mapEmailRecords) {
    updateModal(mapModalDisplayKeyIndex.email_record);
    return;
  }
  if (Object.keys(mapEmailRecords).length > 0) {
    updateModal(mapModalDisplayKeyIndex.email_record, { mapEmailRecords });
  } else {
    updateModal(mapModalDisplayKeyIndex.email_record);
  }
};
const runGetEmailRecordsInBackground = () => {
  return new Promise((resolve) => {
    queueGetEmailRecords = queueGetEmailRecords || [];
    queueGetEmailRecords.push(resolve);
    if (queueGetEmailRecords.length > 1) {
      return;
    }
    AccountService.doGetAllEmailRecords(CacheData.userInformation.bitmarkAccountNumber, CacheData.jwt).then(emailIssueRequests => {
      queueGetEmailRecords.forEach(queueResolve => queueResolve(emailIssueRequests));
      queueGetEmailRecords = [];
      doCheckNewEmailRecords(emailIssueRequests);
    }).catch(error => {
      queueGetEmailRecords.forEach(queueResolve => queueResolve());
      queueGetEmailRecords = [];
      console.log(' runGetEmailRecordsInBackground error:', error);
    });
  });
};

const runOnBackground = async (justOpenApp) => {
  if (!CacheData.networkStatus) {
    return;
  }
  if (justOpenApp) {
    EventEmitterService.emit(EventEmitterService.events.APP_PROCESSING, true);
  }
  let userInfo = await UserModel.doTryGetCurrentUser();
  if (CacheData.userInformation === null || JSON.stringify(userInfo) !== JSON.stringify(CacheData.userInformation)) {
    CacheData.userInformation = userInfo;
  }

  let appInfo = await doGetAppInformation();
  appInfo = appInfo || {};
  appInfo.onScreenAt = appInfo.onScreenAt || moment().toDate().getTime();
  appInfo.offScreenAt = moment().toDate().getTime();
  await CommonModel.doSetLocalData(CommonModel.KEYS.APP_INFORMATION, appInfo);

  if (CacheData.userInformation && CacheData.userInformation.bitmarkAccountNumber) {
    await runGetUserBitmarksInBackground();
    CacheData.userInformation.metadata = await AccountModel.doGetUserMetadata(CacheData.jwt);
    if (!CacheData.userInformation.metadata) {
      CacheData.userInformation.metadata = {
        receive_email_records: true,
        suggest_health_studies: true,
        visualize_health_data: true,
      };
    }
    AccountStore.dispatch(AccountActions.reload());
    if (!isDisplayingModal(mapModalDisplayKeyIndex.email_record) && CacheData.userInformation.metadata.receive_email_records) {
      await runGetEmailRecordsInBackground();
    }
  }
  if (justOpenApp) {
    EventEmitterService.emit(EventEmitterService.events.APP_PROCESSING, false);
  }
};
// ================================================================================================================================================

const configNotification = () => {
  const onRegistered = async (registeredNotificationInfo) => {
    CacheData.notificationUUID = registeredNotificationInfo ? registeredNotificationInfo.token : null;
    if (!CacheData.userInformation || !CacheData.userInformation.bitmarkAccountNumber) {
      CacheData.userInformation = await UserModel.doGetCurrentUser();
    }
    if (!CacheData.userInformation || !CacheData.userInformation.bitmarkAccountNumber) {
      let appInfo = (await doGetAppInformation()) || {};
      if (appInfo.notificationUUID !== CacheData.notificationUUID) {
        AccountService.doRegisterNotificationInfo(null, CacheData.notificationUUID, appInfo.intercom_user_id).then(() => {
          CacheData.userInformation.notificationUUID = CacheData.notificationUUID;
          return UserModel.doUpdateUserInfo(CacheData.userInformation);
        }).catch(error => {
          console.log('DataProcessor doRegisterNotificationInfo error:', error);
        });
      }
    } else {
      if (CacheData.notificationUUID && CacheData.userInformation.notificationUUID !== CacheData.notificationUUID) {
        AccountService.doRegisterNotificationInfo(CacheData.userInformation.bitmarkAccountNumber, CacheData.notificationUUID, CacheData.userInformation.intercom_user_id).then(() => {
          CacheData.userInformation.notificationUUID = CacheData.notificationUUID;
          return UserModel.doUpdateUserInfo(CacheData.userInformation);
        }).catch(error => {
          console.log('DataProcessor doRegisterNotificationInfo error:', error);
        });
      }
    }
  };
  const onReceivedNotification = async (notificationData) => {
    if (!notificationData.foreground && notificationData.data) {
      if (notificationData.data.event === 'intercom_reply') {
        setTimeout(() => { Intercom.displayConversationsList(); }, 2000);
      } else if (notificationData.data.event === 'open_url' && DeviceInfo.getBundleId() === 'com.bitmark.healthplus.beta') {
        Linking.openURL(notificationData.data.url);
      }
    }
  };
  AccountService.configure(onRegistered, onReceivedNotification);
};

// ================================================================================================================================================
let dataInterval = null;
const startInterval = () => {
  stopInterval();
  runOnBackground(true);
  dataInterval = setInterval(runOnBackground, 30 * 1000);
};

const stopInterval = () => {
  if (dataInterval) {
    clearInterval(dataInterval);
  }
  dataInterval = null;
};

const doGetAppInformation = async () => {
  return await CommonModel.doGetLocalData(CommonModel.KEYS.APP_INFORMATION);
};

const checkAppNeedResetLocalData = async (appInfo) => {
  if (config.needResetLocalData) {
    appInfo = appInfo || (await doGetAppInformation());
    if (!appInfo || appInfo.resetLocalDataAt !== config.needResetLocalData) {
      appInfo = appInfo || {};
      appInfo.resetLocalDataAt = config.needResetLocalData;
      await CommonModel.doSetLocalData(CommonModel.KEYS.APP_INFORMATION, appInfo);
      await UserModel.resetUserLocalData();
    }
  }
};
// ================================================================================================================================================
// ================================================================================================================================================
const doStartBackgroundProcess = async (justCreatedBitmarkAccount) => {
  startInterval();
  if (!justCreatedBitmarkAccount && CacheData.userInformation && CacheData.userInformation.bitmarkAccountNumber) {
    await AccountService.doCheckNotificationPermission();
  }
  return CacheData.userInformation;
};

const doCreateAccount = async () => {
  let userInformation = await AccountService.doGetCurrentAccount();
  await checkAppNeedResetLocalData();

  let signatureData = await CommonModel.doCreateSignatureData();
  await AccountModel.doTryRegisterAccount(userInformation.bitmarkAccountNumber, signatureData.timestamp, signatureData.signature);
  if (CacheData.notificationUUID) {
    let intercom_user_id = `HealthPlus_${sha3_256(userInformation.bitmarkAccountNumber)}`;
    AccountService.doRegisterNotificationInfo(userInformation.bitmarkAccountNumber, CacheData.notificationUUID, intercom_user_id).then(() => {
      userInformation.notificationUUID = CacheData.notificationUUID;
      return UserModel.doUpdateUserInfo(userInformation);
    }).catch(error => {
      console.log('DataProcessor doRegisterNotificationInfo error:', error);
    });
  }
  await CommonModel.doTrackEvent({
    event_name: 'health_plus_create_new_account',
    account_number: userInformation ? userInformation.bitmarkAccountNumber : null,
  });
  return userInformation;
};

const doLogin = async () => {
  CacheData.userInformation = await AccountService.doGetCurrentAccount();
  await checkAppNeedResetLocalData();
  let signatureData = await CommonModel.doCreateSignatureData();
  await AccountModel.doTryRegisterAccount(CacheData.userInformation.bitmarkAccountNumber, signatureData.timestamp, signatureData.signature);
  if (CacheData.notificationUUID) {
    let intercom_user_id = `HealthPlus_${sha3_256(CacheData.userInformation.bitmarkAccountNumber)}`;
    AccountService.doRegisterNotificationInfo(CacheData.userInformation.bitmarkAccountNumber, CacheData.notificationUUID, intercom_user_id).then(() => {
      CacheData.userInformation.notificationUUID = CacheData.notificationUUID;
      return UserModel.doUpdateUserInfo(CacheData.userInformation);
    }).catch(error => {
      console.log('DataProcessor doRegisterNotificationInfo error:', error);
    });
  }
  CacheData.mountedRouter = false;
  return CacheData.userInformation;
};

const doLogout = async () => {
  if (CacheData.networkStatus) {
    let result = await AccountModel.doLogout(CacheData.jwt);
    if (!result) {
      return null;
    }
    if (CacheData.userInformation.notificationUUID) {
      let signatureData = await CommonModel.doCreateSignatureData()
      await AccountService.doTryDeregisterNotificationInfo(CacheData.userInformation.bitmarkAccountNumber, CacheData.userInformation.notificationUUID, signatureData);
    }
    PushNotificationIOS.cancelAllLocalNotifications();

    await UserModel.doRemoveUserInfo();
    await FileUtil.removeSafe(`${FileUtil.CacheDirectory}/${CacheData.userInformation.bitmarkAccountNumber}`);
    await Intercom.logout();
    UserBitmarksStore.dispatch(UserBitmarksActions.reset());
    mapModalDisplayData = {};
    CacheData.keyIndexModalDisplaying = 0;
    CacheData.userInformation = {};
    return true;
  }
  return null;
};

const doRequireHealthKitPermission = async (noNeedCheckEmptyDataSource) => {
  let result = await HealthKitService.initHealthKit();
  CacheData.userInformation.activeHealthDataAt = moment().toDate().toISOString();
  await UserModel.doUpdateUserInfo(CacheData.userInformation);

  let dateNotification = HealthKitService.getNext12AM();
  PushNotificationIOS.scheduleLocalNotification({
    fireDate: dateNotification.toDate(),
    alertTitle: '',
    alertBody: "Yesterday's daily activity data is ready to view.",
    repeatInterval: 'day'
  });

  if (!noNeedCheckEmptyDataSource) {
    let emptyHealthKitData = await HealthKitService.doCheckEmptyDataSource();
    if (emptyHealthKitData) {
      EventEmitterService.emit(EventEmitterService.events.CHECK_DATA_SOURCE_HEALTH_KIT_EMPTY);
    }
  }
  await runGetUserBitmarksInBackground();
  return result;
};

const doResetHealthDataTasks = async (list) => {
  console.log('doResetHealthDataTasks :', list);
  let restActiveHealthDataAt;
  for (let dateRange of list) {
    if ((!restActiveHealthDataAt && dateRange.endDate) ||
      (restActiveHealthDataAt && dateRange.endDate && moment(restActiveHealthDataAt).toDate().getTime() < moment(dateRange.endDate).toDate().getTime())) {
      restActiveHealthDataAt = dateRange.endDate;
    }
  }
  console.log('restActiveHealthDataAt :', restActiveHealthDataAt);
  CacheData.userInformation.restActiveHealthDataAt = restActiveHealthDataAt;
  await UserModel.doUpdateUserInfo(CacheData.userInformation);

  let dateNotification = HealthKitService.getNext12AM();
  PushNotificationIOS.scheduleLocalNotification({
    fireDate: dateNotification.toDate(),
    alertTitle: '',
    alertBody: "Yesterday's daily activity data is ready to view.",
    repeatInterval: 'day'
  });
};

const doDeactiveApplication = async () => {
  stopInterval();
};

const doOpenApp = async (justCreatedBitmarkAccount) => {
  CacheData.userInformation = await UserModel.doTryGetCurrentUser();
  await LocalFileService.setShareLocalStoragePath();

  let appInfo = await doGetAppInformation();
  appInfo = appInfo || {};

  if (!appInfo.trackEvents || !appInfo.trackEvents['health_plus_download']) {
    appInfo.trackEvents = appInfo.trackEvents || {};
    appInfo.trackEvents['health_plus_download'] = true;
    await CommonModel.doSetLocalData(CommonModel.KEYS.APP_INFORMATION, appInfo);

    await CommonModel.doTrackEvent({
      event_name: 'health_plus_download',
      account_number: CacheData.userInformation ? CacheData.userInformation.bitmarkAccountNumber : null,
    });
  }

  if (CacheData.userInformation && CacheData.userInformation.bitmarkAccountNumber) {
    let bitmarkAccountNumber = CacheData.userInformation.bitmarkAccountNumber;
    await FileUtil.mkdir(`${FileUtil.CacheDirectory}/${bitmarkAccountNumber}`);

    await LocalFileService.initializeLocalStorage();
    await LocalFileService.moveOldDataFilesToNewLocalStorageFolder();
    await LocalFileService.moveFilesFromLocalStorageToSharedStorage();
    await IndexDBService.initializeIndexedDB();

    iCloudSyncAdapter.oniCloudFileChanged((mapFiles) => {
      if (this.iCloudFileChangedTimeout) {
        clearTimeout(this.iCloudFileChangedTimeout)
      }

      this.iCloudFileChangedTimeout = setTimeout(
        () => {
          console.log('mapFiles:', Object.keys(mapFiles).length);
          for (let key in mapFiles) {
            let keyList = key.split('_');
            let promiseRunAfterCopyFile;
            let overwrite = false;
            let assetId;
            if (keyList[0] === bitmarkAccountNumber) {
              let keyFilePath;
              if (keyList[1] === 'assets') {
                assetId = base58.decode(keyList[2]).toString('hex');
                keyFilePath = key.replace(`${bitmarkAccountNumber}_assets_${keyList[2]}_`, `${bitmarkAccountNumber}/assets/${assetId}/downloaded/`);
              } else if (keyList[1] === 'thumbnails') {
                keyFilePath = key.replace(`${bitmarkAccountNumber}_thumbnails_`, `${bitmarkAccountNumber}/thumbnails/`);
              } else if (keyList[1] === 'indexedData') {
                keyFilePath = key.replace(`${bitmarkAccountNumber}_indexedData_`, `${bitmarkAccountNumber}/indexedData/`);
              } else if (keyList[1] === 'indexTag') {
                keyFilePath = key.replace(`${bitmarkAccountNumber}_indexTag_`, `${bitmarkAccountNumber}/indexTag/`);
                let bitmarkId = keyList[2].replace('.txt', '');
                overwrite = true;
                promiseRunAfterCopyFile = async () => {
                  await LocalFileService.doUpdateIndexTagFromICloud(bitmarkId);
                };
              } else if (keyList[1] === 'indexNote') {
                keyFilePath = key.replace(`${bitmarkAccountNumber}_indexNote_`, `${bitmarkAccountNumber}/indexNote/`);
                let bitmarkId = keyList[2].replace('.txt', '');
                overwrite = true;
                promiseRunAfterCopyFile = async () => {
                  await LocalFileService.doUpdateIndexNoteFromICloud(bitmarkId);
                };
              }
              let doSyncFile = async () => {
                if (assetId) {
                  let assetInfo = await BitmarkModel.doGetAssetInformation(assetId);
                  if ((isHealthDataRecord(assetInfo) || isDailyHealthDataRecord(assetInfo)) && keyFilePath.endsWith('.txt')) {
                    iCloudSyncAdapter.deleteFileFromCloud(key);
                    return;
                  }
                }
                let filePath = mapFiles[key];
                let downloadedFile = `${FileUtil.SharedGroupDirectory}/${keyFilePath}`;
                if (overwrite) {
                  await FileUtil.removeSafe(downloadedFile);
                  let downloadedFolder = downloadedFile.substring(0, downloadedFile.lastIndexOf('/'));
                  await FileUtil.mkdir(downloadedFolder);
                  await FileUtil.copyFile(filePath, downloadedFile);
                  if (promiseRunAfterCopyFile) {
                    await promiseRunAfterCopyFile();
                    promiseRunAfterCopyFile = null;
                  }
                } else {
                  let existFileICloud = await FileUtil.exists(filePath);
                  let existFileLocal = await FileUtil.exists(downloadedFile);
                  if (existFileICloud && !existFileLocal) {
                    let downloadedFolder = downloadedFile.substring(0, downloadedFile.lastIndexOf('/'));
                    await FileUtil.mkdir(downloadedFolder);
                    await FileUtil.copyFile(filePath, downloadedFile);
                  }
                }
              };
              runPromiseWithoutError(doSyncFile());
            }
          }
        },
        1000 * 5 // 5s
      );
    });
    iCloudSyncAdapter.syncCloud();
    configNotification();
    if (!CacheData.userInformation.intercom_user_id) {
      CacheData.userInformation.intercom_user_id = `HealthPlus_${sha3_256(bitmarkAccountNumber)}`;
      await UserModel.doUpdateUserInfo(CacheData.userInformation);
      Intercom.logout().then(() => {
        return Intercom.registerIdentifiedUser({ userId: CacheData.userInformation.intercom_user_id });
      }).catch(error => {
        console.log('registerIdentifiedUser error :', error);
      });
    } else {
      Intercom.registerIdentifiedUser({ userId: CacheData.userInformation.intercom_user_id }).catch(error => {
        console.log('registerIdentifiedUser error :', error);
      });
    }

    if (CacheData.networkStatus) {
      let signatureData = await CommonModel.doCreateSignatureData();
      let result = await AccountModel.doRegisterJWT(bitmarkAccountNumber, signatureData.timestamp, signatureData.signature);
      CacheData.jwt = result.jwt_token;
      Sentry.setUserContext({ userID: bitmarkAccountNumber, });
      if (!CacheData.userInformation.metadata) {
        CacheData.userInformation.metadata = {
          receive_email_records: true,
          suggest_health_studies: true,
          visualize_health_data: true,
        };
        await AccountModel.doUpdateUserMetadata(CacheData.jwt, CacheData.userInformation.metadata);
      } else {
        CacheData.userInformation.metadata = await AccountModel.doGetUserMetadata(CacheData.jwt);
        if (!CacheData.userInformation.metadata) {
          CacheData.userInformation.metadata = {
            receive_email_records: true,
            suggest_health_studies: true,
            visualize_health_data: true,
          };
        }
      }
      AccountStore.dispatch(AccountActions.reload());
    } else {
      if (!CacheData.userInformation.metadata) {
        CacheData.userInformation.metadata = {
          receive_email_records: true,
          suggest_health_studies: true,
          visualize_health_data: true,
        };
      }
      AccountStore.dispatch(AccountActions.reload());
    }

    if (justCreatedBitmarkAccount) {
      appInfo.displayedWhatNewInformation = DeviceInfo.getVersion();
      await CommonModel.doSetLocalData(CommonModel.KEYS.APP_INFORMATION, appInfo);
    } else {
      if (!appInfo.displayedWhatNewInformation || compareVersion(appInfo.displayedWhatNewInformation, DeviceInfo.getVersion(), 2) < 0) {
        updateModal(mapModalDisplayKeyIndex.what_new, true);
      }
    }
    await UserModel.doUpdateUserInfo(CacheData.userInformation);

    let userBitmarks = await doGetUserDataBitmarks(bitmarkAccountNumber);

    if (!CacheData.userInformation.activeHealthDataAt && userBitmarks && userBitmarks.dailyHealthDataBitmarks && userBitmarks.dailyHealthDataBitmarks.length > 0) {
      await runPromiseWithoutError(doRequireHealthKitPermission());
    }

    UserBitmarksStore.dispatch(UserBitmarksActions.initBitmarks(userBitmarks || {}));
    await checkAppNeedResetLocalData(appInfo);
    AccountService.removeAllDeliveredNotifications();
    PushNotificationIOS.cancelAllLocalNotifications();
    if (CacheData.userInformation.activeHealthDataAt) {
      let dateNotification = HealthKitService.getNext12AM();
      PushNotificationIOS.scheduleLocalNotification({
        fireDate: dateNotification.toDate(),
        alertTitle: '',
        alertBody: "Yesterday's daily activity data is ready to view.",
        repeatInterval: 'day'
      });
    }
  } else if (!CacheData.userInformation || !CacheData.userInformation.bitmarkAccountNumber) {
    let intercom_user_id = appInfo.intercom_user_id || `HealthPlus_${sha3_256(moment().toDate().getTime() + randomString({ length: 8 }))}`;
    if (!appInfo.intercom_user_id) {
      appInfo.intercom_user_id = intercom_user_id;
      Intercom.logout().then(() => {
        return Intercom.registerIdentifiedUser({ userId: intercom_user_id })
      }).catch(error => {
        console.log('registerIdentifiedUser error :', error);
      });
      CommonModel.doSetLocalData(CommonModel.KEYS.APP_INFORMATION, appInfo);
    } else {
      Intercom.registerIdentifiedUser({ userId: intercom_user_id }).catch(error => {
        console.log('registerIdentifiedUser error :', error);
      });
    }

    configNotification();
  }

  console.log('CacheData.userInformation :', CacheData.userInformation);
  return CacheData.userInformation;
};

const doBitmarkHealthData = async (list) => {
  console.log('Issuing daily health data...');
  let {results, errors} = await HealthKitService.doBitmarkHealthData(CacheData.userInformation.bitmarkAccountNumber, list);

  if (errors && errors.length) {
    Sentry.captureException(errors[0], {logger: 'user'});
    EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, {title: 'There was an error during registering your daily health data'});
  }

  if (results && results.length > 0) {
    for (let item of results) {
      await IndexDBService.insertHealthDataToIndexedDB(item.id, item.healthData);
    }
  }

  let appInfo = await doGetAppInformation();
  appInfo = appInfo || {};
  if (appInfo && (!appInfo.lastTimeIssued ||
    (appInfo.lastTimeIssued && (moment().toDate().getTime() - appInfo.lastTimeIssued) > 7 * 24 * 60 * 60 * 1000))) {
    await CommonModel.doTrackEvent({
      event_name: 'health_plus_weekly_active_user',
      account_number: CacheData.userInformation ? CacheData.userInformation.bitmarkAccountNumber : null,
    });
    appInfo.lastTimeIssued = moment().toDate().getTime();
    await CommonModel.doSetLocalData(CommonModel.KEYS.APP_INFORMATION, appInfo);
  }

  return results;
};

const doIssueFile = async (issueParams) => {
  let { filePath, assetName, metadataList, quantity, isPublicAsset = false, isMultipleAsset = false, note, tags } = issueParams;
  let results = await BitmarkService.doIssueFile(CacheData.userInformation.bitmarkAccountNumber, filePath, assetName, metadataList, quantity, isPublicAsset);

  let appInfo = await doGetAppInformation();
  appInfo = appInfo || {};
  if (appInfo && (!appInfo.lastTimeIssued ||
    (appInfo.lastTimeIssued && (moment().toDate().getTime() - appInfo.lastTimeIssued) > 7 * 24 * 60 * 60 * 1000))) {
    await CommonModel.doTrackEvent({
      event_name: 'health_plus_weekly_active_user',
      account_number: CacheData.userInformation ? CacheData.userInformation.bitmarkAccountNumber : null,
    });
    appInfo.lastTimeIssued = moment().toDate().getTime();
    await CommonModel.doSetLocalData(CommonModel.KEYS.APP_INFORMATION, appInfo);
  }

  for (let record of results) {
    await CommonModel.generateThumbnail(filePath, record.id, isMultipleAsset);

    // Index data
    if (isImageFile(record.filePath)) {
      let detectResult = await CommonModel.populateAssetNameFromImage(record.filePath);
      await IndexDBService.insertDetectedDataToIndexedDB(record.id, assetName, metadataList, detectResult.detectedTexts);
    } else if (isPdfFile(record.filePath)) {
      let detectResult = await CommonModel.populateAssetNameFromPdf(record.filePath);
      await IndexDBService.insertDetectedDataToIndexedDB(record.id, assetName, metadataList, detectResult.detectedTexts);
    } else {
      await IndexDBService.insertDetectedDataToIndexedDB(record.id, assetName, metadataList, '');
    }

    // Note
    if (note) {
      await IndexDBService.updateNote(record.id, note);
    }

    // Tags
    if (tags) {
      await IndexDBService.updateTag(record.id, tags);
    }
  }

  await runGetUserBitmarksInBackground();
  return results;
};

const doIssueMultipleFiles = async (issueParamsList) => {
  let results = [];
  for (let issueParams of issueParamsList) {
    let result = await doIssueFile(issueParams);
    results.push(result[0]);
  }
  return results;
};

const getUserInformation = () => {
  return CacheData.userInformation;
};

const getApplicationVersion = () => {
  return DeviceInfo.getVersion();
};

const getApplicationBuildNumber = () => {
  return DeviceInfo.getBuildNumber();
};

const doGetUserDataBitmarks = (bitmarkAccountNumber) => {
  bitmarkAccountNumber = bitmarkAccountNumber || CacheData.userInformation.bitmarkAccountNumber;
  return new Promise((resolve) => {
    CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_BITMARK).then(userDataBitmarks => {
      resolve(userDataBitmarks[bitmarkAccountNumber]);
    }).catch((error => {
      console.log('doGetUserDataBitmarks error:', error);
      resolve();
    }));
  });
};

const doCheckFileToIssue = async (filePath) => {
  let result = await BitmarkService.doCheckFileToIssue(filePath, CacheData.userInformation.bitmarkAccountNumber);
  let canIssue = true;
  if (result && result.asset && result.asset.name) {
    if (result.asset.registrant === CacheData.userInformation.bitmarkAccountNumber) {
      let userBitmarks = await doGetUserDataBitmarks(CacheData.userInformation.bitmarkAccountNumber);
      userBitmarks = userBitmarks || {};
      canIssue = ((userBitmarks.healthAssetBitmarks || []).findIndex(bm => bm.asset_id === result.asset.id) < 0) &&
        ((userBitmarks.healthDataBitmarks || []).findIndex(bm => bm.asset_id === result.asset.id) < 0);
    } else {
      canIssue = false;
    }
  }
  result.asset.canIssue = canIssue;
  return result;
};

const doDeleteAccount = async () => {
  return await AccountModel.doDeleteAccount(CacheData.jwt);
};

const doAcceptEmailRecords = async (emailRecord) => {
  for (let item of emailRecord.list) {
    if (!item.existingAsset) {
      await doIssueFile({ filePath: item.filePath, assetName: item.assetName, metadataList: item.metadata, quantity: 1 });
    }
  }
  for (let id of emailRecord.ids) {
    await FileUtil.removeSafe(`${FileUtil.CacheDirectory}/${CacheData.userInformation.bitmarkAccountNumber}/email_records/${id}`);
    await AccountModel.doDeleteEmailRecord(CacheData.jwt, id);
  }
  return true;
};

const doRejectEmailRecords = async (emailRecord) => {
  for (let id of emailRecord.ids) {
    await FileUtil.removeSafe(`${FileUtil.CacheDirectory}/${CacheData.userInformation.bitmarkAccountNumber}/email_records/${id}`);
    await AccountModel.doDeleteEmailRecord(CacheData.jwt, id);
  }
};

const detectLocalAssetFilePath = async (asset) => {
  let assetFolderPath = `${FileUtil.getLocalAssetsFolderPath(CacheData.userInformation.bitmarkAccountNumber)}/${asset.id}`;
  let existAssetFolder = await runPromiseWithoutError(FileUtil.exists(assetFolderPath));
  let filePath, viewFilePath;
  if (!existAssetFolder || existAssetFolder.error) {
    return { filePath, viewFilePath };
  }
  let detectFilePath = async () => {
    let downloadedFolder = `${assetFolderPath}/downloaded`;
    let existDownloadedFolder = await runPromiseWithoutError(FileUtil.exists(downloadedFolder));
    if (!existDownloadedFolder || existDownloadedFolder.error) {
      return null;
    }
    let list = await FileUtil.readDir(`${assetFolderPath}/downloaded`);
    return `${assetFolderPath}/downloaded/${list[0]}`;
  }

  let detectViewFilePath = async () => {
    let viewFolder = `${assetFolderPath}/view`;
    let existViewFolder = await runPromiseWithoutError(FileUtil.exists(viewFolder));
    if (!existViewFolder || existViewFolder.error) {
      return null;
    }
    let list = await FileUtil.readDir(`${assetFolderPath}/view`);
    return `${assetFolderPath}/view/${list[0]}`;
  }
  filePath = await detectFilePath();
  if (isHealthDataRecord(asset) || isDailyHealthDataRecord(asset)) {
    if (filePath && filePath.substring(filePath.lastIndexOf('.'), filePath.length) === '.txt') {
      asset.assetFileSyncedToICloud = false;
      let fullFilename = filePath.substring(filePath.lastIndexOf('/') + 1, filePath.length);
      let filename = fullFilename.replace('.txt', '');
      await FileUtil.removeSafe(`${assetFolderPath}/downloaded/${filename}.zip`);
      await FileUtil.removeSafe(`${assetFolderPath}/view`);

      let tempZipFilePath = `${assetFolderPath}/${filename}.zip`;
      await FileUtil.zip(`${assetFolderPath}/downloaded`, tempZipFilePath);
      await FileUtil.copyFile(tempZipFilePath, `${assetFolderPath}/downloaded/${filename}.zip`);
      await FileUtil.removeSafe(tempZipFilePath);

      await FileUtil.mkdir(`${assetFolderPath}/view`);
      await FileUtil.copyFile(filePath, `${assetFolderPath}/view/${filename}.txt`);
      await FileUtil.removeSafe(filePath);
      //remove old file in sandbox of app
      await FileUtil.removeSafe(`${FileUtil.DocumentDirectory}/${CacheData.userInformation.bitmarkAccountNumber}/assets/${asset.id}/downloaded/${filename}.txt`);
      await iCloudSyncAdapter.deleteFileFromCloud(`${CacheData.userInformation.bitmarkAccountNumber}_assets_${base58.encode(new Buffer(asset.id, 'hex'))}_${fullFilename}`);

      return {
        filePath: `${assetFolderPath}/downloaded/${filename}.zip`,
        viewFilePath: `${assetFolderPath}/view/${filename}.txt`
      }
    }
    viewFilePath = await detectViewFilePath();
    if (!viewFilePath && filePath && filePath.endsWith('.zip')) {
      await FileUtil.mkdir(`${assetFolderPath}/view`);
      await FileUtil.unzip(filePath, `${assetFolderPath}/view`);
      viewFilePath = await detectViewFilePath();
    }
  }
  return { filePath, viewFilePath };
};

const doCombineImages = async (images) => {
  let listFilePath = [];
  for (let imageInfo of images) {
    listFilePath.push(imageInfo.uri.replace('file://', ''));
  }
  let tempFolderPath = `${FileUtil.CacheDirectory}/${CacheData.userInformation.bitmarkAccountNumber}/combine-images`;
  await FileUtil.mkdir(tempFolderPath);
  let tempFilePath = `${tempFolderPath}/${moment().toDate().getTime()}.pdf`;
  await PDFScanner.pdfCombine(listFilePath, tempFilePath);
  return tempFilePath;
}
const doMetricOnScreen = async (isActive) => {
  let appInfo = await doGetAppInformation();
  appInfo = appInfo || {};
  let onScreenAt = appInfo.onScreenAt;
  let offScreenAt = appInfo.offScreenAt;
  if (isActive && onScreenAt && offScreenAt) {
    if (offScreenAt && offScreenAt > onScreenAt) {
      let userInfo = CacheData.userInformation || await UserModel.doTryGetCurrentUser() || {};

      let totalOnScreenAtPreTime = Math.floor((offScreenAt - onScreenAt) / (1000 * 60));
      await CommonModel.doTrackEvent({
        event_name: 'health_plus_screen_time',
        account_number: userInfo ? userInfo.bitmarkAccountNumber : null,
      }, {
          hit: totalOnScreenAtPreTime
        });
    }
    appInfo.onScreenAt = moment().toDate().getTime();
  } else {
    appInfo.offScreenAt = moment().toDate().getTime();
  }
  await CommonModel.doSetLocalData(CommonModel.KEYS.APP_INFORMATION, appInfo);
};

const setMountedRouter = () => {
  CacheData.mountedRouter = true;
  checkDisplayModal();
};

let setCodePushUpdated = (updated) => {
  console.log('setCodePushUpdated :', updated);
  CacheData.codePushUpdated = !!updated;
};

let doCheckHaveCodePushUpdate = () => {
  return new Promise((resolve) => {
    if (DeviceInfo.getBundleId() === 'com.bitmark.healthplus.beta') {
      resolve(true);
      return;
    }

    let checkHaveCodePushUpdate = () => {
      if (CacheData.codePushUpdated === true || CacheData.codePushUpdated === false) {
        return resolve(CacheData.codePushUpdated);
      }
      setTimeout(checkHaveCodePushUpdate, 1000);
    };
    checkHaveCodePushUpdate();
  });
};

let doMarkDisplayedWhatNewInformation = async () => {
  let appInfo = await doGetAppInformation();
  appInfo = appInfo || {};
  appInfo.displayedWhatNewInformation = DeviceInfo.getVersion();
  updateModal(mapModalDisplayKeyIndex.what_new);
  CacheData.keyIndexModalDisplaying = 0;
  await CommonModel.doSetLocalData(CommonModel.KEYS.APP_INFORMATION, appInfo);
};
const doDisplayedWhatNewInformation = async () => {
  updateModal(mapModalDisplayKeyIndex.what_new, true);
};

const doTransferBitmark = async (bitmark, receiver) => {
  let filename = bitmark.asset.filePath.substring(bitmark.asset.filePath.lastIndexOf('/') + 1, bitmark.asset.filePath.length);
  let result = await BitmarkService.doTransferBitmark(bitmark.id, receiver);

  await FileUtil.removeSafe(`${FileUtil.getLocalAssetsFolderPath(CacheData.userInformation.bitmarkAccountNumber)}/${bitmark.asset_id}`);
  await iCloudSyncAdapter.deleteFileFromCloud(`${CacheData.userInformation.bitmarkAccountNumber}_assets_${base58.encode(new Buffer(bitmark.asset.id, 'hex'))}_${filename}`);
  if (bitmark.thumbnail && bitmark.thumbnail.path && (await FileUtil.exists(bitmark.thumbnail.path))) {
    let filename = bitmark.thumbnail.path.substring(bitmark.thumbnail.path.lastIndexOf('/') + 1, bitmark.thumbnail.path.length);
    await FileUtil.removeSafe(`${FileUtil.getLocalThumbnailsFolderPath(CacheData.userInformation.bitmarkAccountNumber)}/${bitmark.id}.PNG`);
    await FileUtil.removeSafe(`${FileUtil.getLocalThumbnailsFolderPath(CacheData.userInformation.bitmarkAccountNumber)}/${bitmark.id}_${CommonModel.COMBINE_FILE_SUFFIX}.PNG`);
    await iCloudSyncAdapter.deleteFileFromCloud(`${CacheData.userInformation.bitmarkAccountNumber}_thumbnails_${filename}`);
  }

  await FileUtil.removeSafe(`${FileUtil.getLocalIndexedDataFolderPath(CacheData.userInformation.bitmarkAccountNumber)}/${bitmark.asset_id}.txt`);
  iCloudSyncAdapter.deleteFileFromCloud(`${CacheData.userInformation.bitmarkAccountNumber}_indexedData_${bitmark.asset.id}.txt`);

  await FileUtil.removeSafe(`${FileUtil.getLocalIndexedTagFolderPath(CacheData.userInformation.bitmarkAccountNumber)}/${bitmark.id}.txt`);
  iCloudSyncAdapter.deleteFileFromCloud(`${CacheData.userInformation.bitmarkAccountNumber}_indexTag_${bitmark.id}.txt`);

  await IndexDBService.deleteIndexedDataByBitmarkId(bitmark.id);
  await IndexDBService.deleteTagsByBitmarkId(bitmark.id);
  await IndexDBService.deleteNoteByBitmarkId(bitmark.id);
  await runGetUserBitmarksInBackground();
  return result;
};

const doIssueEMR = async (data) => {
  let assetName = `EMR${moment().format('YYYYMMMDDHHmmss')}`.toUpperCase();
  let metadata = {
    type: 'HEALTH-EMR'
  };
  let filePath = `${FileUtil.CacheDirectory}/${assetName}.json`;
  await FileUtil.writeFile(filePath, JSON.stringify(data));

  let results = await doIssueFile({ filePath, assetName, metadataList: metadata, quantity: 1 });
  await FileUtil.removeSafe(filePath);
  CacheData.userInformation.currentEMRData = data;
  CacheData.userInformation.latestEMRAssetId = results[0].assetId;
  let storeState = { emrInformation: CacheData.userInformation.currentEMRData };
  EMRInformationStore.dispatch(EMRInformationActions.initData(storeState));
  UserBitmarksStore.dispatch(UserBitmarksActions.updateEMRInformation(CacheData.userInformation.currentEMRData));
  return results;
};

const doSaveUserSetting = async (metadata) => {
  let temp = CacheData.userInformation.metadata;
  temp = merge({}, temp, metadata);
  CacheData.userInformation.metadata = temp;
  await UserModel.doUpdateUserInfo(temp);
  await AccountModel.doUpdateUserMetadata(CacheData.jwt, CacheData.userInformation.metadata);
  AccountStore.dispatch(AccountActions.reload());
};

const DataProcessor = {
  doOpenApp,
  doCreateAccount,
  doLogin,
  doLogout,
  doStartBackgroundProcess,

  doRequireHealthKitPermission,
  doResetHealthDataTasks,
  doDeactiveApplication,
  doBitmarkHealthData,
  doIssueFile,
  doIssueMultipleFiles,

  doCheckFileToIssue,

  getApplicationVersion,
  getApplicationBuildNumber,
  getUserInformation,
  finishedDisplayEmailRecords,

  doDeleteAccount,
  doAcceptEmailRecords,
  doRejectEmailRecords,
  doCombineImages,
  doMetricOnScreen,
  checkDisplayModal,
  setMountedRouter,
  setCodePushUpdated,
  doCheckHaveCodePushUpdate,
  doMarkDisplayedWhatNewInformation,
  doDisplayedWhatNewInformation,
  doTransferBitmark,
  doIssueEMR,
  doGetUserDataBitmarks,
  doSaveUserSetting,
};

export { DataProcessor };

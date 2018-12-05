import { Linking } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import Intercom from 'react-native-intercom';
import moment from 'moment';
import { merge } from 'lodash';
import { Actions } from 'react-native-router-flux';
import ReactNative from 'react-native';
import { sha3_256 } from 'js-sha3';
import randomString from 'random-string';
import base58 from 'bs58';

const {
  PushNotificationIOS,
} = ReactNative;

import {
  UserBitmarksStore, UserBitmarksActions,
  DataAccountAccessesStore, DataAccountAccessesActions
} from './../stores';
import {
  EventEmitterService,
  BitmarkService,
  AccountService,
} from "../services";
import { CommonModel, AccountModel, UserModel, BitmarkSDK, BitmarkModel } from '../models';
import { HealthKitService } from '../services/health-kit-service';
import { config } from '../configs';
import {
  FileUtil, checkThumbnailForBitmark, runPromiseWithoutError, generateThumbnail, insertHealthDataToIndexedDB, insertDetectedDataToIndexedDB,
  populateAssetNameFromImage, isImageFile, moveOldDataFilesToNewLocalStorageFolder, initializeLocalStorage, getLocalAssetsFolderPath,
  checkExistIndexedDataForBitmark, isPdfFile, isCaptureDataRecord, populateAssetNameFromPdf, compareVersion, detectTextsFromPdf,
  deleteIndexedDataByBitmarkId, initializeIndexedDB, deleteTagsByBitmarkId, doCheckAndSyncDataWithICloud, doUpdateIndexTagFromICloud, isHealthDataRecord, isAssetDataRecord
} from '../utils';

import PDFScanner from '../models/adapters/pdf-scanner';
import iCloudSyncAdapter from '../models/adapters/icloud';

let userInformation = {};
let grantedAccessAccountSelected = null;
let jwt;
// let websocket;
let isLoadingData = false;
let notificationUUID;

let mapModalDisplayData = {};
let keyIndexModalDisplaying = 0;
const mapModalDisplayKeyIndex = {
  local_storage_migration: 1,
  what_new: 2,
  email_record: 3,
  weekly_health_data: 4,
};
let codePushUpdated = null;
let mountedRouter = null;

let isDisplayingModal = (keyIndex) => {
  return keyIndexModalDisplaying === keyIndex && !!mapModalDisplayData[keyIndex];
}

let checkDisplayModal = () => {
  if (keyIndexModalDisplaying > 0 && !mapModalDisplayData[keyIndexModalDisplaying]) {
    keyIndexModalDisplaying = 0;
  }
  let keyIndexArray = Object.keys(mapModalDisplayData).sort();
  for (let index = 0; index < keyIndexArray.length; index++) {
    let keyIndex = parseInt(keyIndexArray[index]);
    if (mapModalDisplayData[keyIndex] && (keyIndexModalDisplaying <= 0 || keyIndexModalDisplaying > keyIndex)) {
      if (keyIndex === mapModalDisplayKeyIndex.what_new && mountedRouter) {
        Actions.whatNew();
        keyIndexModalDisplaying = keyIndex;
        break;
      } else if (keyIndex === mapModalDisplayKeyIndex.local_storage_migration && mountedRouter) {
        EventEmitterService.emit(EventEmitterService.events.APP_MIGRATION_FILE_LOCAL_STORAGE);
        keyIndexModalDisplaying = keyIndex;
        break;
      } else if (keyIndex === mapModalDisplayKeyIndex.email_record && mountedRouter) {
        Actions.emailRecords(mapModalDisplayData[keyIndex]);
        keyIndexModalDisplaying = keyIndex;
        break;
      } else if (keyIndex === mapModalDisplayKeyIndex.weekly_health_data && mountedRouter) {
        Actions.bitmarkHealthData(mapModalDisplayData[keyIndex]);
        keyIndexModalDisplaying = keyIndex;
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
const doCheckNewUserDataBitmarks = async (healthDataBitmarks, healthAssetBitmarks, bitmarkAccountNumber) => {
  bitmarkAccountNumber = bitmarkAccountNumber || userInformation.bitmarkAccountNumber;
  let userDataBitmarks = await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_BITMARK) || {};
  userDataBitmarks[bitmarkAccountNumber] = {
    healthDataBitmarks: (healthDataBitmarks || []).filter(b => b.owner === bitmarkAccountNumber),
    healthAssetBitmarks
  };

  await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_BITMARK, userDataBitmarks);


  if ((grantedAccessAccountSelected && grantedAccessAccountSelected.grantor === bitmarkAccountNumber) ||
    (!grantedAccessAccountSelected && bitmarkAccountNumber === userInformation.bitmarkAccountNumber)) {
    let storeState = merge({}, UserBitmarksStore.getState().data);
    storeState.healthDataBitmarks = userDataBitmarks[bitmarkAccountNumber].healthDataBitmarks;

    storeState.healthAssetBitmarks = healthAssetBitmarks;
    UserBitmarksStore.dispatch(UserBitmarksActions.initBitmarks(storeState));
  }

  if (bitmarkAccountNumber === userInformation.bitmarkAccountNumber &&
    !userInformation.activeHealthDataAt && healthDataBitmarks && healthDataBitmarks.length > 0) {
    await runPromiseWithoutError(doRequireHealthKitPermission());
  }

  if (bitmarkAccountNumber === userInformation.bitmarkAccountNumber && userInformation.activeHealthDataAt) {
    let list = HealthKitService.doCheckBitmarkHealthDataTask(healthDataBitmarks, userInformation.activeHealthDataAt, userInformation.restActiveHealthDataAt);
    if (list && list.length > 0) {
      updateModal(mapModalDisplayKeyIndex.weekly_health_data, { list });
    }
  }
};

let queueGetUserDataBitmarks = {};
const runGetUserBitmarksInBackground = (bitmarkAccountNumber) => {
  bitmarkAccountNumber = bitmarkAccountNumber || userInformation.bitmarkAccountNumber;
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
            if ((bitmarkAccountNumber === userInformation.bitmarkAccountNumber && !exist) ||
              (bitmarkAccountNumber !== userInformation.bitmarkAccountNumber && !exist && grantedAccessAccountSelected && grantedAccessAccountSelected.ids && grantedAccessAccountSelected.ids[asset.id])) {
              totalAssets.push(asset);
            }
          });
          data.bitmarks.forEach(bitmark => {
            lastOffset = lastOffset ? Math.max(lastOffset, bitmark.offset) : bitmark.offset;
            let exist = totalBitmarks.findIndex(b => b.id == bitmark.id) >= 0;
            if ((bitmarkAccountNumber === userInformation.bitmarkAccountNumber && !exist) ||
              (bitmarkAccountNumber !== userInformation.bitmarkAccountNumber && !exist && grantedAccessAccountSelected && grantedAccessAccountSelected.ids && grantedAccessAccountSelected.ids[bitmark.asset_id])) {
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
      let userBitmarks = (await doGetUserDataBitmarks(userInformation.bitmarkAccountNumber)) || {};
      let healthDataBitmarks = [], healthAssetBitmarks = [];
      for (let bitmark of bitmarks) {
        let asset = assets.find(as => as.id === bitmark.asset_id);
        if (asset) {
          let oldBitmark = (userBitmarks.healthAssetBitmarks || []).concat(userBitmarks.healthDataBitmarks || []).find(b => b.id === bitmark.id);
          let oldAsset = oldBitmark ? oldBitmark.asset : {};
          if (isHealthDataRecord(asset)) {
            if (bitmark.owner === bitmarkAccountNumber) {
              asset = merge({}, oldAsset, asset);
              asset.filePath = await detectLocalAssetFilePath(asset.id);
              bitmark.asset = asset;
              await doCheckAndSyncDataWithICloud(bitmark);
            } else {
              bitmark.asset = asset;
            }
            healthDataBitmarks.push(bitmark);
          }
          if (isAssetDataRecord(asset)) {
            if (bitmark.owner === bitmarkAccountNumber) {
              asset = merge({}, oldAsset, asset);
              if (!asset.filePath || asset.filePath.indexOf(FileUtil.DocumentDirectory) < 0) {
                asset.filePath = await detectLocalAssetFilePath(asset.id);
              }
              if (!bitmark.thumbnail || !bitmark.thumbnail.path || bitmark.thumbnail.path.indexOf(FileUtil.DocumentDirectory) < 0) {
                bitmark.thumbnail = await checkThumbnailForBitmark(bitmark.id);
              }
              bitmark.asset = asset;
              await doCheckAndSyncDataWithICloud(bitmark);
              healthAssetBitmarks.push(bitmark);
            }
          }
        }
      }

      let compareFunction = (a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') {
          return -1;
        } else if (b.status === 'pending' && a.status !== 'pending') {
          return 1;
        } else if (a.status === 'pending' && b.status === 'pending') {
          return 0;
        }

        return moment(b.created_at).toDate().getTime() - moment(a.created_at).toDate().getTime();
      };
      healthDataBitmarks = healthDataBitmarks.sort(compareFunction);
      healthAssetBitmarks = healthAssetBitmarks.sort(compareFunction);

      (queueGetUserDataBitmarks[bitmarkAccountNumber] || []).forEach(queueResolve => queueResolve({ healthDataBitmarks, healthAssetBitmarks }));
      queueGetUserDataBitmarks[bitmarkAccountNumber] = [];
      return doCheckNewUserDataBitmarks(healthDataBitmarks, healthAssetBitmarks, bitmarkAccountNumber);
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
    AccountService.doGetAllEmailRecords(userInformation.bitmarkAccountNumber, jwt).then(emailIssueRequests => {
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
  if (justOpenApp) {
    EventEmitterService.emit(EventEmitterService.events.APP_PROCESSING, true);
  }
  let userInfo = await UserModel.doTryGetCurrentUser();
  if (userInformation === null || JSON.stringify(userInfo) !== JSON.stringify(userInformation)) {
    userInformation = userInfo;
    EventEmitterService.emit(EventEmitterService.events.CHANGE_USER_INFO, userInfo);
  }

  let appInfo = await doGetAppInformation();
  appInfo = appInfo || {};
  appInfo.onScreenAt = appInfo.onScreenAt || moment().toDate().getTime();
  appInfo.offScreenAt = moment().toDate().getTime();
  await CommonModel.doSetLocalData(CommonModel.KEYS.APP_INFORMATION, appInfo);

  if (userInformation && userInformation.bitmarkAccountNumber) {
    await runGetUserBitmarksInBackground();
    // await runGetAccountAccessesInBackground();
    if (grantedAccessAccountSelected) {
      await runGetUserBitmarksInBackground(grantedAccessAccountSelected.grantor);
    }
    if (!isDisplayingModal(mapModalDisplayKeyIndex.email_record)) {
      await runGetEmailRecordsInBackground();
    }
    // if (!isDisplayingEmailRecord) {
    //   await runGetEmailRecordsInBackground();
    // }
  }
  if (justOpenApp) {
    EventEmitterService.emit(EventEmitterService.events.APP_PROCESSING, false);
  }
};
// ================================================================================================================================================
const doReloadUserData = async () => {
  isLoadingData = true;
  EventEmitterService.emit(EventEmitterService.events.APP_LOADING_DATA, isLoadingData);
  await runOnBackground();
  isLoadingData = false;
  EventEmitterService.emit(EventEmitterService.events.APP_LOADING_DATA, isLoadingData);
  return true;
};

const configNotification = () => {
  const onRegistered = async (registeredNotificationInfo) => {
    notificationUUID = registeredNotificationInfo ? registeredNotificationInfo.token : null;
    if (!userInformation || !userInformation.bitmarkAccountNumber) {
      userInformation = await UserModel.doGetCurrentUser();
    }
    if (!userInformation || !userInformation.bitmarkAccountNumber) {
      let appInfo = (await doGetAppInformation()) || {};
      if (appInfo.notificationUUID !== notificationUUID) {
        AccountService.doRegisterNotificationInfo(null, notificationUUID, appInfo.intercomUserId).then(() => {
          userInformation.notificationUUID = notificationUUID;
          return UserModel.doUpdateUserInfo(userInformation);
        }).catch(error => {
          console.log('DataProcessor doRegisterNotificationInfo error:', error);
        });
      }
    } else {
      if (notificationUUID && userInformation.notificationUUID !== notificationUUID) {
        AccountService.doRegisterNotificationInfo(userInformation.bitmarkAccountNumber, notificationUUID, userInformation.intercomUserId).then(() => {
          userInformation.notificationUUID = notificationUUID;
          return UserModel.doUpdateUserInfo(userInformation);
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
  if (!justCreatedBitmarkAccount && userInformation && userInformation.bitmarkAccountNumber) {
    await AccountService.doCheckNotificationPermission();
  }
  return userInformation;
};

const doCreateAccount = async (touchFaceIdSession) => {
  let userInformation = await AccountService.doGetCurrentAccount(touchFaceIdSession);
  await checkAppNeedResetLocalData();

  let signatureData = await CommonModel.doCreateSignatureData(touchFaceIdSession);
  await AccountModel.doTryRegisterAccount(userInformation.bitmarkAccountNumber, signatureData.timestamp, signatureData.signature);
  if (notificationUUID) {
    let intercomUserId = `HealthPlus_${sha3_256(userInformation.bitmarkAccountNumber)}`;
    userInformation.intercomUserId = intercomUserId;
    AccountService.doRegisterNotificationInfo(userInformation.bitmarkAccountNumber, notificationUUID, intercomUserId).then(() => {
      userInformation.notificationUUID = notificationUUID;
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

const doLogin = async (touchFaceIdSession) => {
  userInformation = await AccountService.doGetCurrentAccount(touchFaceIdSession);
  let signatureData = await CommonModel.doCreateSignatureData(touchFaceIdSession);
  await AccountModel.doTryRegisterAccount(userInformation.bitmarkAccountNumber, signatureData.timestamp, signatureData.signature);
  await checkAppNeedResetLocalData();
  return userInformation;
};

const doLogout = async () => {
  let result = await AccountModel.doLogout(jwt);
  if (!result) {
    return null;
  }
  if (userInformation.notificationUUID) {
    let signatureData = await CommonModel.doTryCreateSignatureData(i18n.t('FaceTouchId_doLogout'))
    await AccountService.doTryDeregisterNotificationInfo(userInformation.bitmarkAccountNumber, userInformation.notificationUUID, signatureData);
  }
  PushNotificationIOS.cancelAllLocalNotifications();
  let accesses = await doGetAccountAccesses();
  for (let grantedInfo of (accesses.granted_from || [])) {
    let timestamp = moment().toDate().getTime();
    let message = `accessGrant|${grantedInfo.id}|${userInformation.bitmarkAccountNumber}|${timestamp}`;
    let signatures = await CommonModel.doTryRickSignMessage([message], CommonModel.getFaceTouchSessionId());
    await AccountModel.doRemoveGrantingAccess(grantedInfo.grantor, grantedInfo.grantee, userInformation.bitmarkAccountNumber, timestamp, signatures[0]);
  }
  for (let grantedInfo of (accesses.granted_to || [])) {
    let timestamp = moment().toDate().getTime();
    let message = `accessGrant|${grantedInfo.id}|${userInformation.bitmarkAccountNumber}|${timestamp}`;
    let signatures = await CommonModel.doTryRickSignMessage([message], CommonModel.getFaceTouchSessionId());
    await AccountModel.doRemoveGrantingAccess(grantedInfo.grantor, grantedInfo.grantee, userInformation.bitmarkAccountNumber, timestamp, signatures[0]);
  }
  CommonModel.resetFaceTouchSessionId();
  await UserModel.doRemoveUserInfo();
  await FileUtil.removeSafe(`${FileUtil.CacheDirectory}/${userInformation.bitmarkAccountNumber}`);
  await Intercom.logout();
  UserBitmarksStore.dispatch(UserBitmarksActions.reset());
  DataAccountAccessesStore.dispatch(DataAccountAccessesActions.reset());
  mapModalDisplayData = {};
  keyIndexModalDisplaying = 0;
  grantedAccessAccountSelected = null;
  userInformation = {};
  return true;
};

const doRequireHealthKitPermission = async () => {
  let result = await HealthKitService.initHealthKit();
  userInformation.activeHealthDataAt = moment().toDate().toISOString();
  await UserModel.doUpdateUserInfo(userInformation);

  let dateNotification = HealthKitService.getNextSunday11AM();
  PushNotificationIOS.scheduleLocalNotification({
    fireDate: dateNotification.toDate(),
    alertTitle: '',
    alertBody: i18n.t('Notification_weeklyHealthDataNotification'),
    repeatInterval: 'week'
  });

  let emptyHealthKitData = await HealthKitService.doCheckEmptyDataSource();
  if (emptyHealthKitData) {
    EventEmitterService.emit(EventEmitterService.events.CHECK_DATA_SOURCE_HEALTH_KIT_EMPTY);
  }
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
  userInformation.restActiveHealthDataAt = restActiveHealthDataAt;
  await UserModel.doUpdateUserInfo(userInformation);

  let dateNotification = HealthKitService.getNextSunday11AM();
  PushNotificationIOS.scheduleLocalNotification({
    fireDate: dateNotification.toDate(),
    alertTitle: '',
    alertBody: i18n.t('Notification_weeklyHealthDataNotification'),
    repeatInterval: 'week'
  });
};

const doDeactiveApplication = async () => {
  stopInterval();
};

const doOpenApp = async (justCreatedBitmarkAccount) => {
  // await UserModel.doRemoveUserInfo();
  // runPromiseWithoutError(iCloudSyncAdapter.syncCloud());

  userInformation = await UserModel.doTryGetCurrentUser();
  let appInfo = await doGetAppInformation();
  appInfo = appInfo || {};


  if (!appInfo.trackEvents || !appInfo.trackEvents['health_plus_download']) {
    appInfo.trackEvents = appInfo.trackEvents || {};
    appInfo.trackEvents['health_plus_download'] = true;
    await CommonModel.doSetLocalData(CommonModel.KEYS.APP_INFORMATION, appInfo);

    await CommonModel.doTrackEvent({
      event_name: 'health_plus_download',
      account_number: userInformation ? userInformation.bitmarkAccountNumber : null,
    });
  }

  if (userInformation && userInformation.bitmarkAccountNumber && !!CommonModel.getFaceTouchSessionId()) {
    await FileUtil.mkdir(`${FileUtil.CacheDirectory}/${userInformation.bitmarkAccountNumber}`);
    await FileUtil.mkdir(`${FileUtil.DocumentDirectory}/assets-session-data/${userInformation.bitmarkAccountNumber}`);

    await moveOldDataFilesToNewLocalStorageFolder();
    await initializeLocalStorage();
    await initializeIndexedDB();

    iCloudSyncAdapter.oniCloudFileChanged((mapFiles) => {
      for (let key in mapFiles) {
        let keyList = key.split('_');
        let promiseRunAfterCopyFile;
        let overwrite = false;
        if (keyList[0] === userInformation.bitmarkAccountNumber) {
          let keyFilePath;
          if (keyList[1] === 'assets') {
            let assetId = base58.decode(keyList[2]).toString('hex');
            keyFilePath = key.replace(`${userInformation.bitmarkAccountNumber}_assets_${keyList[2]}_`, `${userInformation.bitmarkAccountNumber}/assets/${assetId}/downloaded/`);
          } else if (keyList[1] === 'thumbnails') {
            keyFilePath = key.replace(`${userInformation.bitmarkAccountNumber}_thumbnails_`, `${userInformation.bitmarkAccountNumber}/thumbnails/`);
          } else if (keyList[1] === 'indexedData') {
            keyFilePath = key.replace(`${userInformation.bitmarkAccountNumber}_indexedData_`, `${userInformation.bitmarkAccountNumber}/indexedData/`);
          } else if (keyList[1] === 'indexTag') {
            keyFilePath = key.replace(`${userInformation.bitmarkAccountNumber}_indexTag_`, `${userInformation.bitmarkAccountNumber}/indexTag/`);
            let bitmarkId = keyList[2].replace('.txt', '');
            overwrite = true;
            promiseRunAfterCopyFile = async () => {
              await doUpdateIndexTagFromICloud(bitmarkId);
            };
          }
          let doSyncFile = async () => {
            let filePath = mapFiles[key];
            let downloadedFile = `${FileUtil.DocumentDirectory}/${keyFilePath}`;
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
    });
    iCloudSyncAdapter.syncCloud();
    configNotification();
    if (!userInformation.intercomUserId) {
      let intercomUserId = `HealthPlus_${sha3_256(userInformation.bitmarkAccountNumber)}`;
      userInformation.intercomUserId = intercomUserId;
      await UserModel.doUpdateUserInfo(userInformation);
      Intercom.logout().then(() => {
        return Intercom.registerIdentifiedUser({ userId: intercomUserId })
      }).catch(error => {
        console.log('registerIdentifiedUser error :', error);
      });
    }
    configNotification();

    let signatureData = await CommonModel.doCreateSignatureData(CommonModel.getFaceTouchSessionId());
    let result = await AccountModel.doRegisterJWT(userInformation.bitmarkAccountNumber, signatureData.timestamp, signatureData.signature);
    jwt = result.jwt_token;

    if (justCreatedBitmarkAccount) {
      await AccountModel.doMarkMigration(jwt);
      userInformation.didMigrationFileToLocalStorage = true;
      appInfo.displayedWhatNewInformation = DeviceInfo.getVersion();
      await CommonModel.doSetLocalData(CommonModel.KEYS.APP_INFORMATION, appInfo);
    } else if (!userInformation.didMigrationFileToLocalStorage) {
      userInformation.didMigrationFileToLocalStorage = await AccountModel.doCheckMigration(jwt);
      if (!userInformation.didMigrationFileToLocalStorage && !isDisplayingModal(mapModalDisplayKeyIndex.local_storage_migration)) {
        updateModal(mapModalDisplayKeyIndex.local_storage_migration, true);
      }
      if (!appInfo.displayedWhatNewInformation || compareVersion(appInfo.displayedWhatNewInformation, DeviceInfo.getVersion(), 2) < 0) {
        updateModal(mapModalDisplayKeyIndex.what_new, true);
      }
    }
    await UserModel.doUpdateUserInfo(userInformation);

    let userBitmarks = await doGetUserDataBitmarks(grantedAccessAccountSelected ? grantedAccessAccountSelected.grantor : userInformation.bitmarkAccountNumber);

    if (!grantedAccessAccountSelected && !userInformation.activeHealthDataAt &&
      userBitmarks && userBitmarks.healthDataBitmarks && userBitmarks.healthDataBitmarks.length > 0) {
      await runPromiseWithoutError(doRequireHealthKitPermission());
    }

    UserBitmarksStore.dispatch(UserBitmarksActions.initBitmarks(userBitmarks || {}));
    DataAccountAccessesStore.dispatch(DataAccountAccessesActions.init(await doGetAccountAccesses()));
    await checkAppNeedResetLocalData(appInfo);

    AccountService.removeAllDeliveredNotifications();
    PushNotificationIOS.cancelAllLocalNotifications();
    if (userInformation.activeHealthDataAt) {
      let dateNotification = HealthKitService.getNextSunday11AM();
      PushNotificationIOS.scheduleLocalNotification({
        fireDate: dateNotification.toDate(),
        alertTitle: '',
        alertBody: i18n.t('Notification_weeklyHealthDataNotification'),
        repeatInterval: 'week'
      });
    }
  } else if (!userInformation || !userInformation.bitmarkAccountNumber) {
    let intercomUserId = appInfo.intercomUserId || `HealthPlus_${sha3_256(moment().toDate().getTime() + randomString({ length: 8 }))}`;
    if (!appInfo.intercomUserId) {
      appInfo.intercomUserId = intercomUserId;
      Intercom.logout().then(() => {
        return Intercom.registerIdentifiedUser({ userId: intercomUserId })
      }).catch(error => {
        console.log('registerIdentifiedUser error :', error);
      });
      CommonModel.doSetLocalData(CommonModel.KEYS.APP_INFORMATION, appInfo);
    } else {
      Intercom.registerIdentifiedUser({ userId: intercomUserId }).catch(error => {
        console.log('registerIdentifiedUser error :', error);
      });
    }

    configNotification();
  }

  EventEmitterService.emit(EventEmitterService.events.APP_LOADING_DATA, isLoadingData);
  console.log('userInformation :', userInformation);
  return userInformation;
};

const doBitmarkHealthData = async (touchFaceIdSession, list) => {
  let results = await HealthKitService.doBitmarkHealthData(touchFaceIdSession, userInformation.bitmarkAccountNumber, list);

  let appInfo = await doGetAppInformation();
  appInfo = appInfo || {};
  if (appInfo && (!appInfo.lastTimeIssued ||
    (appInfo.lastTimeIssued && (moment().toDate().getTime() - appInfo.lastTimeIssued) > 7 * 24 * 60 * 60 * 1000))) {
    await CommonModel.doTrackEvent({
      event_name: 'health_plus_weekly_active_user',
      account_number: userInformation ? userInformation.bitmarkAccountNumber : null,
    });
    appInfo.lastTimeIssued = moment().toDate().getTime();
    await CommonModel.doSetLocalData(CommonModel.KEYS.APP_INFORMATION, appInfo);
  }

  let grantedInformationForOtherAccount = await doGetAccountAccesses('granted_to');
  if (grantedInformationForOtherAccount && grantedInformationForOtherAccount.length > 0) {
    let body = { items: [] };
    for (let grantedInfo of grantedInformationForOtherAccount) {
      for (let record of results) {
        let sessionData = await BitmarkSDK.createSessionDataFromLocalForRecipient(touchFaceIdSession, record.id, record.sessionData, grantedInfo.grantee);
        body.items.push({
          bitmark_id: record.id,
          session_data: sessionData,
          to: grantedInfo.grantee,
          start_at: Math.floor(moment().toDate().getTime() / 1000),
          duration: { Years: 99 }
        });
      }
    }
    let timestamp = moment().toDate().getTime();
    let message = `accessGrant||${userInformation.bitmarkAccountNumber}|${timestamp}`;
    let signatures = await CommonModel.doTryRickSignMessage([message], touchFaceIdSession);
    await BitmarkModel.doAccessGrants(userInformation.bitmarkAccountNumber, timestamp, signatures[0], body);
  }

  for (let item of results) {
    await insertHealthDataToIndexedDB(item.id, item.healthData);
  }

  await runGetUserBitmarksInBackground();
  return results;
};

const doMarkDoneBitmarkHealthData = () => {
  updateModal(mapModalDisplayKeyIndex.weekly_health_data);
};

const doDownloadBitmark = async (touchFaceIdSession, bitmarkIdOrGrantedId, assetId) => {
  let bitmarkAccountNumber = grantedAccessAccountSelected ? grantedAccessAccountSelected.grantor : userInformation.grantedAccessAccountSelected;
  let assetFolderPath = `${getLocalAssetsFolderPath(bitmarkAccountNumber)}/${assetId}`;
  let downloadedFolder = `${assetFolderPath}/downloaded`;
  await FileUtil.mkdir(assetFolderPath);
  await FileUtil.mkdir(downloadedFolder);

  if (grantedAccessAccountSelected) {
    await BitmarkSDK.downloadBitmarkWithGrantId(touchFaceIdSession, bitmarkIdOrGrantedId, downloadedFolder);
  } else {
    await BitmarkSDK.downloadBitmark(touchFaceIdSession, bitmarkIdOrGrantedId, downloadedFolder);
  }

  let list = await FileUtil.readDir(downloadedFolder);
  return `${downloadedFolder}/${list[0]}`;
};

const doDownloadHealthDataBitmark = async (touchFaceIdSession, bitmarkIdOrGrantedId, assetId) => {
  let bitmarkAccountNumber = grantedAccessAccountSelected ? grantedAccessAccountSelected.grantor : userInformation.grantedAccessAccountSelected;
  let assetFolderPath = `${getLocalAssetsFolderPath(bitmarkAccountNumber)}/${assetId}`;
  let downloadedFolder = `${assetFolderPath}/downloaded`;
  await FileUtil.mkdir(assetFolderPath);
  await FileUtil.mkdir(downloadedFolder);

  if (grantedAccessAccountSelected) {
    await BitmarkSDK.downloadBitmarkWithGrantId(touchFaceIdSession, bitmarkIdOrGrantedId, downloadedFolder);
  } else {
    await BitmarkSDK.downloadBitmark(touchFaceIdSession, bitmarkIdOrGrantedId, downloadedFolder);
  }

  let list = await FileUtil.readDir(downloadedFolder);
  let accountFilePath = `${downloadedFolder}/${list[0]}`;
  await FileUtil.unzip(accountFilePath, downloadedFolder);
  await FileUtil.removeSafe(accountFilePath);

  let listFile = await FileUtil.readDir(downloadedFolder);
  let result = await FileUtil.readFile(downloadedFolder + '/' + listFile[0]);
  return result;
};

const doIssueFile = async (touchFaceIdSession, filePath, assetName, metadataList, quantity, isPublicAsset = false, isMultipleAsset = false) => {
  let results = await BitmarkService.doIssueFile(touchFaceIdSession, userInformation.bitmarkAccountNumber, filePath, assetName, metadataList, quantity, isPublicAsset);

  let appInfo = await doGetAppInformation();
  appInfo = appInfo || {};
  if (appInfo && (!appInfo.lastTimeIssued ||
    (appInfo.lastTimeIssued && (moment().toDate().getTime() - appInfo.lastTimeIssued) > 7 * 24 * 60 * 60 * 1000))) {
    await CommonModel.doTrackEvent({
      event_name: 'health_plus_weekly_active_user',
      account_number: userInformation ? userInformation.bitmarkAccountNumber : null,
    });
    appInfo.lastTimeIssued = moment().toDate().getTime();
    await CommonModel.doSetLocalData(CommonModel.KEYS.APP_INFORMATION, appInfo);
  }

  let grantedInformationForOtherAccount = await doGetAccountAccesses('granted_to');
  if (grantedInformationForOtherAccount && grantedInformationForOtherAccount.length > 0) {
    let body = { items: [] };
    for (let grantedInfo of grantedInformationForOtherAccount) {
      for (let record of results) {
        let sessionData = await BitmarkSDK.createSessionDataFromLocalForRecipient(touchFaceIdSession, record.id, record.sessionData, grantedInfo.grantee);
        body.items.push({
          bitmark_id: record.id,
          session_data: sessionData,
          to: grantedInfo.grantee,
          start_at: Math.floor(moment().toDate().getTime() / 1000),
          duration: { Years: 99 }
        });
      }
    }
    let timestamp = moment().toDate().getTime();
    let message = `accessGrant||${userInformation.bitmarkAccountNumber}|${timestamp}`;
    let signatures = await CommonModel.doTryRickSignMessage([message], touchFaceIdSession);
    await BitmarkModel.doAccessGrants(userInformation.bitmarkAccountNumber, timestamp, signatures[0], body);
  }
  for (let record of results) {
    await generateThumbnail(filePath, record.id, isMultipleAsset);

    // Index data
    if (isImageFile(record.filePath)) {
      let detectResult = await populateAssetNameFromImage(record.filePath, assetName);
      await insertDetectedDataToIndexedDB(record.id, assetName, metadataList, detectResult.detectedTexts);
    } else if (isPdfFile(record.filePath)) {
      let detectResult = await populateAssetNameFromPdf(record.filePath, assetName);
      await insertDetectedDataToIndexedDB(record.id, assetName, metadataList, detectResult.detectedTexts);
    }
  }

  await doReloadUserData();
  return results;
};

const doIssueMultipleFiles = async (touchFaceIdSession, listInfo) => {
  let results = [];
  for (let info of listInfo) {
    let result = await doIssueFile(touchFaceIdSession, info.filePath, info.assetName, info.metadataList, info.quantity, info.isPublicAsset, info.isMultipleAsset);
    results.push(result[0]);
  }
  return results;
};

const getUserInformation = () => {
  return userInformation;
};

const getApplicationVersion = () => {
  return DeviceInfo.getVersion();
};

const getApplicationBuildNumber = () => {
  return DeviceInfo.getBuildNumber();
};

const doGetUserDataBitmarks = (bitmarkAccountNumber) => {
  bitmarkAccountNumber = bitmarkAccountNumber || userInformation.bitmarkAccountNumber;
  return new Promise((resolve) => {
    CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_BITMARK).then(userDataBitmarks => {
      resolve(userDataBitmarks[bitmarkAccountNumber]);
    }).catch((error => {
      console.log('doGetUserDataBitmarks error:', error);
      resolve();
    }));
  });
};

const doGetAccountAccesses = (type) => {
  return new Promise((resolve) => {
    CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_ACCOUNT_ACCESSES).then((accesses) => {
      if (!accesses) {
        return resolve();
      }
      if (type) {
        //TODO field
        return resolve(accesses[type]);
      }
      resolve(accesses);
    }).catch((error => {
      console.log('doGetAccountAccesses error:', error);
      resolve();
    }));

  });
};

const doCheckFileToIssue = async (filePath) => {
  let result = await BitmarkService.doCheckFileToIssue(filePath, userInformation.bitmarkAccountNumber);
  let canIssue = true;
  if (result && result.asset && result.asset.name) {
    if (result.asset.registrant === userInformation.bitmarkAccountNumber) {
      let userBitmarks = await doGetUserDataBitmarks(userInformation.bitmarkAccountNumber);
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

// const doGrantingAccess = async () => {
//   return await AccountModel.doGrantingAccess(jwt);
// };

// const getAccountAccessSelected = () => {
//   return grantedAccessAccountSelected ? grantedAccessAccountSelected.grantor : null;
// };
// const getGrantedAccessAccountSelected = () => {
//   return grantedAccessAccountSelected;
// };

// const doSelectAccountAccess = async (accountNumber) => {
//   if (accountNumber === userInformation.bitmarkAccountNumber) {
//     UserBitmarksStore.dispatch(UserBitmarksActions.initBitmarks((await doGetUserDataBitmarks(userInformation.bitmarkAccountNumber)) || {}));
//     grantedAccessAccountSelected = null;
//     return true;
//   }
//   let accesses = await runGetAccountAccessesInBackground();
//   if (accesses && accesses.granted_from) {
//     grantedAccessAccountSelected = (accesses.granted_from || []).find(item => item.grantor === accountNumber);
//     if (grantedAccessAccountSelected) {
//       UserBitmarksStore.dispatch(UserBitmarksActions.reset());
//       await runGetUserBitmarksInBackground(grantedAccessAccountSelected.grantor, grantedAccessAccountSelected.granted_at);
//       return true;
//     }
//   }
//   return false;
// };

// const doReceivedAccessQRCode = async (token) => {
//   return await AccountModel.doReceiveGrantingAccess(jwt, token, { "update_grantee": true });
// };

// const doRemoveGrantingAccess = async (grantee) => {
//   let result = await AccountModel.doRemoveGrantingAccess(userInformation.bitmarkAccountNumber, grantee);
//   await runGetAccountAccessesInBackground();
//   return result;
// };

// const doCancelGrantingAccess = async (token) => {
//   let result = await AccountModel.doCancelGrantingAccess(jwt, token);
//   await runGetAccountAccessesInBackground();
//   return result;
// };

// const doConfirmGrantingAccess = async (touchFaceIdSession, token, grantee) => {
//   let userBitmarks = await doGetUserDataBitmarks(userInformation.bitmarkAccountNumber);
//   if (userBitmarks && (userBitmarks.healthDataBitmarks || userBitmarks.healthAssetBitmarks)) {
//     let body = { items: [] };

//     let doGetSessionData = async (bitmarkAccountNumber, assetId) => {
//       let filePath = FileUtil.DocumentDirectory + '/assets-session-data/' + bitmarkAccountNumber + '/' + assetId + '/session_data.txt';
//       let exist = await runPromiseWithoutError(FileUtil.exists(filePath));
//       if (exist && !exist.error) {
//         let content = await FileUtil.readFile(filePath);
//         if (content) {
//           try {
//             return JSON.parse(content);
//           } catch (error) {
//             //
//           }
//         }
//       }
//       return null;
//     };

//     for (let bitmark of (userBitmarks.healthDataBitmarks || [])) {
//       let sessionData = await doGetSessionData(userInformation.bitmarkAccountNumber, bitmark.asset_id);
//       if (sessionData) {
//         let granteeSessionData = await BitmarkSDK.createSessionDataFromLocalForRecipient(touchFaceIdSession, bitmark.id, sessionData, grantee);
//         body.items.push({
//           bitmark_id: bitmark.id,
//           session_data: granteeSessionData,
//           to: grantee,
//           start_at: Math.floor(moment().toDate().getTime() / 1000),
//           duration: { Years: 99 }
//         });
//       } else if (bitmark.status === 'confirmed') {
//         let granteeSessionData = await BitmarkSDK.createSessionDataForRecipient(touchFaceIdSession, bitmark.id, grantee);
//         body.items.push({
//           bitmark_id: bitmark.id,
//           session_data: granteeSessionData,
//           to: grantee,
//           start_at: Math.floor(moment().toDate().getTime() / 1000),
//           duration: { Years: 99 }
//         });
//       }
//     }
//     for (let bitmark of (userBitmarks.healthAssetBitmarks || [])) {
//       let sessionData = await doGetSessionData(userInformation.bitmarkAccountNumber, bitmark.asset_id);
//       if (sessionData) {
//         let granteeSessionData = await BitmarkSDK.createSessionDataFromLocalForRecipient(touchFaceIdSession, bitmark.id, sessionData, grantee);
//         body.items.push({
//           bitmark_id: bitmark.id,
//           session_data: granteeSessionData,
//           to: grantee,
//           start_at: Math.floor(moment().toDate().getTime() / 1000),
//           duration: { Years: 99 }
//         });
//       } else if (bitmark.status === 'confirmed') {
//         let granteeSessionData = await BitmarkSDK.createSessionDataForRecipient(touchFaceIdSession, bitmark.id, grantee);
//         body.items.push({
//           bitmark_id: bitmark.id,
//           session_data: granteeSessionData,
//           to: grantee,
//           start_at: Math.floor(moment().toDate().getTime() / 1000),
//           duration: { Years: 99 }
//         });
//       }
//     }

//     let timestamp = moment().toDate().getTime();
//     let message = `accessGrant||${userInformation.bitmarkAccountNumber}|${timestamp}`;
//     let signatures = await CommonModel.doTryRickSignMessage([message], touchFaceIdSession);
//     await BitmarkModel.doAccessGrants(userInformation.bitmarkAccountNumber, timestamp, signatures[0], body);
//   }
//   await AccountModel.doReceiveGrantingAccess(jwt, token, { status: "completed" });

//   return await runGetAccountAccessesInBackground();
// };
const doDeleteAccount = async () => {
  return await AccountModel.doDeleteAccount(jwt);
};

const doAcceptEmailRecords = async (touchFaceIdSession, emailRecord) => {
  for (let item of emailRecord.list) {
    if (!item.existingAsset) {
      await doIssueFile(touchFaceIdSession, item.filePath, item.assetName, item.metadata, 1);
    }
  }
  for (let id of emailRecord.ids) {
    await FileUtil.removeSafe(`${FileUtil.CacheDirectory}/${userInformation.bitmarkAccountNumber}/email_records/${id}`);
    await AccountModel.doDeleteEmailRecord(jwt, id);
  }
};

const doRejectEmailRecords = async (emailRecord) => {
  for (let id of emailRecord.ids) {
    await FileUtil.removeSafe(`${FileUtil.CacheDirectory}/${userInformation.bitmarkAccountNumber}/email_records/${id}`);
    await AccountModel.doDeleteEmailRecord(jwt, id);
  }
};

const doMigrateFilesToLocalStorage = async () => {
  await runGetUserBitmarksInBackground();
  // await runGetAccountAccessesInBackground();

  let currentSessionId = CommonModel.getFaceTouchSessionId();

  let userBitmarks = await doGetUserDataBitmarks(userInformation.bitmarkAccountNumber);
  userBitmarks = userBitmarks || {};
  let bitmarks = (userBitmarks.healthAssetBitmarks || []).concat(userBitmarks.healthDataBitmarks || []);
  let total = 0;
  for (let bitmark of bitmarks) {
    let assetFolderPath = `${getLocalAssetsFolderPath(userInformation.bitmarkAccountNumber)}/${bitmark.asset_id}`;
    let existAssetFolder = await runPromiseWithoutError(FileUtil.exists(assetFolderPath));
    let needDownload = false;
    if (!existAssetFolder || existAssetFolder.error) {
      needDownload = true;
    } else {
      let list = await FileUtil.readDir(assetFolderPath);
      if (list.length === 0 || (list.findIndex(filename => filename.startsWith('downloading')) >= 0)) {
        needDownload = true;
      } else if ((await FileUtil.exists(`${assetFolderPath}/downloaded`))) {
        let listFileDownloaded = await FileUtil.readDir(`${assetFolderPath}/downloaded`);
        needDownload = !listFileDownloaded || listFileDownloaded.length < 0;
      }
    }
    if (needDownload) {
      await FileUtil.mkdir(assetFolderPath);
      let downloadingFolderPath = `${assetFolderPath}/downloading`;
      await FileUtil.mkdir(downloadingFolderPath);
      let result = await runPromiseWithoutError(BitmarkSDK.downloadBitmark(currentSessionId, bitmark.id, downloadingFolderPath));
      if (!result || !result.error) {
        let listDownloadFile = await FileUtil.readDir(downloadingFolderPath);
        let filePathAfterDownloading = `${downloadingFolderPath}/${listDownloadFile[0]}`;

        let downloadedFolderPath = `${assetFolderPath}/downloaded`;
        await FileUtil.mkdir(downloadedFolderPath);
        let downloadedFilePath = `${downloadedFolderPath}${filePathAfterDownloading.substring(filePathAfterDownloading.lastIndexOf('/'), filePathAfterDownloading.length)}`;
        await FileUtil.moveFileSafe(filePathAfterDownloading, downloadedFilePath);
        await FileUtil.removeSafe(downloadingFolderPath);

        if (isHealthDataRecord(bitmark.asset)) {
          await FileUtil.unzip(downloadedFilePath, downloadedFolderPath);
          await FileUtil.removeSafe(downloadedFilePath);
          let listUnzipFile = await FileUtil.readDir(downloadedFolderPath);

          bitmark.asset.filePath = `${downloadedFolderPath}/${listUnzipFile[0]}`;
        } else {
          bitmark.asset.filePath = `${downloadedFilePath}`;
        }
      }
    }
    // Create thumbnail if not exist
    if (!checkThumbnailForBitmark(bitmark.id).exists) {
      await generateThumbnail(bitmark.asset.filePath, bitmark.id);
    }

    // Create search indexed data if not exist
    let isExistIndexedData = await checkExistIndexedDataForBitmark(bitmark.id);
    if (!isExistIndexedData) {
      if (isHealthDataRecord(bitmark.asset)) {
        let data = await FileUtil.readFile(bitmark.asset.filePath);
        await insertHealthDataToIndexedDB(bitmark.id, {
          assetMetadata: bitmark.asset.metadata,
          assetName: bitmark.asset.name,
          data,
        });
      } else if (isAssetDataRecord(bitmark.asset)) {
        if (isImageFile(bitmark.asset.filePath)) {
          let detectResult = await populateAssetNameFromImage(bitmark.asset.filePath);
          await insertDetectedDataToIndexedDB(bitmark.id, bitmark.asset.name, bitmark.asset.metadata, detectResult.detectedTexts);
        } else if (isPdfFile(bitmark.asset.filePath)) {
          let detectResult;
          if (isCaptureDataRecord(bitmark.asset)) {
            let detectedTexts = await detectTextsFromPdf(bitmark.asset.filePath);
            detectResult = { detectedTexts };
          } else {
            detectResult = await populateAssetNameFromPdf(bitmark.asset.filePath);
          }
          await insertDetectedDataToIndexedDB(bitmark.id, bitmark.asset.name, bitmark.asset.metadata, detectResult.detectedTexts);
        }
      }
    }

    EventEmitterService.emit(EventEmitterService.events.APP_MIGRATION_FILE_LOCAL_STORAGE_PERCENT, Math.floor(total * 100 / bitmarks.length));
    total++;
  }
  await runGetUserBitmarksInBackground();

  EventEmitterService.emit(EventEmitterService.events.APP_MIGRATION_FILE_LOCAL_STORAGE_PERCENT, 100);
  userInformation.didMigrationFileToLocalStorage = true;
  await UserModel.doUpdateUserInfo(userInformation);
};

const detectLocalAssetFilePath = async (assetId) => {
  let assetFolderPath = `${getLocalAssetsFolderPath(userInformation.bitmarkAccountNumber)}/${assetId}`;
  let existAssetFolder = await runPromiseWithoutError(FileUtil.exists(assetFolderPath));
  if (!existAssetFolder || existAssetFolder.error) {
    return null;
  }
  let downloadedFolder = `${assetFolderPath}/downloaded`;
  let existDownloadedFolder = await runPromiseWithoutError(FileUtil.exists(downloadedFolder));
  if (!existDownloadedFolder || existDownloadedFolder.error) {
    return null;
  }
  let list = await FileUtil.readDir(`${assetFolderPath}/downloaded`);
  return `${assetFolderPath}/downloaded/${list[0]}`;
};

const doCombineImages = async (images) => {
  let listFilePath = [];
  for (let imageInfo of images) {
    listFilePath.push(imageInfo.uri.replace('file://', ''));
  }
  let tempFolderPath = `${FileUtil.CacheDirectory}/${userInformation.bitmarkAccountNumber}/combine-images`;
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
      let userInfo = userInformation || await UserModel.doTryGetCurrentUser() || {};

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
  mountedRouter = true;
  checkDisplayModal();
};

let setCodePushUpdated = (updated) => {
  console.log('setCodePushUpdated :', updated);
  codePushUpdated = !!updated;
};

let doCheckHaveCodePushUpdate = () => {
  return new Promise((resolve) => {
    let checkHaveCodePushUpdate = () => {
      if (codePushUpdated === true || codePushUpdated === false) {
        return resolve(codePushUpdated);
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
  keyIndexModalDisplaying = 0;
  await CommonModel.doSetLocalData(CommonModel.KEYS.APP_INFORMATION, appInfo);
};
const doDisplayedWhatNewInformation = async () => {
  updateModal(mapModalDisplayKeyIndex.what_new, true);
};
let doMarkDoneMigration = () => {
  updateModal(mapModalDisplayKeyIndex.local_storage_migration);
};

const doTransferBitmark = async (touchFaceIdSession, bitmark, receiver) => {
  let filename = bitmark.asset.filePath.substring(bitmark.asset.filePath.lastIndexOf('/') + 1, bitmark.asset.filePath.length);
  let result = await BitmarkService.doTransferBitmark(touchFaceIdSession, bitmark.id, receiver);
  await FileUtil.removeSafe(`${FileUtil.DocumentDirectory}/${userInformation.bitmarkAccountNumber}/assets/${bitmark.asset_id}`);
  await iCloudSyncAdapter.deleteFileFromCloud(`${userInformation.bitmarkAccountNumber}_assets_${base58.encode(new Buffer(bitmark.asset.id, 'hex'))}_${filename}`);
  if (bitmark.thumbnail && bitmark.thumbnail.path && (await FileUtil.exists(bitmark.thumbnail.path))) {
    let filename = bitmark.thumbnail.path.substring(bitmark.thumbnail.path.lastIndexOf('/') + 1, bitmark.thumbnail.path.length);
    await iCloudSyncAdapter.deleteFileFromCloud(`${userInformation.bitmarkAccountNumber}_thumbnails_${filename}`);
  }
  iCloudSyncAdapter.deleteFileFromCloud(`${userInformation.bitmarkAccountNumber}_indexedData_${bitmark.asset.id}.txt`);
  iCloudSyncAdapter.deleteFileFromCloud(`${userInformation.bitmarkAccountNumber}_indexTag_${bitmark.id}.txt`);

  await deleteIndexedDataByBitmarkId(bitmark.id);
  await deleteTagsByBitmarkId(bitmark.id);
  await doReloadUserData();
  return result;
};

const DataProcessor = {
  doOpenApp,
  doCreateAccount,
  doLogin,
  doLogout,
  doStartBackgroundProcess,
  doReloadUserData,

  doRequireHealthKitPermission,
  doResetHealthDataTasks,
  doDeactiveApplication,
  doBitmarkHealthData,
  doMarkDoneBitmarkHealthData,
  doDownloadBitmark,
  doIssueFile,
  doIssueMultipleFiles,

  doCheckFileToIssue,

  getApplicationVersion,
  getApplicationBuildNumber,
  getUserInformation,
  finishedDisplayEmailRecords,
  isAppLoadingData: () => isLoadingData,

  // doGrantingAccess,
  // doGetAccountAccesses,
  // doSelectAccountAccess,
  // getAccountAccessSelected,
  // getGrantedAccessAccountSelected,
  // doReceivedAccessQRCode,
  // doCancelGrantingAccess,
  // doRemoveGrantingAccess,
  // doConfirmGrantingAccess,
  doDownloadHealthDataBitmark,
  doDeleteAccount,
  doAcceptEmailRecords,
  doRejectEmailRecords,
  doMigrateFilesToLocalStorage,
  detectLocalAssetFilePath,
  doCombineImages,
  doMetricOnScreen,
  checkDisplayModal,
  setMountedRouter,
  setCodePushUpdated,
  doCheckHaveCodePushUpdate,
  doMarkDisplayedWhatNewInformation,
  doDisplayedWhatNewInformation,
  doMarkDoneMigration,
  doTransferBitmark,
};

export { DataProcessor };

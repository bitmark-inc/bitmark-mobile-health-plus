import DeviceInfo from 'react-native-device-info';
import Intercom from 'react-native-intercom';
import moment from 'moment';
import { Actions } from 'react-native-router-flux';
import ReactNative from 'react-native';
const {
  PushNotificationIOS,
} = ReactNative;

import {
  EventEmitterService,
  BitmarkService,
  AccountService,
} from "../services";
import { CommonModel, AccountModel, UserModel, BitmarkSDK, BitmarkModel } from '../models';
import { HealthKitService } from '../services/health-kit-service';
import { config } from '../configs';
import { FileUtil } from '../utils';

let userInformation = {};
let grantedAccessAccountSelected = null;
let jwt;
let websocket;
let isLoadingData = false;

const isHealthDataBitmark = (name) => {
  var regResults = /HK((\d)*)/.exec(name);
  if (regResults && regResults.length > 1) {
    let randomNumber = regResults[1];
    return ((randomNumber.length == 8) && ('HK' + randomNumber) === name);
  }
  return false;
};

const isHealthAssetBitmark = (name) => {
  var regResults = /HA((\d)*)/.exec(name);
  if (regResults && regResults.length > 1) {
    let randomNumber = regResults[1];
    return ((randomNumber.length == 8) && ('HA' + randomNumber) === name);
  }
  return false;
};


// ================================================================================================================================================

const doCheckNewUserDataBitmarks = async (healthDataBitmarks, healthAssetBitmarks, bitmarkAccountNumber) => {
  bitmarkAccountNumber = bitmarkAccountNumber || userInformation.bitmarkAccountNumber;
  let userDataBitmarks = await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_BITMARK) || {};
  userDataBitmarks[bitmarkAccountNumber] = { healthDataBitmarks, healthAssetBitmarks };

  await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_BITMARK, userDataBitmarks);
  EventEmitterService.emit(EventEmitterService.events.CHANGE_USER_DATA_BITMARKS, { healthDataBitmarks, healthAssetBitmarks, bitmarkAccountNumber });

  if (bitmarkAccountNumber === userInformation.bitmarkAccountNumber) {
    let list = HealthKitService.doCheckBitmarkHealthDataTask(healthDataBitmarks, userInformation.createdAt);
    if (list && list.length > 0) {
      Actions.bitmarkHealthData({ list });
    }
  }
};

let queueGetUserDataBitmarks = {};
const runGetUserBitmarksInBackground = (bitmarkAccountNumber, grantedAt) => {
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
            if (!exist) {
              totalAssets.push(asset);
            }
          });
          data.bitmarks.forEach(bitmark => {
            lastOffset = lastOffset ? Math.max(lastOffset, bitmark.offset) : bitmark.offset;
            let exist = totalBitmarks.findIndex(b => b.id == bitmark.id) >= 0;
            if (!exist) {
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
    doGetAllBitmarks().then(({ assets, bitmarks }) => {
      let healthDataBitmarks = [], healthAssetBitmarks = [];
      bitmarks.forEach(bitmark => {
        let isGrantedBitmark = false;
        if (bitmarkAccountNumber === userInformation.bitmarkAccountNumber) {
          isGrantedBitmark = true;
        } else if (grantedAt) {
          isGrantedBitmark = moment(grantedAt).toDate() > moment(bitmark.confirmed_at).toDate();
        }
        if (!isGrantedBitmark) {
          return;
        }
        let asset = assets.find(as => as.id === bitmark.asset_id);
        if (asset) {
          if (isHealthDataBitmark(asset.name)) {
            bitmark.asset = asset;
            healthDataBitmarks.push(bitmark);
          }
          if (isHealthAssetBitmark(asset.name)) {
            bitmark.asset = asset;
            healthAssetBitmarks.push(bitmark);
          }
        }
      });
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

let queueGetAccountAccesses = [];
const doCheckNewAccesses = async (accesses) => {
  console.log('doCheckNewAccesses accesses :', accesses);
  await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_ACCOUNT_ACCESSES, accesses);
  EventEmitterService.emit(EventEmitterService.events.CHANGE_USER_DATA_ACCOUNT_ACCESSES, accesses);
  if (accesses && accesses.waiting && accesses.waiting.length > 0) {
    Actions.confirmAccess({ token: accesses.waiting[0].id, grantee: accesses.waiting[0].grantee });
  }
};
const runGetAccountAccessesInBackground = () => {
  return new Promise((resolve) => {
    queueGetAccountAccesses = queueGetAccountAccesses || [];
    queueGetAccountAccesses.push(resolve);
    if (queueGetAccountAccesses.length > 1) {
      return;
    }
    AccountService.doGetAllGrantedAccess(userInformation.bitmarkAccountNumber, jwt).then(accesses => {
      queueGetAccountAccesses.forEach(queueResolve => queueResolve(accesses));
      queueGetAccountAccesses = [];
      doCheckNewAccesses(accesses);
    }).catch(error => {
      queueGetAccountAccesses.forEach(queueResolve => queueResolve());
      queueGetAccountAccesses = [];
      console.log(' runGetAccountAccessesInBackground error:', error);
    });
  });
};

const runOnBackground = async () => {
  let userInfo = await UserModel.doTryGetCurrentUser();
  if (userInformation === null || JSON.stringify(userInfo) !== JSON.stringify(userInformation)) {
    userInformation = userInfo;
    EventEmitterService.emit(EventEmitterService.events.CHANGE_USER_INFO, userInfo);
  }
  if (userInformation && userInformation.bitmarkAccountNumber) {
    await runGetUserBitmarksInBackground();
    await runGetAccountAccessesInBackground();
    if (grantedAccessAccountSelected) {
      await runGetUserBitmarksInBackground(grantedAccessAccountSelected.grantor, grantedAccessAccountSelected.granted_at);
    }
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

// ================================================================================================================================================
let dataInterval = null;
const startInterval = () => {
  stopInterval();
  runOnBackground();
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
  if (justCreatedBitmarkAccount) {
    let emptyHealthKitData = await HealthKitService.doCheckEmptyDataSource();
    if (emptyHealthKitData) {
      EventEmitterService.emit(EventEmitterService.events.CHECK_DATA_SOURCE_HEALTH_KIT_EMPTY);
    }
  }
  return userInformation;
};

const doCreateAccount = async (touchFaceIdSession) => {
  let userInformation = await AccountService.doGetCurrentAccount(touchFaceIdSession);
  await checkAppNeedResetLocalData();

  let signatureData = await CommonModel.doCreateSignatureData(touchFaceIdSession);
  await AccountModel.doTryRegisterAccount(userInformation.bitmarkAccountNumber, signatureData.timestamp, signatureData.signature);
  await CommonModel.doTrackEvent({
    event_name: 'health_plus_create_new_account',
    account_number: userInformation ? userInformation.bitmarkAccountNumber : null,
  });
  return userInformation;
};

const doLogin = async (touchFaceIdSession) => {
  userInformation = await AccountService.doGetCurrentAccount(touchFaceIdSession);

  await checkAppNeedResetLocalData();
  return userInformation;
};

const doLogout = async () => {
  if (userInformation.notificationUUID) {
    let signatureData = await CommonModel.doTryCreateSignatureData('Please sign to authorize your transactions')
    await AccountService.doTryDeregisterNotificationInfo(userInformation.bitmarkAccountNumber, userInformation.notificationUUID, signatureData);
  }
  PushNotificationIOS.cancelAllLocalNotifications();
  await AccountModel.doLogout(jwt);
  await UserModel.doRemoveUserInfo();
  await FileUtil.removeSafe(FileUtil.DocumentDirectory + '/' + userInformation.bitmarkAccountNumber);
  await FileUtil.removeSafe(FileUtil.CacheDirectory + '/' + userInformation.bitmarkAccountNumber);
  await Intercom.reset();

  let accesses = await doGetAccountAccesses();
  for (let grantedInfo of (accesses.granted_from || [])) {
    await AccountModel.doRemoveGrantingAccess(grantedInfo.grantor, grantedInfo.grantee);
  }
  for (let grantedInfo of (accesses.granted_to || [])) {
    await AccountModel.doRemoveGrantingAccess(grantedInfo.grantor, grantedInfo.grantee);
  }
  userInformation = {};
};

const doDeactiveApplication = async () => {
  stopInterval();
};

const doOpenApp = async () => {
  // await UserModel.doRemoveUserInfo();
  userInformation = await UserModel.doTryGetCurrentUser();
  let appInfo = await doGetAppInformation();
  appInfo = appInfo || {};

  if (!appInfo.trackEvents || !appInfo.trackEvents.app_download) {
    let appInfo = await doGetAppInformation();
    appInfo = appInfo || {};
    appInfo.trackEvents = appInfo.trackEvents || {};
    appInfo.trackEvents.app_download = true;
    await CommonModel.doSetLocalData(CommonModel.KEYS.APP_INFORMATION, appInfo);
    await CommonModel.doTrackEvent({
      event_name: 'health_plus_download',
      account_number: userInformation ? userInformation.bitmarkAccountNumber : null,
    });
  }

  if (userInformation && userInformation.bitmarkAccountNumber) {
    await FileUtil.mkdir(FileUtil.DocumentDirectory + '/' + userInformation.bitmarkAccountNumber);
    await FileUtil.mkdir(FileUtil.DocumentDirectory + '/encrypted_' + userInformation.bitmarkAccountNumber);
    await FileUtil.mkdir(FileUtil.CacheDirectory + '/' + userInformation.bitmarkAccountNumber);
    Intercom.registerIdentifiedUser({ userId: userInformation.bitmarkAccountNumber }).catch(error => {
      console.log('registerIdentifiedUser error :', error);
    });

    await CommonModel.doStartFaceTouchSessionId('Your fingerprint signature is required.');

    let signatureData = await CommonModel.doCreateSignatureData(CommonModel.getFaceTouchSessionId());
    let result = await AccountModel.doRegisterJWT(userInformation.bitmarkAccountNumber, signatureData.timestamp, signatureData.signature);
    jwt = result.jwt_token;

    websocket =
      // new WebSocket(config.mobile_server_url + '/ws');
      new WebSocket(config.mobile_server_url + '/ws', [], {
        headers: {
          'Authorization': 'Bearer ' + jwt
        }
      });

    websocket.onopen = () => {
      console.log('websocket opened');
    };
    websocket.onmessage = (event) => {
      if (event.data) {
        let data
        try {
          data = JSON.parse(event.data);
        } catch (error) {
          //
        }
        console.log('data event :', data);
        if (data && data.event === 'bitmarks_grant_access' && data.id && data.grantee) {
          Actions.confirmAccess({ token: data.id, grantee: data.grantee });
        }
      }
    };
    websocket.onerror = (e) => {
      console.log('websocket error : ', e);
    };
    websocket.onclose = (e) => {
      console.log('websocket closed:', e.code, e.reason);
    };

    if (!appInfo.lastTimeOpen) {
      let appInfo = await doGetAppInformation();
      appInfo.lastTimeOpen = moment().toDate().getTime();
      await CommonModel.doSetLocalData(CommonModel.KEYS.APP_INFORMATION, appInfo);
    } else if (!appInfo.trackEvents || !appInfo.trackEvents.health_user_open_app_two_time_in_a_week) {

      let firstTime = moment(appInfo.lastTimeOpen);
      let currentTime = moment();
      let diffWeeks = currentTime.diff(firstTime, 'week');
      let diffHours = currentTime.diff(firstTime, 'hour');
      if (diffWeeks === 0 && diffHours > 1) {
        appInfo.trackEvents = appInfo.trackEvents || {};
        appInfo.trackEvents.health_user_open_app_two_time_in_a_week = true;
        await CommonModel.doSetLocalData(CommonModel.KEYS.APP_INFORMATION, appInfo);
        await CommonModel.doTrackEvent({
          event_name: 'health_plus_user_open_app_two_time_in_a_week',
          account_number: userInformation ? userInformation.bitmarkAccountNumber : null,
        });
      } else if (diffWeeks > 0) {
        appInfo.lastTimeOpen = currentTime.toDate().getTime();
        await CommonModel.doSetLocalData(CommonModel.KEYS.APP_INFORMATION, appInfo);
      }
    }

    await checkAppNeedResetLocalData(appInfo);

    AccountService.removeAllDeliveredNotifications();
    PushNotificationIOS.cancelAllLocalNotifications();
    let dateNotification = HealthKitService.getNextSunday11AM();
    PushNotificationIOS.scheduleLocalNotification({
      fireDate: dateNotification.toDate(),
      alertTitle: '',
      alertBody: 'Your health data is ready to sign.',
      repeatInterval: 'week'
    });
  }

  EventEmitterService.emit(EventEmitterService.events.APP_LOADING_DATA, isLoadingData);
  console.log('userInformation :', userInformation);
  return userInformation;
};

const doBitmarkHealthData = async (touchFaceIdSession, list) => {
  let bitmarkIds = await HealthKitService.doBitmarkHealthData(touchFaceIdSession, userInformation.bitmarkAccountNumber, list);
  await runGetUserBitmarksInBackground();
  let appInfo = (await doGetAppInformation()) || {};
  if (!appInfo.trackEvents || !appInfo.trackEvents.health_user_first_time_issued_weekly_health_data) {
    appInfo.trackEvents = appInfo.trackEvents || {};
    appInfo.trackEvents.health_user_first_time_issued_weekly_health_data = true;
    await CommonModel.doSetLocalData(CommonModel.KEYS.APP_INFORMATION, appInfo);

    await CommonModel.doTrackEvent({
      event_name: 'health_plus_user_first_time_issued_weekly_health_data',
      account_number: userInformation ? userInformation.bitmarkAccountNumber : null,
    });
  }

  // let grantedInformationForOtherAccount = await doGetAccountAccesses('granted_to');
  // if (grantedInformationForOtherAccount && grantedInformationForOtherAccount.length > 0) {
  //   let body = { items: [] };
  //   for (let grantedInfo of grantedInformationForOtherAccount) {
  //     for (let bitmarkId of bitmarkIds) {
  //       let sessionData = await BitmarkSDK.createSessionDataForRecipient(touchFaceIdSession, bitmarkId, grantedInfo.grantee);
  //       body.items.push({
  //         bitmark_id: bitmarkId,
  //         session_data: sessionData,
  //         to: grantedInfo.grantee,
  //         start_at: Math.floor(moment().toDate().getTime() / 1000),
  //         duration: { Years: 99 }
  //       });
  //     }
  //   }
  //   let timestamp = moment().toDate().getTime();
  //   let message = `accessGrant||${userInformation.bitmarkAccountNumber}|${timestamp}`;
  //   let signatures = await CommonModel.doTryRickSignMessage([message], touchFaceIdSession);
  //   await BitmarkModel.doAccessGrants(userInformation.bitmarkAccountNumber, timestamp, signatures[0], body);
  // }

  return bitmarkIds;
};

const doDownloadBitmark = async (touchFaceIdSession, bitmarkIdOrGrantedId) => {
  let downloadedFilePath;
  if (grantedAccessAccountSelected) {
    downloadedFilePath = await BitmarkSDK.downloadBitmarkWithGrantId(touchFaceIdSession, bitmarkIdOrGrantedId);
  } else {
    downloadedFilePath = await BitmarkSDK.downloadBitmark(touchFaceIdSession, bitmarkIdOrGrantedId);
  }
  downloadedFilePath = downloadedFilePath.replace('file://', '');
  let accountFilePath = FileUtil.DocumentDirectory + '/' + userInformation.bitmarkAccountNumber + downloadedFilePath.substring(downloadedFilePath.lastIndexOf('/'), downloadedFilePath.length);
  await FileUtil.moveFileSafe(downloadedFilePath, accountFilePath);
  return accountFilePath;
};

const doDownloadHealthDataBitmark = async (touchFaceIdSession, bitmarkIdOrGrantedId) => {
  let downloadedFilePath;
  if (grantedAccessAccountSelected) {
    downloadedFilePath = await BitmarkSDK.downloadBitmarkWithGrantId(touchFaceIdSession, bitmarkIdOrGrantedId);
  } else {
    downloadedFilePath = await BitmarkSDK.downloadBitmark(touchFaceIdSession, bitmarkIdOrGrantedId);
  }
  downloadedFilePath = downloadedFilePath.replace('file://', '');
  let accountFilePath = FileUtil.DocumentDirectory + '/' + userInformation.bitmarkAccountNumber + downloadedFilePath.substring(downloadedFilePath.lastIndexOf('/'), downloadedFilePath.length);
  await FileUtil.moveFileSafe(downloadedFilePath, accountFilePath);

  let folderPathUnzip = accountFilePath.replace('.zip', '');
  await FileUtil.unzip(accountFilePath, folderPathUnzip);
  let listFile = await FileUtil.readDir(folderPathUnzip);
  let result = await FileUtil.readFile(folderPathUnzip + '/' + listFile[0]);
  return result;
};

const doIssueFile = async (touchFaceIdSession, filePath, assetName, metadataList, quantity, isPublicAsset) => {
  let bitmarkIds = await BitmarkService.doIssueFile(touchFaceIdSession, userInformation.bitmarkAccountNumber, filePath, assetName, metadataList, quantity, isPublicAsset);
  await doReloadUserData();

  let appInfo = (await doGetAppInformation()) || {};
  if (!appInfo.trackEvents || !appInfo.trackEvents.health_user_first_time_issued_file) {
    appInfo.trackEvents = appInfo.trackEvents || {};
    appInfo.trackEvents.health_user_first_time_issued_file = true;
    await CommonModel.doSetLocalData(CommonModel.KEYS.APP_INFORMATION, appInfo);

    await CommonModel.doTrackEvent({
      event_name: 'health_plus_user_first_time_issued_file',
      account_number: userInformation ? userInformation.bitmarkAccountNumber : null,
    });
  }

  // let grantedInformationForOtherAccount = await doGetAccountAccesses('granted_to');
  // if (grantedInformationForOtherAccount && grantedInformationForOtherAccount.length > 0) {
  //   let body = { items: [] };
  //   for (let grantedInfo of grantedInformationForOtherAccount) {
  //     for (let bitmarkId of bitmarkIds) {
  //       let sessionData = await BitmarkSDK.createSessionDataForRecipient(touchFaceIdSession, bitmarkId, grantedInfo.grantee);
  //       body.items.push({
  //         bitmark_id: bitmarkId,
  //         session_data: sessionData,
  //         to: grantedInfo.grantee,
  //         start_at: Math.floor(moment().toDate().getTime() / 1000),
  //         duration: { Years: 99 }
  //       });
  //     }
  //   }
  //   let timestamp = moment().toDate().getTime();
  //   let message = `accessGrant||${userInformation.bitmarkAccountNumber}|${timestamp}`;
  //   let signatures = await CommonModel.doTryRickSignMessage([message], touchFaceIdSession);
  //   await BitmarkModel.doAccessGrants(userInformation.bitmarkAccountNumber, timestamp, signatures[0], body);
  // }
  return bitmarkIds;
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
  return await BitmarkService.doCheckFileToIssue(filePath, userInformation.bitmarkAccountNumber);
};

const doGrantingAccess = async () => {
  return AccountModel.doGrantingAccess(jwt);
};

const getAccountAccessSelected = () => {
  return grantedAccessAccountSelected ? grantedAccessAccountSelected.grantor : null;
};
const getGrantedAccessAccountSelected = () => {
  return grantedAccessAccountSelected;
};

const doSelectAccountAccess = async (accountNumber) => {
  if (accountNumber === userInformation.bitmarkAccountNumber) {
    grantedAccessAccountSelected = null;
    return true;
  }
  let accesses = await runGetAccountAccessesInBackground();
  if (accesses && accesses.granted_from) {
    grantedAccessAccountSelected = (accesses.granted_from || []).find(item => item.grantor === accountNumber);
    console.log('grantedAccessAccountSelected :', grantedAccessAccountSelected);
    if (grantedAccessAccountSelected) {
      await runGetUserBitmarksInBackground(grantedAccessAccountSelected.grantor, grantedAccessAccountSelected.granted_at);
      return true;
    }
  }
  return false;
};

const doReceivedAccessQRCode = async (token) => {
  return await AccountModel.doReceiveGrantingAccess(jwt, token, { "update_grantee": true });
};

const doRemoveGrantingAccess = async (grantee) => {
  let result = await AccountModel.doRemoveGrantingAccess(userInformation.bitmarkAccountNumber, grantee);
  await runGetAccountAccessesInBackground();
  return result;
};

const doCancelGrantingAccess = async (token) => {
  let result = await AccountModel.doCancelGrantingAccess(jwt, token);
  await runGetAccountAccessesInBackground();
  return result;
};

const doConfirmGrantingAccess = async (touchFaceIdSession, token, grantee) => {
  let userBitmarks = await doGetUserDataBitmarks(userInformation.bitmarkAccountNumber);
  if (userBitmarks && (userBitmarks.healthDataBitmarks || userBitmarks.healthAssetBitmarks)) {
    let body = { items: [] };

    for (let bitmark of (userBitmarks.healthDataBitmarks || [])) {
      if (bitmark.status === 'confirmed') {
        let sessionData = await BitmarkSDK.createSessionDataForRecipient(touchFaceIdSession, bitmark.id, grantee);
        body.items.push({
          bitmark_id: bitmark.id,
          session_data: sessionData,
          to: grantee,
          start_at: Math.floor(moment().toDate().getTime() / 1000),
          duration: { Years: 99 }
        });
      }
    }
    for (let bitmark of (userBitmarks.healthAssetBitmarks || [])) {
      if (bitmark.status === 'confirmed') {
        let sessionData = await BitmarkSDK.createSessionDataForRecipient(touchFaceIdSession, bitmark.id, grantee);
        body.items.push({
          bitmark_id: bitmark.id,
          session_data: sessionData,
          to: grantee,
          start_at: Math.floor(moment().toDate().getTime() / 1000),
          duration: { Years: 99 }
        });
      }
    }

    let timestamp = moment().toDate().getTime();
    let message = `accessGrant||${userInformation.bitmarkAccountNumber}|${timestamp}`;
    let signatures = await CommonModel.doTryRickSignMessage([message], touchFaceIdSession);
    return await BitmarkModel.doAccessGrants(userInformation.bitmarkAccountNumber, timestamp, signatures[0], body);
  }
  await AccountModel.doReceiveGrantingAccess(jwt, token, { status: "completed" });
  return await runGetAccountAccessesInBackground();
};
const doDeleteAccount = async () => {
  return await AccountModel.doDeleteAccount(jwt);
}

const DataProcessor = {
  doOpenApp,
  doCreateAccount,
  doLogin,
  doLogout,
  doStartBackgroundProcess,
  doReloadUserData,

  doDeactiveApplication,
  doBitmarkHealthData,
  doDownloadBitmark,
  doIssueFile,

  doGetUserDataBitmarks,
  doCheckFileToIssue,

  getApplicationVersion,
  getApplicationBuildNumber,
  getUserInformation,
  isAppLoadingData: () => isLoadingData,

  doGrantingAccess,
  doGetAccountAccesses,
  doSelectAccountAccess,
  getAccountAccessSelected,
  getGrantedAccessAccountSelected,
  doReceivedAccessQRCode,
  doCancelGrantingAccess,
  doRemoveGrantingAccess,
  doConfirmGrantingAccess,
  doDownloadHealthDataBitmark,
  doDeleteAccount,
};

export { DataProcessor };

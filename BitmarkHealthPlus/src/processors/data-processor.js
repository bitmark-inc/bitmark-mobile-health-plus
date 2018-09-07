import DeviceInfo from 'react-native-device-info';
import Intercom from 'react-native-intercom';
import moment from 'moment';
import { Actions } from 'react-native-router-flux';

import {
  EventEmitterService,
  NotificationService,
  BitmarkService,
  AccountService,
} from "../services";
import { CommonModel, AccountModel, UserModel, BitmarkSDK, NotificationModel, DonationModel } from '../models';
import { DonationService } from '../services/donation-service';
import { config } from '../configs';
import { FileUtil } from '../utils';

let userInformation = {};
let accountAccessSelected = null;
let jwt;
let websocket;
let isLoadingData = false;
// ================================================================================================================================================
const doCheckNewDonationInformation = async (donationInformation, bitmarkAccountNumber) => {
  if (donationInformation) {
    if (!bitmarkAccountNumber || bitmarkAccountNumber === userInformation.bitmarkAccountNumber) {
      await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_DONATION_INFORMATION, donationInformation);
      EventEmitterService.emit(EventEmitterService.events.CHANGE_USER_DATA_DONATION_INFORMATION, { donationInformation });
    } else {
      let otherUserDataDonationInformation = await CommonModel.doGetLocalData(CommonModel.KEYS.OTHER_USER_DATA_DONATION_INFORMATION);
      otherUserDataDonationInformation = otherUserDataDonationInformation || {};
      otherUserDataDonationInformation[bitmarkAccountNumber] = donationInformation;
      await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_DONATION_INFORMATION, otherUserDataDonationInformation);
      EventEmitterService.emit(EventEmitterService.events.CHANGE_OTHER_USER_DATA_DONATION_INFORMATION, { donationInformation, bitmarkAccountNumber });
    }
  }
};
let queueGetDonationInformation = {};
const runGetUserDonationInformationInBackground = (bitmarkAccountNumber) => {
  bitmarkAccountNumber = bitmarkAccountNumber || userInformation.bitmarkAccountNumber;
  return new Promise((resolve) => {
    queueGetDonationInformation[bitmarkAccountNumber] = queueGetDonationInformation[bitmarkAccountNumber] || [];
    queueGetDonationInformation[bitmarkAccountNumber].push(resolve);
    if (queueGetDonationInformation[bitmarkAccountNumber].length > 1) {
      return;
    }
    DonationService.doGetUserInformation(bitmarkAccountNumber).then(donationInformation => {
      (queueGetDonationInformation[bitmarkAccountNumber] || []).forEach(queueResolve => queueResolve(donationInformation));
      queueGetDonationInformation[bitmarkAccountNumber] = [];
      doCheckNewDonationInformation(donationInformation, bitmarkAccountNumber);
    }).catch(error => {
      (queueGetDonationInformation[bitmarkAccountNumber] || []).forEach(queueResolve => queueResolve());
      queueGetDonationInformation[bitmarkAccountNumber] = [];
      console.log('runOnBackground  runGetUserDonationInformationInBackground error :', error);
    });
  });
};

let queueGetAccountAccesses = [];
const doCheckNewAccesses = async (accesses) => {
  if (accesses) {
    await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_ACCOUNT_ACCESSES, accesses);
    EventEmitterService.emit(EventEmitterService.events.CHANGE_USER_DATA_ACCOUNT_ACCESSES, accesses);
  }
};
const runGetAccountAccessesInBackground = () => {
  return new Promise((resolve) => {
    queueGetAccountAccesses = queueGetAccountAccesses || [];
    queueGetAccountAccesses.push(resolve);
    if (queueGetAccountAccesses.length > 1) {
      return;
    }
    NotificationModel.doGetAllGrantedAccess().then(accesses => {
      queueGetAccountAccesses.forEach(queueResolve => queueResolve(accesses));
      queueGetAccountAccesses = [];
      doCheckNewAccesses(accesses);
    }).catch(error => {
      queueGetAccountAccesses.forEach(queueResolve => queueResolve());
      queueGetAccountAccesses = [];
      console.log('runOnBackground  runGetAccountAccessesInBackground error :', error);
    });
  });
};

const runOnBackground = async () => {
  console.log('runOnBackground =====');
  let userInfo = await UserModel.doTryGetCurrentUser();
  if (userInformation === null || JSON.stringify(userInfo) !== JSON.stringify(userInformation)) {
    userInformation = userInfo;
    EventEmitterService.emit(EventEmitterService.events.CHANGE_USER_INFO, userInfo);
  }
  if (userInformation && userInformation.bitmarkAccountNumber) {
    // TODO
    // await runGetAccountAccessesInBackground();
    let donationInformation = await runGetUserDonationInformationInBackground();
    if (donationInformation && donationInformation.bitmarkHealthDataTask && donationInformation.bitmarkHealthDataTask.list && donationInformation.bitmarkHealthDataTask.list.length > 0) {
      Actions.bitmarkHealthData({ list: donationInformation.bitmarkHealthDataTask.list });
    }
    if (accountAccessSelected) {
      await runGetUserDonationInformationInBackground(accountAccessSelected);
    }
    console.log('runOnBackground done ====================================', userInformation, accountAccessSelected, donationInformation);
    return donationInformation;
  }
};
// ================================================================================================================================================
const doReloadUserData = async () => {
  isLoadingData = true;
  EventEmitterService.emit(EventEmitterService.events.APP_LOADING_DATA, isLoadingData);
  let donationInformation = await runOnBackground();
  isLoadingData = false;
  EventEmitterService.emit(EventEmitterService.events.APP_LOADING_DATA, isLoadingData);
  return donationInformation;
};

const configNotification = () => {
  const onRegistered = async (registeredNotificationInfo) => {
    let notificationUUID = registeredNotificationInfo ? registeredNotificationInfo.token : null;
    if (!userInformation || !userInformation.bitmarkAccountNumber) {
      userInformation = await UserModel.doGetCurrentUser();
    }
    if (userInformation.notificationUUID !== notificationUUID) {
      NotificationService.doRegisterNotificationInfo(userInformation.bitmarkAccountNumber, notificationUUID).then(() => {
        userInformation.notificationUUID = notificationUUID;
        return UserModel.doUpdateUserInfo(userInformation);
      }).catch(error => {
        console.log('DataProcessor doRegisterNotificationInfo error:', error);
      });
    }
  };
  const onReceivedNotification = async (notificationData) => {
    if (!notificationData.foreground) {
      if (!userInformation || !userInformation.bitmarkAccountNumber) {
        userInformation = await UserModel.doGetCurrentUser();
      }
      setTimeout(async () => {
        EventEmitterService.emit(EventEmitterService.events.APP_RECEIVED_NOTIFICATION, notificationData.data);
      }, 1000);
    }
  };
  NotificationService.configure(onRegistered, onReceivedNotification);
  NotificationService.removeAllDeliveredNotifications();
};
// ================================================================================================================================================
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

// ================================================================================================================================================
// ================================================================================================================================================
const doStartBackgroundProcess = async (justCreatedBitmarkAccount) => {
  startInterval();
  if (!justCreatedBitmarkAccount && userInformation && userInformation.bitmarkAccountNumber) {
    await NotificationService.doCheckNotificationPermission();
  }
  return userInformation;
};

const doCreateAccount = async (touchFaceIdSession) => {
  let userInformation = await AccountService.doGetCurrentAccount(touchFaceIdSession);
  await checkAppNeedResetLocalData();

  let signatureData = await CommonModel.doCreateSignatureData(touchFaceIdSession);
  await NotificationModel.doTryRegisterAccount(userInformation.bitmarkAccountNumber, signatureData.timestamp, signatureData.signature);

  signatureData = await CommonModel.doCreateSignatureData(touchFaceIdSession);
  let donationInformation = await DonationModel.doActiveBitmarkHealthData(userInformation.bitmarkAccountNumber, signatureData.timestamp, signatureData.signature, moment().toDate());
  await doCheckNewDonationInformation(donationInformation);
  await CommonModel.doTrackEvent({
    event_name: 'health_plus_create_new_account',
    account_number: userInformation ? userInformation.bitmarkAccountNumber : null,
  });
  return userInformation;
};

const doLogin = async (touchFaceIdSession) => {
  userInformation = await AccountService.doGetCurrentAccount(touchFaceIdSession);

  await checkAppNeedResetLocalData();
  let signatureData = await CommonModel.doCreateSignatureData(touchFaceIdSession);
  let donationInformation = await DonationModel.doActiveBitmarkHealthData(userInformation.bitmarkAccountNumber, signatureData.timestamp, signatureData.signature, moment().toDate());
  await doCheckNewDonationInformation(donationInformation);
  return userInformation;
};

const doLogout = async () => {
  if (userInformation.notificationUUID) {
    let signatureData = await CommonModel.doTryCreateSignatureData('Please sign to authorize your transactions')
    await NotificationService.doTryDeregisterNotificationInfo(userInformation.bitmarkAccountNumber, userInformation.notificationUUID, signatureData);
  }
  await AccountModel.doLogout();
  await UserModel.doRemoveUserInfo();
  userInformation = {};
  await Intercom.reset();
};

const doDeleteAccount = async (touchFaceIdSession) => {
  // await NotificationModel.doDeleteAccount(jwt);
  let signatureData = await CommonModel.doCreateSignatureData(touchFaceIdSession);
  await DonationModel.doDeleteAccount(userInformation.bitmarkAccountNumber, signatureData.timestamp, signatureData.signature);
  await AccountModel.doLogout();
  await UserModel.doRemoveUserInfo();
  userInformation = {};
  await Intercom.reset();
  return userInformation;
};


const doDeactiveApplication = async () => {
  stopInterval();
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
    Intercom.registerIdentifiedUser({ userId: userInformation.bitmarkAccountNumber }).then(() => {
      console.log('registerIdentifiedUser success =============================');
    }).catch(error => {
      console.log('registerIdentifiedUser error :', error);
    });

    if (!CommonModel.getFaceTouchSessionId()) {
      await CommonModel.doStartFaceTouchSessionId('Your fingerprint signature is required.');
    }

    let signatureData = await CommonModel.doCreateSignatureData(CommonModel.getFaceTouchSessionId());
    let result = await NotificationModel.doRegisterJWT(userInformation.bitmarkAccountNumber, signatureData.timestamp, signatureData.signature);
    jwt = result.jwt_token;

    console.log('Bearer ' + jwt);
    websocket =
      // new WebSocket(config.mobile_server_url + '/ws');
      new WebSocket(config.mobile_server_url + '/ws', [], {
        headers: {
          'Authorization': 'Bearer ' + jwt
        }
      });

    websocket.onopen = () => {
      // connection opened
      console.log('onopen ===='); // send a message
      websocket.send
    };
    websocket.onmessage = (event) => {
      console.log('onmessage :', event);
      if (event.data) {
        let data = JSON.parse(event.data)
        if (data.event === 'bitmarks_grant_access' && data.id && data.grantee) {
          Actions.confirmAccess({ token: data.id, grantee: data.grantee });
        }
      }
    };
    websocket.onerror = (e) => {
      // an error occurred
      console.log('error : ', e.message);
    };
    websocket.onclose = (e) => {
      // connection closed
      console.log('onclose :', e.code, e.reason);
    };

    if (!appInfo.lastTimeOpen) {
      let appInfo = await doGetAppInformation();
      appInfo.lastTimeOpen = moment().toDate().getTime();
      await CommonModel.doSetLocalData(CommonModel.KEYS.APP_INFORMATION, appInfo);
      console.log('set first time open app');
    } else if (!appInfo.trackEvents || !appInfo.trackEvents.health_user_open_app_two_time_in_a_week) {

      let firstTime = moment(appInfo.lastTimeOpen);
      let currentTime = moment();
      let diffWeeks = currentTime.diff(firstTime, 'week');
      let diffHours = currentTime.diff(firstTime, 'hour');
      if (diffWeeks === 0 && diffHours > 1) {
        console.log('open app two times in week!');
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

    configNotification();
    await checkAppNeedResetLocalData(appInfo);
  }

  EventEmitterService.emit(EventEmitterService.events.APP_LOADING_DATA, isLoadingData);
  console.log('userInformation :', userInformation);
  return userInformation;
};

const doActiveBitmarkHealthData = async (touchFaceIdSession, activeBitmarkHealthDataAt) => {
  let donationInformation = await DonationService.doActiveBitmarkHealthData(touchFaceIdSession, userInformation.bitmarkAccountNumber, activeBitmarkHealthDataAt);
  await doCheckNewDonationInformation(donationInformation);
  return donationInformation;
};
const doInactiveBitmarkHealthData = async (touchFaceIdSession) => {
  let donationInformation = await DonationService.doInactiveBitmarkHealthData(touchFaceIdSession, userInformation.bitmarkAccountNumber);
  await doCheckNewDonationInformation(donationInformation);
  return donationInformation;
};

const doBitmarkHealthData = async (touchFaceIdSession, list) => {
  let currentDonationInformation = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_DONATION_INFORMATION)) || {};
  let donationInformation = await DonationService.doBitmarkHealthData(touchFaceIdSession,
    userInformation.bitmarkAccountNumber,
    currentDonationInformation.allDataTypes,
    list,
    currentDonationInformation.commonTaskIds.bitmark_health_data);
  await doCheckNewDonationInformation(donationInformation);

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
  return donationInformation;
};

const doDownloadBitmark = async (touchFaceIdSession, bitmarkId) => {
  let filePath = await BitmarkSDK.downloadBitmark(touchFaceIdSession, bitmarkId);
  filePath = filePath.replace('file://', '');
  return filePath;
};

const doDownloadHealthDataBitmark = async (touchFaceIdSession, bitmarkId) => {
  let filePath = await BitmarkSDK.downloadBitmark(touchFaceIdSession, bitmarkId);
  filePath = filePath.replace('file://', '');
  let folderPathUnzip = filePath.replace('.zip', '');
  await FileUtil.unzip(filePath, folderPathUnzip);
  let listFile = await FileUtil.readDir(folderPathUnzip);
  let result = await FileUtil.readFile(folderPathUnzip + '/' + listFile[0]);
  return result;
};

const doIssueFile = async (touchFaceIdSession, filePath, assetName, metadataList, quantity, isPublicAsset, forHealthData = true) => {
  let result = await BitmarkService.doIssueFile(touchFaceIdSession, filePath, assetName, metadataList, quantity, isPublicAsset);
  if (forHealthData) {
    let donationInformation = await doGetDonationInformation();
    await DonationService.doCompleteTask(touchFaceIdSession, userInformation.bitmarkAccountNumber, donationInformation.commonTaskIds.bitmark_health_issuance, moment().toDate(), result[0]);
  }
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
  return result;
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

const doGetDonationInformation = (bitmarkAccountNumber) => {
  return new Promise((resolve) => {
    if (!bitmarkAccountNumber || bitmarkAccountNumber === userInformation.bitmarkAccountNumber) {
      CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_DONATION_INFORMATION).then(resolve).catch((error => {
        console.log('doGetDonationInformation error:', error);
        resolve();
      }));
    } else {
      CommonModel.doGetLocalData(CommonModel.KEYS.OTHER_USER_DATA_DONATION_INFORMATION).then((otherUserDataDonationInformation) => {
        resolve(otherUserDataDonationInformation ? otherUserDataDonationInformation[bitmarkAccountNumber] : undefined);
      }).catch((error => {
        console.log('doGetDonationInformation error:', error);
        resolve();
      }));
    }
  });
};

const doGetAccountAccesses = (type) => {
  return new Promise((resolve) => {
    CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_DONATION_INFORMATION).then((accesses) => {
      if (!accesses) {
        return resolve();
      }
      if (type) {
        //TODO field
        return resolve(accesses['granting_' + type]);
      }
      resolve(accesses);
    }).catch((error => {
      console.log('doGetDonationInformation error:', error);
      resolve();
    }));

  });
};
// ======================================================================================================================================================================================
// ======================================================================================================================================================================================
// ======================================================================================================================================================================================
// ======================================================================================================================================================================================
const doCheckFileToIssue = async (filePath) => {
  return await BitmarkService.doCheckFileToIssue(filePath, userInformation.bitmarkAccountNumber);
};

const doGrantingAccess = async () => {
  return NotificationModel.doGrantingAccess(jwt);
};

const getAccountAccessSelected = () => {
  return accountAccessSelected;
};

const doSelectAccountAccess = async (accountNumber) => {
  if (accountNumber === userInformation.bitmarkAccountNumber) {
    accountAccessSelected = null;
    return true;
  }
  let accesses = await runGetAccountAccessesInBackground();
  let canSelect = accesses && accesses.granting_from && ((accesses.granting_from || []).findIndex(item => item.grantor === accountNumber) >= 0);
  if (canSelect) {
    accountAccessSelected = accountNumber;
    await runGetUserDonationInformationInBackground(accountAccessSelected);
  }
  return canSelect;
};

const doReceivedAccessQRCode = async (token) => {
  return await NotificationModel.doReceiveGrantingAccess(jwt, token);
};

const doRemoveGrantingAccess = async (token) => {
  return await NotificationModel.doRemoveGrantingAccess(jwt, token);
};


const DataProcessor = {
  doOpenApp,
  doCreateAccount,
  doLogin,
  doLogout,
  doDeleteAccount,
  doStartBackgroundProcess,
  doReloadUserData,

  doDeactiveApplication,
  doActiveBitmarkHealthData,
  doInactiveBitmarkHealthData,
  doBitmarkHealthData,
  doDownloadBitmark,
  doIssueFile,

  doGetDonationInformation,
  doCheckFileToIssue,

  getApplicationVersion,
  getApplicationBuildNumber,
  getUserInformation,
  isAppLoadingData: () => isLoadingData,

  doGrantingAccess,
  doGetAccountAccesses,
  doSelectAccountAccess,
  getAccountAccessSelected,
  doReceivedAccessQRCode,
  doRemoveGrantingAccess,
  doDownloadHealthDataBitmark,
};

export { DataProcessor };

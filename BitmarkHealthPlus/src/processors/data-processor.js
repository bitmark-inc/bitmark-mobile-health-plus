import DeviceInfo from 'react-native-device-info';
// import Intercom from 'react-native-intercom';
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
import { DataCacheProcessor } from './data-cache-processor';
import { config } from '../configs';

let userInformation = {};
let isLoadingData = false;
// ================================================================================================================================================
const doCheckNewDonationInformation = async (donationInformation, isLoadingAllUserData) => {
  if (donationInformation) {
    await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_DONATION_INFORMATION, donationInformation);
    EventEmitterService.emit(EventEmitterService.events.CHANGE_USER_DATA_DONATION_INFORMATION, donationInformation);
    if (!isLoadingAllUserData) {
      await doGenerateDisplayedData();
    }
  }
};
// ================================================================================================================================================
let queueGetDonationInformation = [];
const runGetDonationInformationInBackground = () => {
  return new Promise((resolve) => {
    queueGetDonationInformation.push(resolve);
    if (queueGetDonationInformation.length > 1) {
      return;
    }
    DonationService.doGetUserInformation(userInformation.bitmarkAccountNumber).then(donationInformation => {
      console.log('runOnBackground  runGetDonationInformationInBackground success');
      queueGetDonationInformation.forEach(queueResolve => queueResolve(donationInformation));
      queueGetDonationInformation = [];
    }).catch(error => {
      queueGetDonationInformation.forEach(queueResolve => queueResolve());
      queueGetDonationInformation = [];
      console.log('runOnBackground  runGetDonationInformationInBackground error :', error);
    });
  });
};

// ================================================================================================================================================
// special process
const runOnBackground = async () => {
  console.log('runOnBackground =====');
  let userInfo = await UserModel.doTryGetCurrentUser();
  if (userInformation === null || JSON.stringify(userInfo) !== JSON.stringify(userInformation)) {
    userInformation = userInfo;
    EventEmitterService.emit(EventEmitterService.events.CHANGE_USER_INFO, userInfo);
  }
  if (userInformation && userInformation.bitmarkAccountNumber) {
    let donationInformation = await runGetDonationInformationInBackground();
    if (donationInformation && donationInformation.bitmarkHealthDataTask && donationInformation.bitmarkHealthDataTask.list && donationInformation.bitmarkHealthDataTask.list.length > 0) {
      Actions.bitmarkHealthData({ list: donationInformation.bitmarkHealthDataTask.list });
    }
    await doCheckNewDonationInformation(donationInformation, true);
    await doGenerateDisplayedData();
    console.log('runOnBackground done ====================================', donationInformation);
    return donationInformation;
  }
};

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
      await CommonModel.doTrackEvent({
        event_name: 'health_user_click_notification',
        account_number: userInformation ? userInformation.bitmarkAccountNumber : null,
      });
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
  await doCheckNewDonationInformation(donationInformation, true);
  await doGenerateDisplayedData();
  await CommonModel.doTrackEvent({
    event_name: 'health_create_new_account',
    account_number: userInformation ? userInformation.bitmarkAccountNumber : null,
  });
  return userInformation;
};

const doLogin = async (touchFaceIdSession) => {
  userInformation = await AccountService.doGetCurrentAccount(touchFaceIdSession);

  await checkAppNeedResetLocalData();
  let signatureData = await CommonModel.doCreateSignatureData(touchFaceIdSession);
  let donationInformation = await DonationModel.doActiveBitmarkHealthData(userInformation.bitmarkAccountNumber, signatureData.timestamp, signatureData.signature, moment().toDate());
  await doCheckNewDonationInformation(donationInformation, true);
  await doGenerateDisplayedData();
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
  // await Intercom.reset();
  DataCacheProcessor.resetCacheData();
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

  await CommonModel.doTrackEvent({
    event_name: 'health_open',
    account_number: userInformation ? userInformation.bitmarkAccountNumber : null,
  });

  let appInfo = await doGetAppInformation();
  appInfo = appInfo || {};

  if (appInfo.trackEvents && appInfo.trackEvents.app_user_allow_notification) {
    let result = await NotificationService.doCheckNotificationPermission();

    if (result && !result.alert && !result.badge && !result.sound &&
      (!appInfo.trackEvents || !appInfo.trackEvents.app_user_turn_off_notification)) {
      appInfo.trackEvents = appInfo.trackEvents || {};
      appInfo.trackEvents.app_user_turn_off_notification = true;
      await CommonModel.doSetLocalData(CommonModel.KEYS.APP_INFORMATION, appInfo);
      await CommonModel.doTrackEvent({
        event_name: 'health_user_turn_off_notification',
        account_number: userInformation ? userInformation.bitmarkAccountNumber : null,
      });
    }
  }

  if (!appInfo.trackEvents || !appInfo.trackEvents.app_download) {
    let appInfo = await doGetAppInformation();
    appInfo = appInfo || {};
    appInfo.trackEvents = appInfo.trackEvents || {};
    appInfo.trackEvents.app_download = true;
    await CommonModel.doSetLocalData(CommonModel.KEYS.APP_INFORMATION, appInfo);
    await CommonModel.doTrackEvent({
      event_name: 'health_download',
      account_number: userInformation ? userInformation.bitmarkAccountNumber : null,
    });
  }

  if (userInformation && userInformation.bitmarkAccountNumber) {
    // Intercom.registerIdentifiedUser({ userId: userInformation.bitmarkAccountNumber }).then(() => {
    //   console.log('registerIdentifiedUser success =============================');
    // }).catch(error => {
    //   console.log('registerIdentifiedUser error :', error);
    // });

    await CommonModel.doStartFaceTouchSessionId('Your fingerprint signature is required.');

    let signatureData = await CommonModel.doCreateSignatureData(CommonModel.getFaceTouchSessionId());
    let result = await NotificationModel.doRegisterJWT(userInformation.bitmarkAccountNumber, signatureData.timestamp, signatureData.signature);
    console.log('doRegisterJWT :', result);
    // let jwt = result.jwt_token;
    // result = await NotificationModel.doGrantingAccess(jwt);
    // console.log('doGrantingAccess :', result);
    // let token = result.id;
    // result = await NotificationModel.doReceiveGrantingAccess(jwt, token);
    // console.log('doReceiveGrantingAccess :', result);
    // result = await NotificationModel.doGetAllGrantedAccess(jwt);
    // console.log('doGetAllGrantedAccess :', result);

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
          event_name: 'health_user_open_app_two_time_in_a_week',
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
      event_name: 'health_user_first_time_issued_weekly_health_data',
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
      event_name: 'health_user_first_time_issued_file',
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

const doGetDonationInformation = () => {
  return new Promise((resolve) => {
    CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_DONATION_INFORMATION).then(resolve).catch((error => {
      console.log('doGetDonationInformation error:', error);
      resolve();
    }));
  });
};

// ======================================================================================================================================================================================
// ======================================================================================================================================================================================
// ======================================================================================================================================================================================
// ======================================================================================================================================================================================
const doGenerateDisplayedData = async () => {

};

const doCheckFileToIssue = async (filePath) => {
  return await BitmarkService.doCheckFileToIssue(filePath, userInformation.bitmarkAccountNumber);
};

const doMarkRequestedNotification = async (result) => {
  let appInfo = await doGetAppInformation();
  appInfo = appInfo || {};

  if (result && result.alert && result.badge && result.sound &&
    (!appInfo.trackEvents || !appInfo.trackEvents.app_user_allow_notification)) {
    appInfo.trackEvents = appInfo.trackEvents || {};
    appInfo.trackEvents.app_user_allow_notification = true;
    await CommonModel.doSetLocalData(CommonModel.KEYS.APP_INFORMATION, appInfo);

    userInformation = userInformation || (await UserModel.doTryGetCurrentUser());
    await CommonModel.doTrackEvent({
      event_name: 'health_user_allow_notification',
      account_number: userInformation ? userInformation.bitmarkAccountNumber : null,
    });
  }
}


const DataProcessor = {
  doOpenApp,
  doCreateAccount,
  doLogin,
  doLogout,
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

  doMarkRequestedNotification,
};

export { DataProcessor };

import DeviceInfo from 'react-native-device-info';
import moment from 'moment';

import {
  EventEmitterService,
  NotificationService,
  BitmarkService,
  AccountService,
} from "../services";
import { CommonModel, AccountModel, UserModel, BitmarkSDK } from '../models';
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
      await doGenerateDonationTask();
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
  let userInfo = await UserModel.doTryGetCurrentUser();
  console.log('userInfo :', userInfo);
  if (userInformation === null || JSON.stringify(userInfo) !== JSON.stringify(userInformation)) {
    userInformation = userInfo;
    EventEmitterService.emit(EventEmitterService.events.CHANGE_USER_INFO, userInfo);
  }
  if (userInformation && userInformation.bitmarkAccountNumber) {
    let donationInformation = await runGetDonationInformationInBackground();
    await doCheckNewDonationInformation(donationInformation, true);
    await doGenerateDonationTask();
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
  let donationInformation = await doReloadUserData();
  if (justCreatedBitmarkAccount && donationInformation) {
    let countActive = 0;
    donationInformation.dataSourceStatuses.forEach(item => {
      countActive += (item.status === 'Active') ? 1 : 0;
    });
    if (countActive === 0) {
      EventEmitterService.emit(EventEmitterService.events.CHECK_DATA_SOURCE_HEALTH_KIT_EMPTY);
    }
  }

  startInterval();
  if (!justCreatedBitmarkAccount && userInformation && userInformation.bitmarkAccountNumber) {
    await NotificationService.doCheckNotificationPermission();
  }
  return userInformation;
};

const doLogin = async (touchFaceIdSession) => {
  userInformation = await AccountService.doGetCurrentAccount(touchFaceIdSession);
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
  userInformation = await UserModel.doTryGetCurrentUser();
  let appInfo = await doGetAppInformation();
  appInfo = appInfo || {};

  if (userInformation && userInformation.bitmarkAccountNumber) {
    configNotification();
    await checkAppNeedResetLocalData(appInfo);

    let donationTasks = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_DONATION_TASK)) || [];
    let totalTasks = 0;
    donationTasks.forEach(item => totalTasks += (item.number ? item.number : 1));
    DataCacheProcessor.setDonationsTasks({
      totalTasks,
      totalDonationTasks: donationTasks.length,
      donationTasks: donationTasks.slice(0, DataCacheProcessor.cacheLength),
    });
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
const doJoinStudy = async (touchFaceIdSession, studyId) => {
  let donationInformation = await DonationService.doJoinStudy(touchFaceIdSession, userInformation.bitmarkAccountNumber, studyId);
  await doCheckNewDonationInformation(donationInformation);
  return donationInformation;
};
const doLeaveStudy = async (touchFaceIdSession, studyId) => {
  let donationInformation = await DonationService.doLeaveStudy(touchFaceIdSession, userInformation.bitmarkAccountNumber, studyId);
  await doCheckNewDonationInformation(donationInformation);
  return donationInformation;
};
const doCompletedStudyTask = async (touchFaceIdSession, study, taskType, result) => {
  let donationInformation = await DonationService.doCompletedStudyTask(touchFaceIdSession, userInformation.bitmarkAccountNumber, study, taskType, result);
  await doCheckNewDonationInformation(donationInformation);
  return donationInformation;
};

const doDonateHealthData = async (touchFaceIdSession, study, list) => {
  let donationInformation = await DonationService.doDonateHealthData(touchFaceIdSession, userInformation.bitmarkAccountNumber, study, list);
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
  return donationInformation;
};

const doDownloadBitmark = async (touchFaceIdSession, bitmarkId) => {
  let filePath = await BitmarkSDK.downloadBitmark(touchFaceIdSession, bitmarkId);
  filePath = filePath.replace('file://', '');
  return filePath;
};

const doIssueFile = async (touchFaceIdSession, filePath, assetName, metadataList, quantity, isPublicAsset, forHealthData) => {
  let result = await BitmarkService.doIssueFile(touchFaceIdSession, filePath, assetName, metadataList, quantity, isPublicAsset);
  if (forHealthData) {
    let donationInformation = await doGetDonationInformation();
    await DonationService.doCompleteTask(touchFaceIdSession, userInformation.bitmarkAccountNumber, donationInformation.commonTaskIds.bitmark_health_issuance, moment().toDate(), result[0]);
  }
  await doReloadUserData();
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
const doGenerateDonationTask = async () => {
  let donationTasks = [];
  let totalTasks = 0;
  let donationInformation = await doGetDonationInformation();

  if (donationInformation && donationInformation.todoTasks) {
    (donationInformation.todoTasks || []).forEach(item => {
      item.key = donationTasks.length;
      item.typeTitle = 'DONATION Request';
      item.timestamp = (item.list && item.list.length > 0) ? item.list[0].endDate : (item.study ? item.study.joinedDate : null);
      donationTasks.push(item);
      totalTasks += item.number;
    });
  }
  donationTasks = donationTasks.sort((a, b) => {
    if (a.important) { return -1; }
    if (b.important) { return 1; }
    if (!a.timestamp) return -1;
    if (!b.timestamp) return 1;
    return moment(b.timestamp).toDate().getTime() - moment(a.timestamp).toDate().getTime();
  });


  await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_DONATION_TASK, donationTasks);

  DataCacheProcessor.setDonationsTasks({
    totalTasks,
    totalDonationTasks: donationTasks.length,
    donationTasks: donationTasks.slice(0, DataCacheProcessor.cacheLength),
  });

  EventEmitterService.emit(EventEmitterService.events.CHANGE_DONATION_TASK, { donationTasks, donationInformation });
  console.log('donationTasks :', donationTasks);
};

const doGetDonationTasks = async (length) => {
  let donationTasks;
  let transactionsScreenDataInCache = DataCacheProcessor.getDonationTasks();
  if (length !== undefined && length <= transactionsScreenDataInCache.donationTasks.length) {
    donationTasks = transactionsScreenDataInCache.donationTasks;
  } else {
    let allDonationTasks = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_DONATION_TASK)) || [];
    donationTasks = (length && length < allDonationTasks.length) ? allDonationTasks.slice(0, length) : allDonationTasks;
  }
  return {
    donationTasks,
    totalTasks: transactionsScreenDataInCache.totalTasks,
    totalDonationTasks: transactionsScreenDataInCache.totalDonationTasks,
  }
};


const DataProcessor = {
  doOpenApp,
  doLogin,
  doLogout,
  doStartBackgroundProcess,
  doReloadUserData,

  doDeactiveApplication,
  doActiveBitmarkHealthData,
  doInactiveBitmarkHealthData,
  doJoinStudy,
  doLeaveStudy,
  doCompletedStudyTask,
  doDonateHealthData,
  doBitmarkHealthData,
  doDownloadBitmark,
  doIssueFile,

  doGetDonationInformation,

  doGetDonationTasks,

  getApplicationVersion,
  getApplicationBuildNumber,
  getUserInformation,
  isAppLoadingData: () => isLoadingData,
};

export { DataProcessor };

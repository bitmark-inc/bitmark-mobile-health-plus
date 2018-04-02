import DeviceInfo from 'react-native-device-info';
import { merge } from 'lodash';

import {
  EventEmiterService,
  NotificationService,
  TransactionService,
  BitmarkService,
  AccountService,
} from "../services";
import { CommonModel, AccountModel, UserModel, BitmarkSDK } from '../models';
import { DonationService } from '../services/donation-service';
import { FileUtil } from '../utils';

let userInformation = {};
let userData = {
  localAssets: null,
  activeIncompingTransferOffers: null,
  transactions: null,
  donationInformation: null,
};
// ================================================================================================================================================
// ================================================================================================================================================

const doCheckRunning = (checkRunning) => {
  return new Promise((resolve) => {
    let checkAndReturn = () => {
      let isRunning = checkRunning();
      if (!isRunning) {
        resolve();
      } else {
        setTimeout(checkAndReturn, 200);
      }
    }
    checkAndReturn();
  })
};

const recheckLocalAssets = (localAssets) => {
  if (userData && userData.donationInformation && userData.donationInformation.completedTasks) {
    for (let asset of localAssets) {
      for (let bitmark of asset.bitmarks) {
        let isDonating = userData.donationInformation.completedTasks.findIndex(item => (item.taskType !== userData.donationInformation.commonTaskIds.bitmark_health_data && item.bitmarkId === bitmark.id));
        bitmark.status = isDonating >= 0 ? 'donating' : bitmark.status;
      }
    }
  }
  return localAssets;
};

let isRunningGetActiveIncomingTransferOfferInBackground = false;
const runGetActiveIncomingTransferOfferInBackground = () => {
  return new Promise((resolve) => {
    if (isRunningGetActiveIncomingTransferOfferInBackground) {
      return doCheckRunning(() => isRunningGetActiveIncomingTransferOfferInBackground).then(resolve);
    }
    isRunningGetActiveIncomingTransferOfferInBackground = true;
    TransactionService.doGetActiveIncomingTransferOffers(userInformation.bitmarkAccountNumber).then(activeIncompingTransferOffers => {
      if (userData.activeIncompingTransferOffers === null || JSON.stringify(activeIncompingTransferOffers) !== JSON.stringify(userData.activeIncompingTransferOffers)) {
        userData.activeIncompingTransferOffers = activeIncompingTransferOffers;
        EventEmiterService.emit(EventEmiterService.events.CHANGE_USER_DATA_ACTIVE_INCOMING_TRANSFER_OFFER);
      }
      resolve();
      isRunningGetActiveIncomingTransferOfferInBackground = false;
      console.log('runOnBackground  runGetActiveIncomingTransferOfferInBackground success :');
    }).catch(error => {
      resolve();
      isRunningGetActiveIncomingTransferOfferInBackground = false;
      console.log('runOnBackground  runGetActiveIncomingTransferOfferInBackground error :', error);
    });
  });
};

let isRunningGetTransactionsInBackground = false;
const runGetTransactionsInBackground = () => {
  return new Promise((resolve) => {
    if (isRunningGetTransactionsInBackground) {
      return doCheckRunning(() => isRunningGetTransactionsInBackground).then(resolve);
    }
    isRunningGetTransactionsInBackground = true;
    TransactionService.getAllTransactions(userInformation.bitmarkAccountNumber).then(transactions => {
      if (userData.transactions === null || JSON.stringify(transactions) !== JSON.stringify(userData.transactions)) {
        userData.transactions = transactions;
        EventEmiterService.emit(EventEmiterService.events.CHANGE_USER_DATA_TRANSACTIONS);
      }
      resolve();
      isRunningGetTransactionsInBackground = false;
      console.log('runOnBackground  runGetTransactionsInBackground success :');
    }).catch(error => {
      resolve();
      isRunningGetTransactionsInBackground = false;
      console.log('runOnBackground  runGetTransactionsInBackground error :', error);
    });
  });
};

let isRunningGetLocalBitmarksInBackground = false;
const runGetLocalBitmarksInBackground = () => {
  return new Promise((resolve) => {
    if (isRunningGetLocalBitmarksInBackground) {
      return doCheckRunning(() => isRunningGetLocalBitmarksInBackground).then(resolve);
    }
    isRunningGetLocalBitmarksInBackground = true;
    BitmarkService.doGetBitmarks(userInformation.bitmarkAccountNumber, userData.localAssets).then(localAssets => {
      localAssets = recheckLocalAssets(localAssets);
      if (userData.localAssets === null || JSON.stringify(localAssets) !== JSON.stringify(userData.localAssets)) {
        userData.localAssets = localAssets;
        EventEmiterService.emit(EventEmiterService.events.CHANGE_USER_DATA_LOCAL_BITMARKS);
      }
      resolve();
      isRunningGetLocalBitmarksInBackground = false;
      console.log('runOnBackground  runGetLocalBitmarksInBackground success :', localAssets);
    }).catch(error => {
      resolve();
      isRunningGetLocalBitmarksInBackground = false;
      console.log('runOnBackground  runGetLocalBitmarksInBackground error :', error);
    });
  });
};

let isRunningGetDonationInformationInBackground = false
const runGetDonationInformationInBackground = () => {
  return new Promise((resolve) => {
    if (isRunningGetDonationInformationInBackground) {
      return doCheckRunning(() => isRunningGetDonationInformationInBackground).then(resolve);
    }
    console.log('run 1');
    isRunningGetDonationInformationInBackground = true;
    DonationService.doGetUserInformation(userInformation.bitmarkAccountNumber).then(donationInformation => {
      console.log('run 2');
      if (userData.donationInformation === null || JSON.stringify(donationInformation) !== JSON.stringify(userData.donationInformation)) {
        userData.donationInformation = donationInformation;
        EventEmiterService.emit(EventEmiterService.events.CHANGE_USER_DATA_DONATION_INFORMATION);
      }
      resolve();
      isRunningGetDonationInformationInBackground = false;
      console.log('runOnBackground  runGetDonationInformationInBackground success :', donationInformation);
    }).catch(error => {
      console.log('run 3');
      resolve();
      isRunningGetDonationInformationInBackground = false;
      console.log('runOnBackground  runGetDonationInformationInBackground error :', error);
    });
  });
};
const configNotification = () => {
  const onRegisterred = (registerredNotificaitonInfo) => {
    let notificationUUID = registerredNotificaitonInfo ? registerredNotificaitonInfo.token : null;
    if (notificationUUID && userInformation.notificationUUID !== notificationUUID) {
      NotificationService.doRegisterNotificationInfo(userInformation.bitmarkAccountNumber, notificationUUID, (userData.donationInformation && userData.donationInformation.createdAt)).then(() => {
        userInformation.notificationUUID = notificationUUID;
        return UserModel.doUpdateUserInfo(userInformation);
      }).catch(error => {
        console.log('DataController doRegisterNotificationInfo error:', error);
      });
    }
  };
  const onReceivedNotification = async (notificationData) => {
    console.log('onReceivedNotification notificationData:', notificationData);
    if (!notificationData.foreground) {
      EventEmiterService.emit(EventEmiterService.events.APP_RECEIVED_NOTIFICATION, notificationData.data);
    } else if (notificationData.event === 'transfer_request' || notificationData.event === 'transfer_completed' ||
      notificationData.event === 'transfer_accepted') {
      runGetActiveIncomingTransferOfferInBackground();
      runGetTransactionsInBackground();
    } else if (notificationData.event === 'transfer_rejected' || notificationData.event === 'transfer_failed') {
      runGetLocalBitmarksInBackground();
    }
    NotificationService.setApplicationIconBadgeNumber(0);
  };
  NotificationService.configure(onRegisterred, onReceivedNotification);
  NotificationService.removeAllDeliveredNotifications();
};

const runOnBackground = async () => {
  let userInfo = await UserModel.doTryGetCurrentUser();
  if (userInformation === null || JSON.stringify(userInfo) !== JSON.stringify(userInformation)) {
    userInformation = userInfo;
    EventEmiterService.emit(EventEmiterService.events.CHANGE_USER_INFO)
  }
  if (userInformation && userInformation.bitmarkAccountNumber) {
    await runGetTransactionsInBackground();
    await runGetActiveIncomingTransferOfferInBackground();
    await runGetDonationInformationInBackground();
    await runGetLocalBitmarksInBackground();
  }
};
// ================================================================================================================================================
// ================================================================================================================================================
let dataInterval = null;
const startInterval = () => {
  stopInterval();
  dataInterval = setInterval(runOnBackground, 10 * 1000);
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
  await runOnBackground();
  configNotification();
  startInterval();
  if (!justCreatedBitmarkAccount && userInformation && userInformation.bitmarkAccountNumber) {
    await NotificationService.doCheckNotificaitonPermission();
  }
  return userInformation;
};

const doLogin = async (touchFaceIdSession) => {
  userInformation = await AccountService.doGetCurrentAccount(touchFaceIdSession);
  return userInformation;
};

const doLogout = async () => {
  if (userInformation.notificationUUID) {
    let signatureData = await CommonModel.doTryCreateSignatureData('Touch/Face ID or a passcode is required to authorize your transactions')
    await NotificationService.doTryDeregisterNotificationInfo(userInformation.bitmarkAccountNumber, userInformation.notificationUUID, signatureData);
  }
  await AccountModel.doLogout();
  await UserModel.doRemoveUserInfo();
  userInformation = {};
  userData = {
    localAssets: null,
    activeIncompingTransferOffers: null,
    transactions: null,
  };
};


const doDeactiveApplication = async () => {
  stopInterval();
};

const doGetTransactionData = async () => {
  let activeIncompingTransferOffers = await TransactionService.doGetActiveIncomingTransferOffers(userInformation.bitmarkAccountNumber);
  let transactions = await TransactionService.getAllTransactions(userInformation.bitmarkAccountNumber);
  if (userData.activeIncompingTransferOffers === null || JSON.stringify(activeIncompingTransferOffers) !== JSON.stringify(userData.activeIncompingTransferOffers)) {
    userData.activeIncompingTransferOffers = activeIncompingTransferOffers;
    EventEmiterService.emit(EventEmiterService.events.CHANGE_USER_DATA_ACTIVE_INCOMING_TRANSFER_OFFER);
  }
  if (userData.transactions === null || JSON.stringify(transactions) !== JSON.stringify(userData.transactions)) {
    userData.transactions = transactions;
    EventEmiterService.emit(EventEmiterService.events.CHANGE_USER_DATA_TRANSACTIONS);
  }
  await runGetLocalBitmarksInBackground();
};

const doOpenApp = async () => {
  userInformation = await UserModel.doTryGetCurrentUser();
  let transactions = await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRANSACTIONS);
  transactions = transactions.length > 0 ? transactions : null;
  if (userData.transactions === null || JSON.stringify(transactions) !== JSON.stringify(userData.transactions)) {
    userData.transactions = transactions;
    EventEmiterService.emit(EventEmiterService.events.CHANGE_USER_DATA_TRANSACTIONS);
  }
  let activeIncompingTransferOffers = await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRANSFER_OFFERS);
  activeIncompingTransferOffers = activeIncompingTransferOffers.length > 0 ? activeIncompingTransferOffers : null;
  if (userData.activeIncompingTransferOffers === null || JSON.stringify(activeIncompingTransferOffers) !== JSON.stringify(userData.activeIncompingTransferOffers)) {
    userData.activeIncompingTransferOffers = activeIncompingTransferOffers;
    EventEmiterService.emit(EventEmiterService.events.CHANGE_USER_DATA_ACTIVE_INCOMING_TRANSFER_OFFER);
  }
  let donationInformation = await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_DONATION_INFORMATION);
  if (userData.donationInformation === null || JSON.stringify(donationInformation) !== JSON.stringify(userData.donationInformation)) {
    userData.donationInformation = donationInformation || {};
  }
  let localAssets = await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_LOCAL_BITMARKS);
  localAssets = localAssets.length > 0 ? localAssets : null;
  if (userData.localAssets === null || JSON.stringify(localAssets) !== JSON.stringify(userData.localAssets)) {
    userData.localAssets = localAssets || [];
  }
  console.log('userInformation :', userInformation);
  console.log('userData :', userData);
  return userInformation;
};

const doActiveDonation = async (touchFaceIdSession) => {
  let donationInformation = await DonationService.doRegisterUserInformation(touchFaceIdSession, userInformation.bitmarkAccountNumber, userInformation.notificationUUID);
  if (userData.donationInformation === null || JSON.stringify(donationInformation) !== JSON.stringify(userData.donationInformation)) {
    userData.donationInformation = donationInformation;
    EventEmiterService.emit(EventEmiterService.events.CHANGE_USER_DATA_DONATION_INFORMATION);
  }
};
const doJoinStudy = async (touchFaceIdSession, studyId) => {
  let donationInformation = await DonationService.doJoinStudy(touchFaceIdSession, userInformation.bitmarkAccountNumber, studyId);
  if (userData.donationInformation === null || JSON.stringify(donationInformation) !== JSON.stringify(userData.donationInformation)) {
    userData.donationInformation = donationInformation;
    EventEmiterService.emit(EventEmiterService.events.CHANGE_USER_DATA_DONATION_INFORMATION);
  }
};
const doLeaveStudy = async (touchFaceIdSession, studyId) => {
  let donationInformation = await DonationService.doLeaveStudy(touchFaceIdSession, userInformation.bitmarkAccountNumber, studyId);
  if (userData.donationInformation === null || JSON.stringify(donationInformation) !== JSON.stringify(userData.donationInformation)) {
    userData.donationInformation = donationInformation;
    EventEmiterService.emit(EventEmiterService.events.CHANGE_USER_DATA_DONATION_INFORMATION);
  }
};
const doCompletedStudyTask = async (touchFaceIdSession, study, taskType, result) => {
  let donationInformation = await DonationService.doCompletedStudyTask(touchFaceIdSession, userInformation.bitmarkAccountNumber, study, taskType, result);
  if (userData.donationInformation === null || JSON.stringify(donationInformation) !== JSON.stringify(userData.donationInformation)) {
    userData.donationInformation = donationInformation;
    EventEmiterService.emit(EventEmiterService.events.CHANGE_USER_DATA_DONATION_INFORMATION);
  }
};

const doDonateHealthData = async (touchFaceIdSession, study, list) => {
  let donationInformation = await DonationService.doDonateHealthData(touchFaceIdSession, userInformation.bitmarkAccountNumber, study, list);
  if (userData.donationInformation === null || JSON.stringify(donationInformation) !== JSON.stringify(userData.donationInformation)) {
    userData.donationInformation = donationInformation;
    EventEmiterService.emit(EventEmiterService.events.CHANGE_USER_DATA_DONATION_INFORMATION);
  }
};

const doBitmarkHealthData = async (touchFaceIdSession, list) => {
  let donationInformation = await DonationService.doBitmarkHealthData(touchFaceIdSession,
    userInformation.bitmarkAccountNumber,
    userData.donationInformation.allDataTypes,
    list,
    userData.donationInformation.commonTaskIds.bitmark_health_data);
  if (userData.donationInformation === null || JSON.stringify(donationInformation) !== JSON.stringify(userData.donationInformation)) {
    userData.donationInformation = donationInformation;
    EventEmiterService.emit(EventEmiterService.events.CHANGE_USER_DATA_DONATION_INFORMATION);
  }
};

const doDownloadBitmark = async (touchFaceIdSession, bitmark) => {
  let filePath = await BitmarkSDK.downloadBitmark(touchFaceIdSession, bitmark.id);
  filePath = filePath.replace('file://', '');

  // let lastDotIndex = filePath.lastIndexOf('.');
  // let extName = filePath.substring(lastDotIndex + 1, filePath.length);
  // if (extName === 'zip') {

  //   // let folderPath = FileUtil.DocumentDirectory + '/test';
  //   // await FileUtil.mkdir(folderPath);
  //   // let tempfile = folderPath + '/test.txt';
  //   // await FileUtil.create(tempfile, "Test zip and unzip file!", 'utf8');

  //   // let zipFile = await FileUtil.zip(folderPath, FileUtil.DocumentDirectory + '/test.zip');
  //   // await FileUtil.remove(tempfile);
  //   // console.log('zipFile :', zipFile);

  //   // let unZipfile = await FileUtil.unzip(zipFile, folderPath);
  //   // console.log('unZipfile :', unZipfile);

  //   let folderUnZip = await FileUtil.unzip(filePath, FileUtil.DocumentDirectory + '/' + bitmark.id);
  //   console.log('folderUnZip :', folderUnZip)
  //   return folderUnZip;
  // }
  return filePath;
};

const getTransactionData = () => {
  return merge({}, {
    activeIncompingTransferOffers: userData.activeIncompingTransferOffers || [],
    transactions: userData.transactions || [],
  });
}
const getUserBitmarks = () => {
  return merge({}, {
    localAssets: userData.localAssets || [],
  });
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

const getLocalBitmarkInformation = (bitmarkId, assetId) => {
  let bitmark;
  let asset;
  if (assetId) {
    asset = userData.localAssets.find(localAsset => localAsset.id === assetId);
    if (bitmarkId) {
      bitmark = (asset ? asset.bitmarks : []).find(localBitmark => localBitmark.id === bitmarkId);
    }
  } else if (bitmarkId) {
    asset = userData.localAssets.find(localAsset => {
      bitmark = localAsset.bitmarks.find(localBitmark => localBitmark.id === bitmarkId);
      return !!bitmark;
    });
  }
  return { bitmark, asset };
};

const getDonationInformation = () => {
  return merge({}, userData.donationInformation || {});
};

const DataController = {
  doReloadData: runOnBackground,
  doOpenApp,
  doLogin,
  doLogout,
  doStartBackgroundProcess,
  doDeactiveApplication,
  reloadBitmarks: runGetLocalBitmarksInBackground,
  doGetTransactionData,
  doActiveDonation,
  doJoinStudy,
  doLeaveStudy,
  doCompletedStudyTask,
  doDonateHealthData,
  doBitmarkHealthData,
  doReloadDonationInformation: runGetDonationInformationInBackground,
  doDownloadBitmark,

  getTransactionData,
  getUserBitmarks,
  getUserInformation,
  getApplicationVersion,
  getApplicationBuildNumber,
  getLocalBitmarkInformation,
  getDonationInformation,
};

export { DataController };
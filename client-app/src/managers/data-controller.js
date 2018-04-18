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

let userInformation = {};
let userData = {
  localAssets: null,
  activeIncompingTransferOffers: null,
  transactions: null,
  donationInformation: null,
  trackingBitmarks: null,
};
let doneFirstTimeLoadData = false;
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
        bitmark.displayStatus = isDonating >= 0 ? 'donating' : bitmark.displayStatus;
      }
    }
  }
  localAssets = localAssets.filter(asset => {
    if (asset.bitmarks && asset.bitmarks.length === 1 && asset.bitmarks[0].displayStatus === 'donating') {
      return false;
    }
    return true;
  });
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
      activeIncompingTransferOffers = activeIncompingTransferOffers || [];
      if (userData.activeIncompingTransferOffers === null || JSON.stringify(activeIncompingTransferOffers) !== JSON.stringify(userData.activeIncompingTransferOffers)) {
        userData.activeIncompingTransferOffers = activeIncompingTransferOffers;
        CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_TRANSFER_OFFERS, userData.activeIncompingTransferOffers);
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
    TransactionService.getAllTransactions(userInformation.bitmarkAccountNumber, userData.transactions).then(transactions => {
      transactions = transactions || [];
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
      localAssets = localAssets || [];
      localAssets = recheckLocalAssets(localAssets);
      if (userData.localAssets === null || JSON.stringify(localAssets) !== JSON.stringify(userData.localAssets)) {
        userData.localAssets = localAssets;
        CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_LOCAL_BITMARKS, userData.localAssets);
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
    isRunningGetDonationInformationInBackground = true;
    DonationService.doGetUserInformation(userInformation.bitmarkAccountNumber).then(donationInformation => {
      donationInformation = donationInformation || {};
      if (userData.donationInformation === null || JSON.stringify(donationInformation) !== JSON.stringify(userData.donationInformation)) {
        userData.donationInformation = donationInformation;
        CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_DONATION_INFORMATION, userData.donationInformation);
        EventEmiterService.emit(EventEmiterService.events.CHANGE_USER_DATA_DONATION_INFORMATION);
      }
      resolve();
      isRunningGetDonationInformationInBackground = false;
      console.log('runOnBackground  runGetDonationInformationInBackground success :', donationInformation);
    }).catch(error => {
      resolve();
      isRunningGetDonationInformationInBackground = false;
      console.log('runOnBackground  runGetDonationInformationInBackground error :', error);
    });
  });
};

let isRunningGetTrackingBitmarksInBackground = false;
const runGetTrackingBitmarksInBackground = () => {
  return new Promise((resolve) => {
    if (isRunningGetTrackingBitmarksInBackground) {
      return doCheckRunning(() => isRunningGetTrackingBitmarksInBackground).then(resolve);
    }
    isRunningGetTrackingBitmarksInBackground = true;
    BitmarkService.doGetTrackingBitmarks(userInformation.bitmarkAccountNumber, userData.trackingBitmarks).then(trackingBitmarks => {
      trackingBitmarks = trackingBitmarks || [];
      if (userData.trackingBitmarks === null || JSON.stringify(trackingBitmarks) !== JSON.stringify(userData.trackingBitmarks)) {
        userData.trackingBitmarks = trackingBitmarks;
        CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_TRACKIING_BITMARKS, userData.trackingBitmarks);
        EventEmiterService.emit(EventEmiterService.events.CHANGE_USER_DATA_TRACKING_BITMARKS);
      }
      resolve();
      isRunningGetTrackingBitmarksInBackground = false;
      console.log('runOnBackground  runGetTrackingBitmarksInBackground success :', trackingBitmarks);
    }).catch(error => {
      resolve();
      isRunningGetTrackingBitmarksInBackground = false;
      console.log('runOnBackground  runGetTrackingBitmarksInBackground error :', error);
    });
  });
};


const configNotification = () => {
  const onRegisterred = async (registerredNotificaitonInfo) => {
    let notificationUUID = registerredNotificaitonInfo ? registerredNotificaitonInfo.token : null;
    if (!userInformation || !userInformation.bitmarkAccountNumber) {
      userInformation = await UserModel.doGetCurrentUser();
    }
    if (notificationUUID && userInformation.notificationUUID !== notificationUUID) {
      NotificationService.doRegisterNotificationInfo(userInformation.bitmarkAccountNumber, notificationUUID).then(() => {
        userInformation.notificationUUID = notificationUUID;
        return UserModel.doUpdateUserInfo(userInformation);
      }).catch(error => {
        console.log('DataController doRegisterNotificationInfo error:', error);
      });
    }
  };
  const onReceivedNotification = async (notificationData) => {
    if (!notificationData.foreground) {
      setTimeout(() => {
        EventEmiterService.emit(EventEmiterService.events.APP_RECEIVED_NOTIFICATION, notificationData.data);
      }, 1000);
    } else if (notificationData.event === 'transfer_request' || notificationData.event === 'transfer_completed' || notificationData.event === 'transfer_accepted') {
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
    await runGetTrackingBitmarksInBackground();
    await runGetLocalBitmarksInBackground();
  }
  doneFirstTimeLoadData = true;
  EventEmiterService.emit(EventEmiterService.events.APP_LOAD_FIRST_DATA, doneFirstTimeLoadData);
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
  await runOnBackground();
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

const doOpenApp = async () => {
  userInformation = await UserModel.doTryGetCurrentUser();
  if (userInformation && userInformation.bitmarkAccountNumber) {
    configNotification();
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
    let trackingBitmarks = await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRACKIING_BITMARKS);
    trackingBitmarks = trackingBitmarks.length > 0 ? trackingBitmarks : [];
    if (userData.trackingBitmarks === null || JSON.stringify(trackingBitmarks) !== JSON.stringify(userData.trackingBitmarks)) {
      userData.trackingBitmarks = trackingBitmarks || [];
    }
    let localAssets = await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_LOCAL_BITMARKS);
    localAssets = localAssets.length > 0 ? localAssets : [];
    localAssets = recheckLocalAssets(localAssets);
    if (userData.localAssets === null || JSON.stringify(localAssets) !== JSON.stringify(userData.localAssets)) {
      userData.localAssets = localAssets || [];
    }
  }
  doneFirstTimeLoadData = userData.transactions && userData.activeIncompingTransferOffers && userData.donationInformation && userData.localAssets;
  EventEmiterService.emit(EventEmiterService.events.APP_LOAD_FIRST_DATA, doneFirstTimeLoadData);
  console.log('userInformation :', userInformation);
  console.log('userData :', userData);
  return userInformation;
};

const doActiveBitmarkHealthData = async (touchFaceIdSession, activeBitmarkHealthDataAt) => {
  let donationInformation = await DonationService.doActiveBitmarkHealthData(touchFaceIdSession, userInformation.bitmarkAccountNumber, activeBitmarkHealthDataAt);
  if (userData.donationInformation === null || JSON.stringify(donationInformation) !== JSON.stringify(userData.donationInformation)) {
    userData.donationInformation = donationInformation;
    EventEmiterService.emit(EventEmiterService.events.CHANGE_USER_DATA_DONATION_INFORMATION);
  }
  return donationInformation;
};
const doInactiveBitmarkHealthData = async (touchFaceIdSession) => {
  let donationInformation = await DonationService.doInactiveBitmarkHealthData(touchFaceIdSession, userInformation.bitmarkAccountNumber);
  if (userData.donationInformation === null || JSON.stringify(donationInformation) !== JSON.stringify(userData.donationInformation)) {
    userData.donationInformation = donationInformation;
    EventEmiterService.emit(EventEmiterService.events.CHANGE_USER_DATA_DONATION_INFORMATION);
  }
  return donationInformation;
};
const doJoinStudy = async (touchFaceIdSession, studyId) => {
  let donationInformation = await DonationService.doJoinStudy(touchFaceIdSession, userInformation.bitmarkAccountNumber, studyId);
  if (userData.donationInformation === null || JSON.stringify(donationInformation) !== JSON.stringify(userData.donationInformation)) {
    userData.donationInformation = donationInformation;
    EventEmiterService.emit(EventEmiterService.events.CHANGE_USER_DATA_DONATION_INFORMATION);
  }
  return donationInformation;
};
const doLeaveStudy = async (touchFaceIdSession, studyId) => {
  let donationInformation = await DonationService.doLeaveStudy(touchFaceIdSession, userInformation.bitmarkAccountNumber, studyId);
  if (userData.donationInformation === null || JSON.stringify(donationInformation) !== JSON.stringify(userData.donationInformation)) {
    userData.donationInformation = donationInformation;
    EventEmiterService.emit(EventEmiterService.events.CHANGE_USER_DATA_DONATION_INFORMATION);
  }
  return donationInformation;
};
const doCompletedStudyTask = async (touchFaceIdSession, study, taskType, result) => {
  let donationInformation = await DonationService.doCompletedStudyTask(touchFaceIdSession, userInformation.bitmarkAccountNumber, study, taskType, result);
  if (userData.donationInformation === null || JSON.stringify(donationInformation) !== JSON.stringify(userData.donationInformation)) {
    userData.donationInformation = donationInformation;
    EventEmiterService.emit(EventEmiterService.events.CHANGE_USER_DATA_DONATION_INFORMATION);
  }
  return donationInformation;
};

const doDonateHealthData = async (touchFaceIdSession, study, list) => {
  let donationInformation = await DonationService.doDonateHealthData(touchFaceIdSession, userInformation.bitmarkAccountNumber, study, list);
  if (userData.donationInformation === null || JSON.stringify(donationInformation) !== JSON.stringify(userData.donationInformation)) {
    userData.donationInformation = donationInformation;
    EventEmiterService.emit(EventEmiterService.events.CHANGE_USER_DATA_DONATION_INFORMATION);
  }
  return donationInformation;
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
  return donationInformation;
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

const doUpdateViewStatus = async (assetId, bitmarkId) => {
  if (assetId && bitmarkId) {
    let localAsset = (userData.localAssets || []).find(la => la.id === assetId);
    if (localAsset && !localAsset.isViewed) {
      let assetViewed = true;
      localAsset.bitmarks.forEach(bitmark => {
        if (bitmarkId === bitmark.id) {
          bitmark.isViewed = true;
        }
        if (!bitmark.isViewed && assetViewed) {
          assetViewed = false;
        }
      });
      localAsset.isViewed = assetViewed;
      await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_LOCAL_BITMARKS, userData.localAssets);
      EventEmiterService.emit(EventEmiterService.events.CHANGE_USER_DATA_LOCAL_BITMARKS);
    }
  }
  if (bitmarkId) {
    let trackingBitmark = (userData.trackingBitmarks || []).find(tb => tb.id === bitmarkId);
    if (trackingBitmark) {
      let hasChanging = !trackingBitmark.isViewed;
      trackingBitmark.isViewed = true;
      trackingBitmark.lastHistory = {
        status: trackingBitmark.status,
        head_id: trackingBitmark.head_id,
      };
      await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_TRACKIING_BITMARKS, userData.trackingBitmarks);
      if (hasChanging) {
        EventEmiterService.emit(EventEmiterService.events.CHANGE_USER_DATA_LOCAL_BITMARKS);
      }
    }
  }
};

const doTrackingBitmark = async (touchFaceIdSession, asset, bitmark) => {
  // TODO call API
  let trackingBitmark = merge({}, bitmark);
  trackingBitmark.asset = asset;
  trackingBitmark.isViewed = true;
  trackingBitmark.lastHistory = {
    status: bitmark.status,
    head_id: bitmark.head_id,
  };
  if (!userData.trackingBitmarks) {
    userData.trackingBitmarks = [];
  }
  userData.trackingBitmarks.push(trackingBitmark);
  await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_TRACKIING_BITMARKS, userData.trackingBitmarks);
  EventEmiterService.emit(EventEmiterService.events.CHANGE_USER_DATA_TRACKING_BITMARKS);
};
const doStopTrackingBitmark = async (touchFaceIdSession, bitmark) => {
  // TODO call API
  let trackingBitmarkIndex = (userData.trackingBitmarks || []).findIndex(tb => tb.id = bitmark.id);
  if (trackingBitmarkIndex >= 0) {
    userData.trackingBitmarks.splice(trackingBitmarkIndex, 1);
    await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_TRACKIING_BITMARKS, userData.trackingBitmarks);
    EventEmiterService.emit(EventEmiterService.events.CHANGE_USER_DATA_TRACKING_BITMARKS);
  }
};

const doGetProvenance = async (bitmarkId) => {
  let trackingBitmark = (userData.trackingBitmarks || []).find(tb => tb.id = bitmarkId);
  if (trackingBitmark) {
    return await BitmarkService.doGetProvenance(bitmarkId, trackingBitmark.lastHistory.head_id, trackingBitmark.lastHistory.status);
  } else {
    return await BitmarkService.doGetProvenance(bitmarkId);
  }
}

const getTransactionData = () => {
  return merge({}, {
    activeIncompingTransferOffers: userData.activeIncompingTransferOffers,
    transactions: userData.transactions,
  });
}
const getUserBitmarks = () => {
  return merge({}, { localAssets: userData.localAssets });
};

const getTrackingBitmarks = () => {
  return merge({}, { trackingBitmarks: userData.trackingBitmarks });
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

const getTrackingBitmarkInformation = (bitmarkId) => {
  return (userData.trackingBitmarks || []).find(bitmark => bitmark.id === bitmarkId);
};

const DataController = {
  doOpenApp,
  doLogin,
  doLogout,
  doStartBackgroundProcess,
  doReloadUserData: runOnBackground,

  doDeactiveApplication,
  doActiveBitmarkHealthData,
  doInactiveBitmarkHealthData,
  doJoinStudy,
  doLeaveStudy,
  doCompletedStudyTask,
  doDonateHealthData,
  doBitmarkHealthData,
  doDownloadBitmark,
  doUpdateViewStatus,
  doTrackingBitmark,
  doStopTrackingBitmark,
  doGetProvenance,


  getTransactionData,
  getUserBitmarks,
  getTrackingBitmarks,
  getUserInformation,
  getApplicationVersion,
  getApplicationBuildNumber,
  getLocalBitmarkInformation,
  getDonationInformation,
  getTrackingBitmarkInformation,
  isDoneFirstimeLoadData: () => doneFirstTimeLoadData,
};

export { DataController };
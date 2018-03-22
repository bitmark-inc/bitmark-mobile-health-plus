import DeviceInfo from 'react-native-device-info';
import { merge } from 'lodash';

import {
  EventEmiterService,
  NotificationService,
  TransactionService,
  BitmarkService,
} from "../services";
import { CommonModel, AccountModel, UserModel } from '../models';
import { DonationService } from '../services/donation-service';

let userInformation = {};
let userData = {
  localAssets: null,
  activeIncompingTransferOffers: null,
  transactions: null,
  donationInformation: null,
};
// ================================================================================================================================================
// ================================================================================================================================================

const recheckLocalAssets = (localAssets) => {
  if (userData && userData.donationInformation && userData.donationInformation.completedTasks) {
    for (let asset of localAssets) {
      for (let bitmark of asset.bitmarks) {
        let isDonating = userData.donationInformation.completedTasks.findIndex(item => item.txid === bitmark.id);
        bitmark.status = isDonating >= 0 ? 'donating' : bitmark.status;
      }
    }
  }
  return localAssets;
};

const runGetActiveIncomingTransferOfferInBackground = () => {
  return new Promise((resolve) => {
    TransactionService.doGetActiveIncomingTransferOffers(userInformation.bitmarkAccountNumber).then(activeIncompingTransferOffers => {
      if (userData.activeIncompingTransferOffers === null || JSON.stringify(activeIncompingTransferOffers) !== JSON.stringify(userData.activeIncompingTransferOffers)) {
        userData.activeIncompingTransferOffers = activeIncompingTransferOffers;
        EventEmiterService.emit(EventEmiterService.events.CHANGE_USER_DATA_ACTIVE_INCOMING_TRANSFER_OFFER);
      }
      resolve();
      console.log('runOnBackground  runGetActiveIncomingTransferOfferInBackground success :');
    }).catch(error => {
      resolve();
      console.log('runOnBackground  runGetActiveIncomingTransferOfferInBackground error :', error);
    });
  });

};

const runGetTransactionsInBackground = () => {
  return new Promise((resolve) => {
    TransactionService.getAllTransactions(userInformation.bitmarkAccountNumber).then(transactions => {
      if (userData.transactions === null || JSON.stringify(transactions) !== JSON.stringify(userData.transactions)) {
        userData.transactions = transactions;
        EventEmiterService.emit(EventEmiterService.events.CHANGE_USER_DATA_TRANSACTIONS);
      }
      resolve();
      console.log('runOnBackground  runGetTransactionsInBackground success :');
    }).catch(error => {
      resolve();
      console.log('runOnBackground  runGetTransactionsInBackground error :', error);
    });
  });
};

const runGetLocalBitmarksInBackground = () => {
  return new Promise((resolve) => {
    BitmarkService.doGetBitmarks(userInformation.bitmarkAccountNumber).then(localAssets => {
      localAssets = recheckLocalAssets(localAssets);
      if (userData.localAssets === null || JSON.stringify(localAssets) !== JSON.stringify(userData.localAssets)) {
        userData.localAssets = localAssets;
        EventEmiterService.emit(EventEmiterService.events.CHANGE_USER_DATA_LOCAL_BITMARKS);
      }
      resolve();
      console.log('runOnBackground  runGetLocalBitmarksInBackground success :');
    }).catch(error => {
      resolve();
      console.log('runOnBackground  runGetLocalBitmarksInBackground error :', error);
    });
  });
};

const runGetDonationInformationInBackground = () => {
  return new Promise((resolve) => {
    DonationService.doGetUserInformation(userInformation.bitmarkAccountNumber).then(donationInformation => {
      console.log('donationInformation :', donationInformation);
      if (userData.donationInformation === null || JSON.stringify(donationInformation) !== JSON.stringify(userData.donationInformation)) {
        userData.donationInformation = donationInformation;
        EventEmiterService.emit(EventEmiterService.events.CHANGE_USER_DATA_DONATION_INFORMATION);
      }
      resolve();
      console.log('runOnBackground  runGetDonationInformationInBackground success :');
    }).catch(error => {
      resolve();
      console.log('runOnBackground  runGetDonationInformationInBackground error :', error);
    });
  });
};
const configNotification = () => {
  const onRegisterred = (registerredNotificaitonInfo) => {
    let notificationUUID = registerredNotificaitonInfo ? registerredNotificaitonInfo.token : null;
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
  userInformation = await AccountModel.doGetCurrentAccount(touchFaceIdSession);
  await UserModel.doUpdateUserInfo(userInformation);
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
const reloadBitmarks = async () => {
  let localAssets = await BitmarkService.doGetBitmarks(userInformation.bitmarkAccountNumber);
  localAssets = recheckLocalAssets(localAssets);
  if (userData.localAssets === null || JSON.stringify(localAssets) !== JSON.stringify(userData.localAssets)) {
    userData.localAssets = localAssets;
    EventEmiterService.emit(EventEmiterService.events.CHANGE_USER_DATA_LOCAL_BITMARKS);
  }
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
  await reloadBitmarks();
};

const doOpenApp = async () => {
  userInformation = await UserModel.doTryGetCurrentUser();
  let transactions = await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRANSACTIONS);
  if (userData.transactions === null || JSON.stringify(transactions) !== JSON.stringify(userData.transactions)) {
    userData.transactions = transactions;
    EventEmiterService.emit(EventEmiterService.events.CHANGE_USER_DATA_TRANSACTIONS);
  }
  let activeIncompingTransferOffers = await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRANSFER_OFFERS);
  if (userData.activeIncompingTransferOffers === null || JSON.stringify(activeIncompingTransferOffers) !== JSON.stringify(userData.activeIncompingTransferOffers)) {
    userData.activeIncompingTransferOffers = activeIncompingTransferOffers;
    EventEmiterService.emit(EventEmiterService.events.CHANGE_USER_DATA_ACTIVE_INCOMING_TRANSFER_OFFER);
  }
  let donationInformation = await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_DONATION_INFORMATION);
  if (userData.donationInformation === null || JSON.stringify(donationInformation) !== JSON.stringify(userData.donationInformation)) {
    userData.donationInformation = donationInformation || {};
  }
  let localAssets = await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_LOCAL_BITMARKS);
  if (userData.localAssets === null || JSON.stringify(localAssets) !== JSON.stringify(userData.localAssets)) {
    userData.localAssets = localAssets || [];
  }
  return userInformation;
};

const doActiveDonation = async (touchFaceIdSession) => {
  let donationInformation = await DonationService.doRegisterUserInformation(touchFaceIdSession, userInformation.bitmarkAccountNumber);
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
    donationInformation.allDataTypes,
    list,
    donationInformation.commonTaskIds.bitmark_health_data);
  if (userData.donationInformation === null || JSON.stringify(donationInformation) !== JSON.stringify(userData.donationInformation)) {
    userData.donationInformation = donationInformation;
    EventEmiterService.emit(EventEmiterService.events.CHANGE_USER_DATA_DONATION_INFORMATION);
  }
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
  reloadBitmarks,
  doGetTransactionData,
  doActiveDonation,
  doJoinStudy,
  doLeaveStudy,
  doCompletedStudyTask,
  doDonateHealthData,
  doBitmarkHealthData,

  getTransactionData,
  getUserBitmarks,
  getUserInformation,
  getApplicationVersion,
  getApplicationBuildNumber,
  getLocalBitmarkInformation,
  getDonationInformation,
};

export { DataController };
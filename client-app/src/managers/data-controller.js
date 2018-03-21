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
const runGetActiveIncomingTransferOfferInBackground = (checkDoneProcess) => {
  TransactionService.doGetActiveIncomingTransferOffers(userInformation.bitmarkAccountNumber).then(activeIncompingTransferOffers => {
    if (userData.activeIncompingTransferOffers === null || JSON.stringify(activeIncompingTransferOffers) !== JSON.stringify(userData.activeIncompingTransferOffers)) {
      userData.activeIncompingTransferOffers = activeIncompingTransferOffers;
      EventEmiterService.emit(EventEmiterService.events.CHANGE_USER_DATA_ACTIVE_INCOMING_TRANSFER_OFFER);
    }
    if (checkDoneProcess) {
      checkDoneProcess();
    }
    console.log('runOnBackground  runGetActiveIncomingTransferOfferInBackground success :');
  }).catch(error => {
    if (checkDoneProcess) {
      checkDoneProcess();
    }
    console.log('runOnBackground  runGetActiveIncomingTransferOfferInBackground error :', error);
  });
};

const runGetTransactionsInBackground = (checkDoneProcess) => {
  TransactionService.getAllTransactions(userInformation.bitmarkAccountNumber).then(transactions => {
    if (userData.transactions === null || JSON.stringify(transactions) !== JSON.stringify(userData.transactions)) {
      userData.transactions = transactions;
      EventEmiterService.emit(EventEmiterService.events.CHANGE_USER_DATA_TRANSACTIONS);
    }
    if (checkDoneProcess) {
      checkDoneProcess();
    }
    console.log('runOnBackground  runGetTransactionsInBackground success :');
  }).catch(error => {
    if (checkDoneProcess) {
      checkDoneProcess();
    }
    console.log('runOnBackground  runGetTransactionsInBackground error :', error);
  });
};

const runGetLocalBitmarksInBackground = (checkDoneProcess) => {
  BitmarkService.doGetBitmarks(userInformation.bitmarkAccountNumber).then(localAssets => {
    if (userData.localAssets === null || JSON.stringify(localAssets) !== JSON.stringify(userData.localAssets)) {
      userData.localAssets = localAssets;
      EventEmiterService.emit(EventEmiterService.events.CHANGE_USER_DATA_LOCAL_BITMARKS);
    }
    checkDoneProcess();
    console.log('runOnBackground  runGetLocalBitmarksInBackground success :');
  }).catch(error => {
    checkDoneProcess();
    console.log('runOnBackground  runGetLocalBitmarksInBackground error :', error);
  });
};

const runGetDonationInformationInBackground = (checkDoneProcess) => {
  DonationService.doGetUserInformation(userInformation.bitmarkAccountNumber).then(donationInformation => {
    console.log('donationInformation :', donationInformation);
    if (userData.donationInformation === null || JSON.stringify(donationInformation) !== JSON.stringify(userData.donationInformation)) {
      userData.donationInformation = donationInformation;
      EventEmiterService.emit(EventEmiterService.events.CHANGE_USER_DATA_DONATION_INFORMATION);
    }
    checkDoneProcess();
    console.log('runOnBackground  runGetDonationInformationInBackground success :');
  }).catch(error => {
    checkDoneProcess();
    console.log('runOnBackground  runGetDonationInformationInBackground error :', error);
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

const runOnBackground = () => {
  return new Promise((resolve) => {
    UserModel.doTryGetCurrentUser().then(userInfo => {
      if (userInformation === null || JSON.stringify(userInfo) !== JSON.stringify(userInformation)) {
        userInformation = userInfo;
        EventEmiterService.emit(EventEmiterService.events.CHANGE_USER_INFO)
      }
      if (userInformation && userInformation.bitmarkAccountNumber) {
        let countProcess = 0;
        let processList = [
          runGetLocalBitmarksInBackground,
          runGetTransactionsInBackground,
          runGetActiveIncomingTransferOfferInBackground,
          runGetDonationInformationInBackground,
        ]
        let checkDoneProcess = () => {
          countProcess++;
          if (countProcess >= processList.length) {
            resolve();
          }
        }
        processList.forEach(process => process(checkDoneProcess));
      } else {
        resolve();
      }
    });
  });
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
  let localAssets = await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_LOCAL_BITMARKS);
  if (userData.localAssets === null || JSON.stringify(localAssets) !== JSON.stringify(userData.localAssets)) {
    userData.localAssets = localAssets || [];
  }
  let donationInformation = await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_LOCAL_BITMARKS);
  if (userData.donationInformation === null || JSON.stringify(donationInformation) !== JSON.stringify(userData.donationInformation)) {
    userData.donationInformation = donationInformation || {};
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

  getTransactionData,
  getUserBitmarks,
  getUserInformation,
  getApplicationVersion,
  getApplicationBuildNumber,
  getLocalBitmarkInformation,
  getDonationInformation,
};

export { DataController };
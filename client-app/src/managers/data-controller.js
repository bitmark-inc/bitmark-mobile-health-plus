import DeviceInfo from 'react-native-device-info';
import { merge } from 'lodash';

import {
  UserService,
  EventEmiterService,
  AccountService,
  NotificationService,
  TransactionService,
} from "../services";

let userInformation = {};
let userData = {
  localAssets: null,
  activeIncompingTransferOffers: null,
  transactions: null,
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
  }).catch(error => {
    if (checkDoneProcess) {
      checkDoneProcess();
    }
    console.log('runOnBackground  runGetTransactionsInBackground error :', error);
  });
};

const runGetUserBitmarksInBackground = (checkDoneProcess) => {
  AccountService.doGetBitmarks(userInformation).then(data => {
    if (userData.localAssets === null || JSON.stringify(data.localAssets) !== JSON.stringify(userData.localAssets)) {
      userData.localAssets = data.localAssets;
      EventEmiterService.emit(EventEmiterService.events.CHANGE_USER_DATA_LOCAL_BITMARKS);
    }
    checkDoneProcess();
  }).catch(error => {
    checkDoneProcess();
    console.log('runOnBackground  doGetBitmarks error :', error);
  });
};

const configNotification = () => {
  const onRegisterred = (registerredNotificaitonInfo) => {
    let notificationUUID = registerredNotificaitonInfo ? registerredNotificaitonInfo.token : null;
    if (notificationUUID && userInformation.notificationUUID !== notificationUUID) {
      AccountService.doRegisterNotificationInfo(notificationUUID).catch(error => {
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
      runGetUserBitmarksInBackground();
    }
    NotificationService.setApplicationIconBadgeNumber(0);
  };
  NotificationService.configure(onRegisterred, onReceivedNotification);
  NotificationService.removeAllDeliveredNotifications();
};

const runOnBackground = () => {
  return new Promise((resolve) => {
    UserService.doTryGetCurrentUser().then(userInfo => {
      if (userInformation === null || JSON.stringify(userInfo) !== JSON.stringify(userInformation)) {
        userInformation = userInfo;
        EventEmiterService.emit(EventEmiterService.events.CHANGE_USER_INFO)
      }
      if (userInformation && userInformation.bitmarkAccountNumber) {
        let countProcess = 0;
        let processList = [
          runGetUserBitmarksInBackground,
          runGetTransactionsInBackground,
          runGetActiveIncomingTransferOfferInBackground,
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

const doDeactiveApplication = async () => {
  stopInterval();
};
const reloadBitmarks = async () => {
  let data = await AccountService.doGetBitmarks(userInformation);
  if (userData.localAssets === null || JSON.stringify(data.localAssets) !== JSON.stringify(userData.localAssets)) {
    userData.localAssets = data.localAssets;
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
  userInformation = await UserService.doTryGetCurrentUser();
  return userInformation;
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

const DataController = {
  reloadData: runOnBackground,
  doOpenApp,
  doStartBackgroundProcess,
  doDeactiveApplication,
  reloadBitmarks,
  doGetTransactionData,

  getTransactionData,
  getUserBitmarks,
  getUserInformation,
  getApplicationVersion,
  getApplicationBuildNumber,
  getLocalBitmarkInformation,
};

export { DataController };
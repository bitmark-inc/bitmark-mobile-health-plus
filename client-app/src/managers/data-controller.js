import DeviceInfo from 'react-native-device-info';
import { merge } from 'lodash';

import {
  UserService,
  EventEmiterService,
  AccountService,
  NotificationService,
  TransactionService
} from "../services";

let userInformation = {};
let userData = {
  localAssets: null,
  marketAssets: null,
  localBalannce: null,
  marketBalances: null,
  pendingTransactions: null,
  completedTransactions: null,
};
// ================================================================================================================================================
// ================================================================================================================================================
const runGetTransactionsInBackground = (checkDoneProcess) => {
  TransactionService.doGetAllSignRequests(userInformation.bitmarkAccountNumber).then(data => {
    if (userData.pendingTransactions === null || JSON.stringify(data.pendingTransactions) !== JSON.stringify(userData.pendingTransactions)) {
      userData.pendingTransactions = data.pendingTransactions;
      EventEmiterService.emit(EventEmiterService.events.CHANGE_USER_DATA_PENDING_TRANSACTIONS);
    }
    if (userData.completedTransactions === null || JSON.stringify(data.completedTransactions) !== JSON.stringify(userData.completedTransactions)) {
      userData.completedTransactions = data.completedTransactions;
      EventEmiterService.emit(EventEmiterService.events.CHANGE_USER_DATA_COMPLETED_TRANSACTIONS);
    }
    checkDoneProcess();
  }).catch(error => {
    checkDoneProcess();
    console.log('runOnBackground  runGetTransactionsInBackground error :', error);
  })
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
  const onReceivedNotification = (data) => {
    console.log('onReceivedNotification data:', data);
    runGetTransactionsInBackground();
    NotificationService.setApplicationIconBadgeNumber(0);
  };
  NotificationService.configure(onRegisterred, onReceivedNotification);
};

const runGetUserBitmarksInBackground = (checkDoneProcess) => {
  AccountService.doGetBitmarks(userInformation).then(data => {
    if (userData.localAssets === null || JSON.stringify(data.localAssets) !== JSON.stringify(userData.localAssets)) {
      userData.localAssets = data.localAssets;
      EventEmiterService.emit(EventEmiterService.events.CHANGE_USER_DATA_LOCAL_BITMARKS);
    }
    if (userData.marketAssets === null || JSON.stringify(data.marketAssets) !== JSON.stringify(userData.marketAssets)) {
      userData.marketAssets = data.marketAssets;
      EventEmiterService.emit(EventEmiterService.events.CHANGE_USER_DATA_MARKET_BITMARKS);
    }
    checkDoneProcess();
  }).catch(error => {
    checkDoneProcess();
    console.log('runOnBackground  doGetBitmarks error :', error);
  });
};

const runGetUserBalanceInBackground = (checkDoneProcess) => {
  AccountService.doGetBalance(userInformation).then(data => {
    if (userData.localBalannce === null || JSON.stringify(data.localBalannce) !== JSON.stringify(userData.localBalannce)) {
      userData.localBalannce = data.localBalannce;
      EventEmiterService.emit(EventEmiterService.events.CHANGE_USER_DATA_LOCAL_BALANCE);
    }
    if (userData.marketBalances === null || JSON.stringify(data.marketBalances) !== JSON.stringify(userData.marketBalances)) {
      userData.marketBalances = data.marketBalances;
      EventEmiterService.emit(EventEmiterService.events.CHANGE_USER_DATA_MARKET_BALANCE);
    }
    checkDoneProcess();
  }).catch(error => {
    checkDoneProcess();
    console.log('runOnBackground  doGetBalance error :', error);
  });
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
          runGetUserBalanceInBackground,
          runGetTransactionsInBackground,
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
const doGetBitmarks = async () => {
  let data = await AccountService.doGetBitmarks(userInformation);
  userData.localAssets = data.localAssets;
  userData.marketAssets = data.marketAssets;
  return merge({}, {
    localAssets: userData.localAssets || [],
    marketAssets: userData.marketAssets || [],
  });
};

const doTryAccessToAllMarkets = async () => {
  await AccountService.doTryAccessToAllMarkets();
  userInformation = await UserService.doGetCurrentUser();
  return userInformation;
};

const doGetSignRequests = async () => {
  let data = await TransactionService.doTryGetSignRequests();
  userData.pendingTransactions = data.pendingTransactions;
  userData.completedTransactions = data.completedTransactions;
  return merge({}, {
    pendingTransactions: userData.pendingTransactions,
    completedTransactions: userData.completedTransactions,
  });
};

const doOpenApp = async () => {
  userInformation = await UserService.doTryGetCurrentUser();
  return userInformation;
};

const doGetBalance = async () => {
  let data = await AccountService.doGetBalance(userInformation);
  userData.localBalannce = data.localBalannce;
  userData.marketBalances = data.marketBalances;
  return merge({}, {
    localBalannce: userData.localBalannce || {},
    marketBalances: userData.marketBalances || {},
  });
};


const getSignRequests = () => {
  return merge({}, {
    pendingTransactions: userData.pendingTransactions || [],
    completedTransactions: userData.completedTransactions || [],
  });
}
const getUserBitmarks = () => {
  return merge({}, {
    localAssets: userData.localAssets || [],
    marketAssets: userData.marketAssets || [],
  });
};

const getUserInformation = () => {
  return userInformation;
};

const getUserBalance = () => {
  return merge({}, {
    localBalannce: userData.localBalannce || {},
    marketBalances: userData.marketBalances || {},
  });
};

const getApplicationVersion = () => {
  return DeviceInfo.getVersion();
};

const getApplicationBuildNumber = () => {
  return DeviceInfo.getBuildNumber();
};

const DataController = {
  doOpenApp,
  doStartBackgroundProcess,
  doDeactiveApplication,
  doGetBitmarks,
  doGetBalance,
  doTryAccessToAllMarkets,
  doGetSignRequests,

  getSignRequests,
  getUserBalance,
  getUserBitmarks,
  getUserInformation,
  getApplicationVersion,
  getApplicationBuildNumber,
};

export { DataController };
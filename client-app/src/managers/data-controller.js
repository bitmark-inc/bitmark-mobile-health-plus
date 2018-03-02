import { UserService, EventEmiterService, AccountService, NotificationService } from "../services";

let userInformation = {};
let userData = {
  localAssets: null,
  marketAssets: null,
  localBalannce: null,
  marketBalances: null,
};
// ================================================================================================================================================
// ================================================================================================================================================
let configNotification = () => {
  let onRegisterred = (registerredNotificaitonInfo) => {
    let notificationUID = registerredNotificaitonInfo ? registerredNotificaitonInfo.token : null;
    if (userInformation.notificationUID !== notificationUID) {
      userInformation.notificationUID = notificationUID;
      EventEmiterService.emit(EventEmiterService.events.CHANGE_USER_INFO)
    }
  };
  let onReceivedNotification = () => {
    //TODO
  };
  NotificationService.configure(onRegisterred, onReceivedNotification);
};

let runGetUserInformationInBackground = (checkDoneProcess) => {
  UserService.doGetCurrentUser().then(userInfo => {
    if (userInformation === null || JSON.stringify(userInfo) !== JSON.stringify(userInformation)) {
      userInformation = userInfo;
      EventEmiterService.emit(EventEmiterService.events.CHANGE_USER_INFO)
    }
    checkDoneProcess();
  }).catch(error => {
    checkDoneProcess();
    console.log('runOnBackground  doGetCurrentUser error :', error);
  });
};

let runGetUserBitmarksInBackground = (checkDoneProcess) => {
  AccountService.doGetBitmarks().then(data => {
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

let runGetUserBalanceInBackground = (checkDoneProcess) => {
  AccountService.doGetBalance().then(data => {
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

let runOnBackground = () => {
  return new Promise((resolve) => {
    let countProcess = 0;
    let processList = [
      runGetUserInformationInBackground,
      runGetUserBitmarksInBackground,
      runGetUserBalanceInBackground,
    ]
    let checkDoneProcess = () => {
      countProcess++;
      if (countProcess >= processList.length) {
        resolve();
      }
    }
    processList.forEach(process => process(checkDoneProcess));
  });
};
// ================================================================================================================================================
// ================================================================================================================================================
let dataInterval = null;
const startInterval = () => {
  stopInterval();
  dataInterval = setInterval(runOnBackground, 5 * 1000);
};

const stopInterval = () => {
  if (dataInterval) {
    clearInterval(dataInterval);
  }
  dataInterval = null;
};

// ================================================================================================================================================
// ================================================================================================================================================
const doActiveApplication = async (justCreatedBitmarkAccount) => {
  configNotification();
  await runOnBackground();
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
  let data = await AccountService.doGetBitmarks();
  userData.localAssets = data.localAssets;
  userData.marketAssets = data.marketAssets;
  return data;
};

const getUserBitmarks = () => {
  return {
    localAssets: userData.localAssets,
    marketAssets: userData.marketAssets,
  }
};

const getUserInformation = () => {
  return userInformation;
};

const getUserBalance = () => {
  return {
    localBalannce: userData.localBalannce,
    marketBalances: userData.marketBalances,
  };
};

const DataController = {
  doActiveApplication,
  doDeactiveApplication,
  doGetBitmarks,

  getUserBalance,
  getUserBitmarks,
  getUserInformation,
};

export { DataController };
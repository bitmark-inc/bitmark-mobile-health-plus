import { config } from './../configs';
import { CommonService } from './common-service';
import { AccountService } from './account-service';
import { BitmarkService } from './bitmark-service';


// ================================================================================================
// ================================================================================================
// ================================================================================================
// TODO
let totemicMarketUrl = config.market_urls.totemic;

const getCurrentUser = async () => {
  return await CommonService.getLocalData(CommonService.app_local_data_key);
};

const createNewUser = async () => {
  let userInfo = await AccountService.createNewAccount();
  let userStore = {
    bitmarkAccountNumber: userInfo.bitmarkAccountNumber,
  }
  await CommonService.setLocalData(CommonService.app_local_data_key, userStore);
  return userInfo;
};

const doLogin = async (phase24Words) => {
  let userInfo = await AccountService.accessBy24Words(phase24Words);
  let userStore = {
    bitmarkAccountNumber: userInfo.bitmarkAccountNumber,
  }
  let marketAccountInfo = await AccountService.checkPairingStatus(userStore.bitmarkAccountNumber, totemicMarketUrl);
  userStore.markets = {
    'totemic': {
      id: marketAccountInfo.id,
      name: marketAccountInfo.name,
      email: marketAccountInfo.email,
      account_number: marketAccountInfo.account_number,
    }
  };
  await CommonService.setLocalData(CommonService.app_local_data_key, userStore);
  return userStore;
};

const doLogout = async () => {
  await AccountService.logout();
  await CommonService.setLocalData(CommonService.app_local_data_key, {});
};

const doPairMarketAccount = async (token) => {
  //TODO 
  let userInfo = await CommonService.getLocalData(CommonService.app_local_data_key);
  let userStore = {
    bitmarkAccountNumber: userInfo.bitmarkAccountNumber,
  }
  let marketAccountInfo = await AccountService.pairtMarketAccounut(userStore.bitmarkAccountNumber, token, totemicMarketUrl);
  userStore.markets = {
    'totemic': {
      id: marketAccountInfo.id,
      name: marketAccountInfo.name,
      email: marketAccountInfo.email,
      account_number: marketAccountInfo.account_number,
    }
  }
  await CommonService.setLocalData(CommonService.app_local_data_key, userStore);
  return userStore;
};

const getUserBitamrk = async () => {
  let userInfo = await CommonService.getLocalData(CommonService.app_local_data_key);
  let marketAssets = [];
  for (let market in userInfo.markets) {
    let tempBitmarks = await BitmarkService.getMarketBitmarks(market, userInfo.markets[market].id);
    console.log('tempBitmarks :', tempBitmarks);
    marketAssets = marketAssets.concat(tempBitmarks || []);
    console.log('marketAssets :', marketAssets);
  }
  let localAssets = await BitmarkService.getLocalBitamrks(userInfo.bitmarkAccountNumber);
  return {
    localAssets,
    marketAssets
  };
};

const getUserBalance = async () => {
  let balanceResult = await AccountService.getBalanceOnMarket(totemicMarketUrl);
  let balanceHistories = await AccountService.getBalanceHistoryOnMarket(totemicMarketUrl);
  return { balance: balanceResult.balance, pending: balanceResult.pending, balanceHistories };
};

// ================================================================================================
// ================================================================================================
// ================================================================================================
let AppService = {
  getCurrentUser,
  createNewUser,
  doLogin,
  doLogout,
  doPairMarketAccount,
  getUserBitamrk,
  getUserBalance,
}

export {
  AppService
}
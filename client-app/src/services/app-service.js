import { config } from './../configs';

import { CommonService } from './common-service';
import { AccountService } from './account-service';
import { BitmarkService } from './bitmark-service';
import { MarketService } from './market-service';


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
  delete userInfo.pharse24Words;
  await CommonService.setLocalData(CommonService.app_local_data_key, userInfo);
  return userInfo;
};

const createSignatureData = async () => {
  let userInfo = await AccountService.createNewAccount();
  let signatureData = await CommonService.createSignatureData();
  signatureData.account_number = userInfo.bitmarkAccountNumber;
  return signatureData;
};

const doLogin = async (pharse24Words) => {
  let userInfo = await AccountService.accessBy24Words(pharse24Words);
  delete userInfo.pharse24Words;
  await CommonService.setLocalData(CommonService.app_local_data_key, userInfo);
  return userInfo;
};

const doLogout = async () => {
  await AccountService.logout();
  await CommonService.setLocalData(CommonService.app_local_data_key, {});
};

const doPairMarketAccount = async (token, market) => {
  let userInfo = await CommonService.getLocalData(CommonService.app_local_data_key);
  let marketAccountInfo = await AccountService.pairtMarketAccounut(userInfo.bitmarkAccountNumber, token, market);

  if (!userInfo.markets) {
    userInfo.markets = {};
  }
  userInfo.markets[market] = {
    id: marketAccountInfo.id,
    name: marketAccountInfo.name,
    email: marketAccountInfo.email,
    account_number: marketAccountInfo.account_number,
  }
  await CommonService.setLocalData(CommonService.app_local_data_key, userInfo);
  return userInfo;
};

const getUserBitmark = async () => {
  let userInfo = await CommonService.getLocalData(CommonService.app_local_data_key);
  let marketAssets = [];
  for (let market in userInfo.markets) {
    let tempBitmarks = await MarketService.getBitmarks(market, userInfo.markets[market].id);
    marketAssets = marketAssets.concat(tempBitmarks || []);
  }
  let localAssets = await BitmarkService.getBitmarks(userInfo.bitmarkAccountNumber);
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

const doWithdrawBitmark = async (bitmark) => {
  let userInfo = await CommonService.getLocalData(CommonService.app_local_data_key);
  let bitamrkIds = [bitmark.bitmark_id];
  return BitmarkService.doWithdrawBitmarks(bitamrkIds, userInfo.bitmarkAccountNumber);
};

const doDepositBitmark = async (market, bitmark) => {
  let userInfo = await CommonService.getLocalData(CommonService.app_local_data_key);
  let bitamrkIds = [bitmark.bitmark_id];
  return BitmarkService.doDepositBitmarks(bitamrkIds, userInfo.bitmarkAccountNumber, userInfo.markets[market].account_number);
};

// ================================================================================================
// ================================================================================================
// ================================================================================================
let AppService = {
  getCurrentUser,
  createNewUser,
  createSignatureData,
  doLogin,
  doLogout,
  doPairMarketAccount,
  getUserBitmark,
  getUserBalance,
  doWithdrawBitmark,
  doDepositBitmark,
}

export {
  AppService
}
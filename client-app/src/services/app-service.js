import moment from 'moment';

import { config } from './../configs';

import { BitmarkSDK } from './adapters';

import { CommonService } from './common-service';
import { AccountService } from './account-service';
import { BitmarkService } from './bitmark-service';
import { MarketService } from './market-service';


let bitmarkNetwork = config.network === config.NETWORKS.devnet ? config.NETWORKS.testnet : config.network;
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

const doWithdraw = async (bitmark) => {
  let userInfo = await CommonService.getLocalData(CommonService.app_local_data_key);
  let sessionId = await BitmarkSDK.requestSession(bitmarkNetwork);
  let timestamp = moment().toDate().getTime() + '';
  let signatures = await BitmarkSDK.rickySignMessage([timestamp], sessionId);

  let data = await BitmarkService.withdraw(userInfo.bitmarkAccountNumber, timestamp, signatures[0], [bitmark.bitmark_id]);
  console.log('first signature :', data);
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
  getUserBitmark,
  getUserBalance,
  doWithdraw,
}

export {
  AppService
}
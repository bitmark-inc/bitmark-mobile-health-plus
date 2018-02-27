import moment from 'moment';


import { config } from './../configs';
import { CommonService } from './common-service';
import { AccountService } from './account-service';
import { BitmarkService } from './bitmark-service';
import { MarketService } from './market-service';
import { BitmarkSDK } from './adapters';



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
  if (!userInfo) {
    return null;
  }
  delete userInfo.pharse24Words;
  await CommonService.setLocalData(CommonService.app_local_data_key, userInfo);
  return userInfo;
};

const createSignatureData = async (touchFaceIdMessage) => {
  let userInfo = await CommonService.getLocalData(CommonService.app_local_data_key);
  let signatureData = await CommonService.createSignatureData(touchFaceIdMessage);
  signatureData.account_number = userInfo.bitmarkAccountNumber;
  return signatureData;
};

const doLogin = async (pharse24Words) => {
  let userInfo = await AccountService.accessBy24Words(pharse24Words);
  if (!userInfo) {
    return null;
  }
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
  if (!marketAccountInfo) {
    return null;
  }

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

const doCheckPairingStatus = async (market) => {
  let userInfo = await CommonService.getLocalData(CommonService.app_local_data_key);
  let signatureData = await CommonService.createSignatureData('Please sign to pair the bitmark account with market.');
  let marketAccountInfo = await AccountService.doCheckPairingStatus(market, userInfo.bitmarkAccountNumber, signatureData.timestamp, signatureData.signature);
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

const initMarketSession = async (market, userInfo) => {
  let marketInfo = await MarketService.checkMarketSession(market);
  if (!marketInfo) {
    let timestamp = moment().toDate().getTime().toString();
    let signatures = await CommonService.doTryRickSignMessage([timestamp], 'Please sign to pair the bitmark account with market.');
    if (!signatures) {
      return null;
    }
    marketInfo = await AccountService.doCheckPairingStatus(market, userInfo.bitmarkAccountNumber, timestamp, signatures[0]);
  }
  if (marketInfo) {
    if (!userInfo.markets) {
      userInfo.markets = {};
    }
    userInfo.markets[market] = {
      id: marketInfo.id,
      name: marketInfo.name,
      email: marketInfo.email,
      account_number: marketInfo.account_number,
    }
    await CommonService.setLocalData(CommonService.app_local_data_key, userInfo);
    return true;
  }
  return false;
};

const getUserBitmark = async () => {
  let userInfo = await CommonService.getLocalData(CommonService.app_local_data_key);
  let marketAssets = [];
  let localAssets = [];
  if (!config.disabel_markets) {
    for (let market in userInfo.markets) {
      let result = await initMarketSession(market, userInfo);
      if (result === null) {
        return {
          localAssets,
          marketAssets
        };
      }
      if (result) {
        let tempBitmarks = await MarketService.getBitmarks(market, userInfo.markets[market].id);
        marketAssets = marketAssets.concat(tempBitmarks || []);
      }
    }
  }
  localAssets = await BitmarkService.getBitmarks(userInfo.bitmarkAccountNumber);
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

const checkPairingStatusAllMarket = async () => {
  let userInfo = await CommonService.getLocalData(CommonService.app_local_data_key);
  if (!config.disabel_markets) {
    for (let market in config.markets) {
      let result = await initMarketSession(market, userInfo);
      if (result === null) {
        return userInfo;
      }
    }
  }
  return userInfo;
};

const doOpenApp = async () => {
  let userInfo = await CommonService.getLocalData(CommonService.app_local_data_key);
  return userInfo;
};

const doCheckingIssuance = async (filePath) => {
  let assetInfo = await BitmarkSDK.getAssetInfo(filePath);
  let assetInformation = await BitmarkService.doCheckExistingAsset(assetInfo.id);
  if (!assetInformation) {
    return assetInfo;
  } else {
    let userInfo = await CommonService.getLocalData(CommonService.app_local_data_key);
    if (assetInformation.registrant !== userInfo.bitmarkAccountNumber) {
      throw Error('This file is registered by other user');
    }
    return assetInformation;
  }
};

const checkMetadata = async (metadatList) => {
  let metadata = {};
  metadatList.forEach(item => {
    if (item.label && item.value) {
      metadata[item.label] = item.value;
    }
  });
  return await BitmarkSDK.validateMetadata(metadata);
};

const issueFile = async (filepath, assetName, metadatList, quantity) => {
  let metadata = {};
  metadatList.forEach(item => {
    metadata[item.label] = item.value;
  });
  return await BitmarkService.issueBitmark(filepath, assetName, metadata, quantity);
};

// ================================================================================================
// ================================================================================================
// -- test

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
  doCheckPairingStatus,
  doCheckingIssuance,
  checkPairingStatusAllMarket,

  doOpenApp,

  checkMetadata,
  issueFile,
}

export {
  AppService
}
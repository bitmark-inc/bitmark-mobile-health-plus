import { AccountModel, CommonModel } from './../models';
import { MarketService } from './market-service';
import { UserService } from './user-service';
import { BitmarkService } from './bitmark-service';
import { config } from '../configs';

// ================================================================================================\
const doCreateAccount = async (touchFaceIdSession) => {
  let userInfo = await AccountModel.doGetCurrentAccount(touchFaceIdSession);
  await UserService.doUpdateUserInfo(userInfo);
  return userInfo;
}

const doLogin = async (touchFaceIdSession) => {
  let userInfo = await AccountModel.doGetCurrentAccount(touchFaceIdSession);
  userInfo = await MarketService.doTryAccessToAllMarkets(userInfo);
  await UserService.doUpdateUserInfo(userInfo);
  return userInfo;
};

const doCreateSignatureData = async (touchFaceIdMessage) => {
  let signatureData = await CommonModel.doCreateSignatureData(touchFaceIdMessage);
  if (!signatureData) {
    return null;
  }
  let userInfo = await UserService.doGetCurrentUser();
  signatureData.account_number = userInfo.bitmarkAccountNumber;
  return signatureData;
};

const doLogout = async () => {
  await AccountModel.doLogout();
  await UserService.doRemoveUserInfo();
};

const doTryAccessToMarket = async (market) => {
  let userInfo = await UserService.doGetCurrentUser();
  let marketInfo = await MarketService.doTryAccessToMarket(market, userInfo.bitmarkAccountNumber, 'Please sign to pair the bitmark account with market.');
  if (marketInfo !== null) {
    if (!userInfo.markets) {
      userInfo.markets = {};
    }
    if (!userInfo.markets[market]) {
      userInfo.markets[market] = {
        id: marketInfo.id,
        name: marketInfo.name,
        email: marketInfo.email,
        account_number: marketInfo.account_number,
      }
      await UserService.doUpdateUserInfo(userInfo);
    }
    return marketInfo;
  }
  return null;
};

const doGetBitmarks = async (userInfo) => {
  let localAssets = await BitmarkService.doGetBitmarks(userInfo.bitmarkAccountNumber);
  let marketAssets = [];
  if (!config.disabel_markets) {
    for (let market in userInfo.markets) {
      let result = await doTryAccessToMarket(market);
      if (result === null) {
        return {
          localAssets,
          marketAssets: [],
        };
      }
      if (result) {
        let tempBitmarks = await MarketService.doGetBitmarks(market, userInfo.markets[market]);
        marketAssets = marketAssets.concat(tempBitmarks || []);
      }
    }
  }
  return { localAssets, marketAssets };
};

const doGetBalance = async (userInfo) => {
  const localBalannce = {};
  //TODO
  const marketBalances = {};
  if (!config.disabel_markets) {
    for (let market in userInfo.markets) {
      let result = await doTryAccessToMarket(market);
      if (result === null) {
        return {
          localBalannce,
          marketBalances: {},
        };
      }
      if (result) {
        let tempMarketBlance = await MarketService.doGetBalance(market, userInfo.markets[market]);
        marketBalances[market] = tempMarketBlance;
      }
    }
  }
  return { localBalannce, marketBalances };
};

const doTryAccessToAllMarkets = async () => {
  let userInfo = await UserService.doGetCurrentUser();
  userInfo = await MarketService.doTryAccessToAllMarkets(userInfo);
  await UserService.doUpdateUserInfo(userInfo);
};

// ================================================================================================
// ================================================================================================

let AccountService = {
  doCreateAccount,
  doLogin,
  doLogout,
  doCreateSignatureData,
  doTryAccessToMarket,
  doGetBitmarks,
  doGetBalance,
  doTryAccessToAllMarkets,
};

export { AccountService };
import { AccountModel, CommonModel, BitmarkSDK } from './../models';
import { MarketService } from './market-service';
import { UserService } from './user-service';
import { BitmarkService } from './bitmark-service';
import { config } from '../configs';
import { NotificationService } from './notification-service';

// ================================================================================================\
const doCreateAccount = async (touchFaceIdSession) => {
  let userInfo = await AccountModel.doGetCurrentAccount(touchFaceIdSession);
  await UserService.doUpdateUserInfo(userInfo);
  let signatureData = await CommonModel.doCreateSignatureData();
  await NotificationService.doRegisterNotificationInfo(userInfo.bitmarkAccountNumber, null, signatureData);
  return userInfo;
}

const doLogin = async (touchFaceIdSession) => {
  let userInfo = await AccountModel.doGetCurrentAccount(touchFaceIdSession);
  userInfo = await MarketService.doTryAccessToAllMarkets(userInfo);
  await UserService.doUpdateUserInfo(userInfo);
  let signatureData = await CommonModel.doCreateSignatureData();
  await NotificationService.doRegisterNotificationInfo(userInfo.bitmarkAccountNumber, null, signatureData);
  return userInfo;
};

const doCreateSignatureData = async (touchFaceIdMessage) => {
  let signatureData = await CommonModel.doTryCreateSignatureData(touchFaceIdMessage);
  if (!signatureData) {
    return null;
  }
  let userInfo = await UserService.doGetCurrentUser();
  signatureData.account_number = userInfo.bitmarkAccountNumber;
  return signatureData;
};

const doLogout = async () => {
  let userInfo = await UserService.doGetCurrentUser();
  if (userInfo.notificationUUID) {
    let signatureData = await CommonModel.doTryCreateSignatureData('Touch/Face ID or a passcode is required to authorize your transactions')
    await NotificationService.doDeregisterNotificationInfo(userInfo.bitmarkAccountNumber, userInfo.notificationUUID, signatureData);
  }
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

const doRegisterNotificationInfo = async (notificationUUID) => {
  let userInfo = await UserService.doGetCurrentUser();
  let signatureData = CommonModel.doTryCreateSignatureData('Touch/Face ID or a passcode is required to authorize your transactions');
  await NotificationService.doRegisterNotificationInfo(userInfo.bitmarkAccountNumber, notificationUUID, signatureData);
  console.log('doRegisterNotificationInfo success', notificationUUID);
  userInfo.notificationUUID = notificationUUID;
  await UserService.doUpdateUserInfo(userInfo);
};

const doValidateBitmarkAccountNumber = async (accountNumber) => {
  let userInfo = await UserService.doGetCurrentUser();
  if (userInfo.bitmarkAccountNumber === accountNumber) {
    throw new Error('Can not transfer for current user!');
  }
  return await BitmarkSDK.validateAccountNumber(accountNumber, config.bitmark_network);
}

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
  doRegisterNotificationInfo,
  doValidateBitmarkAccountNumber,
};

export { AccountService };
import { config } from './../configs';
import { MarketModel, CommonModel } from './../models';
import { UserService } from './user-service';

// ================================================================================================
// ================================================================================================
const doGetCurrentBalance = (market) => {
  return new Promise((resolve) => {
    MarketModel.doGetCurrentBalance(market).then(resolve).catch(error => {
      console.log('MarketService doGetCurrentBalance error: ', error);
      resolve({ balance: 0, pending: 0 });
    })
  });
};

const doGetBalanceHistory = (market) => {
  return new Promise((resolve) => {
    MarketModel.doGetBalanceHistory(market).then(resolve).catch(error => {
      console.log('MarketService doGetBalanceHistory error: ', error);
      resolve([]);
    })
  });
};
// ================================================================================================
// ================================================================================================
const getListingUrl = (bitmark) => {
  if (bitmark && bitmark.market && bitmark.market === config.markets.totemic.name) {
    return config.market_urls.totemic + `/edition/${bitmark.id}`;
  }
  return '';
};

const getBalancUrl = (market) => {
  if (market === config.markets.totemic.name) {
    return config.market_urls.totemic + `/account-balance`;
  }
  return '';
};

const doCheckMarketSession = (market) => {
  return new Promise((resolve) => {
    MarketModel.doCheckMarketSession(market).then(resolve).catch(error => {
      console.log('MarketService doCheckMarketSession error: ', error);
      resolve(null);
    })
  });
};

const doTryAccessToMarket = (market, localBitmarkAccountNumber, touchFaceIdMessage) => {
  return new Promise((resolve) => {
    CommonModel.doCreateSignatureData(touchFaceIdMessage).then(signatureData => {
      if (!signatureData) {
        resolve(null);
      }
      return MarketModel.doAccessToMarket(market, localBitmarkAccountNumber, signatureData.timestamp, signatureData.signature);
    }).then(resolve).catch(error => {
      resolve(null);
      console.log(`doTryAccessToMarket ${market} error :`, error, error.stack);
    });
  });
};

const doGetBitmarks = (market, marketUserInfo) => {
  return new Promise((resolve) => {
    MarketModel.doGetBitmarks(market, marketUserInfo).then(resolve).catch(error => {
      console.log('MarketService doGetBitmarks error: ', error);
      resolve([]);
    })
  });
};

const doAccessToMarket = async (market, userInfo) => {
  let marketInfo = await doCheckMarketSession(market);
  if (!marketInfo) {
    marketInfo = await doTryAccessToMarket(market, userInfo.bitmarkAccountNumber, 'Please sign to pair the bitmark account with market.');
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
    return userInfo;
  }
  return null;
};

const doTryAccessToAllMarkets = async (userInfo) => {
  for (let market in config.markets) {
    userInfo = (await doAccessToMarket(market, userInfo)) || userInfo;
  }
  return userInfo;
};

const doPairAccount = async (touchFaceIdSession, token, market) => {
  let userInfo = await UserService.doGetCurrentUser();
  let marketAccountInfo = await MarketModel.doPairAccount(touchFaceIdSession, userInfo.bitmarkAccountNumber, token, market);
  if (!userInfo.markets) {
    userInfo.markets = {};
  }
  userInfo.markets[market] = {
    id: marketAccountInfo.id,
    name: marketAccountInfo.name,
    email: marketAccountInfo.email,
    account_number: marketAccountInfo.account_number,
  }
  await UserService.doUpdateUserInfo(userInfo);
  return userInfo;
};

const doGetBalance = async (market) => {
  let balanceResult = await doGetCurrentBalance(market);
  let balanceHistories = await doGetBalanceHistory(market);
  return { balance: balanceResult.balance, pending: balanceResult.pending, balanceHistories };
};

const doWithdrawBitmarks = async (touchFaceIdSession, bitmarkIds) => {
  let userInfo = await UserService.doGetCurrentUser();
  return await MarketModel.doWithdrawBitmarks(touchFaceIdSession, bitmarkIds, userInfo.bitmarkAccountNumber);
};

const doDepositBitmarks = async (touchFaceIdSession, bitmarkIds, market) => {
  let userInfo = await UserService.doGetCurrentUser();
  if (userInfo && userInfo.markets && userInfo.markets[market] && userInfo.markets[market].account_number) {
    return await MarketModel.doDepositBitmarks(touchFaceIdSession, bitmarkIds, userInfo.bitmarkAccountNumber, userInfo.markets[market].account_number);
  }
  throw new Error('Market is not paired!');
};

// ================================================================================================
// ================================================================================================

let MarketService = {
  getListingUrl,
  getBalancUrl,
  doAccessToMarket,
  doTryAccessToAllMarkets,
  doPairAccount,
  doTryAccessToMarket,
  doGetBitmarks,
  doGetBalance,
  doWithdrawBitmarks,
  doDepositBitmarks,
}

export {
  MarketService
}
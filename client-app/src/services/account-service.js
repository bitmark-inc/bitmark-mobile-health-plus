import moment from 'moment';

import { CommonService } from './common-service';
import { BitmarkSDK } from './adapters';
import { config } from './../configs';

// ================================================================================================
// ================================================================================================
const checkPairingStatus = (marketUrl, localBitmarkAccountNumber, timestamp, signature) => {
  return new Promise((resolve, reject) => {
    let urlCheck = marketUrl + `/s/api/mobile/access`;
    let statusCode = null;
    fetch(urlCheck, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pair_account_number: localBitmarkAccountNumber,
        timestamp,
        signature,
      })
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error('checkPairingStatus error :' + JSON.stringify(data)));
      }
      resolve(data.user || {});
    }).catch((error) => {
      reject(error);
    });
  });
};

const doCheckPairingStatus = (market, localBitmarkAccountNumber, timestamp, signature) => {
  return new Promise((resolve) => {
    checkPairingStatus(config.market_urls[market], localBitmarkAccountNumber, timestamp, signature).then(resolve).catch(error => {
      resolve(null);
      console.log(`doCheckPairingStatus ${market} error :`, error);
    });
  });
};
// ================================================================================================
// ================================================================================================
const createNewAccount = async () => {
  let sessionId = await BitmarkSDK.newAccount(config.bitmark_network);
  let userInfo = await BitmarkSDK.accountInfo(sessionId);
  CommonService.setFaceTouceSessionId(sessionId);
  return userInfo;
};

const getCurrentAccount = async () => {
  let sessionId = await CommonService.startFaceTouceSessionId();
  let userInfo = await BitmarkSDK.accountInfo(sessionId);
  await CommonService.endNewFaceTouceSessionId();
  return userInfo;
};

const check24Words = async (pharse24Words) => {
  return await BitmarkSDK.try24Words(pharse24Words);
};

const checkPairingStatusAllMarket = async (sessionId, localBitmarkAccountNumber) => {
  let marketInfos = {};
  for (let market in config.markets) {
    let timestamp = moment().toDate().getTime().toString();
    let signatures = await BitmarkSDK.rickySignMessage([timestamp], sessionId);
    let marketInfo = await doCheckPairingStatus(market, localBitmarkAccountNumber, timestamp, signatures[0]);
    if (marketInfo) {
      marketInfos[market] = {
        id: marketInfo.id,
        name: marketInfo.name,
        email: marketInfo.email,
        account_number: marketInfo.account_number,
      }
    }
  }
  return marketInfos;
};

const accessBy24Words = async (pharse24Words) => {
  let sessionId = await BitmarkSDK.newAccountFrom24Words(pharse24Words);
  let userInfo = await BitmarkSDK.accountInfo(sessionId);
  let marketInfos = await checkPairingStatusAllMarket(sessionId, userInfo.bitmarkAccountNumber);
  CommonService.setFaceTouceSessionId(sessionId);
  userInfo.markets = marketInfos;
  return userInfo;
};

const logout = async () => {
  return await BitmarkSDK.removeAccount();
}

const pairtMarketAccounut = async (localBitmarkAccountNumber, token, market) => {
  let marketUrl = config.market_urls[market];
  if (!marketUrl) {
    return null;
  }
  let requestPair = (signature) => {
    return new Promise((resolve, reject) => {
      let statusCode = null;
      fetch(marketUrl + '/s/api/mobile/token-pair-confirmation', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pair_account_number: localBitmarkAccountNumber,
          token,
          signature,
        })
      }).then((response) => {
        statusCode = response.status;
        return response.json();
      }).then((data) => {
        if (statusCode >= 400) {
          return reject(new Error('pairtMarketAccounut error :' + JSON.stringify(data)));
        }
        resolve(data.user || {});
      }).catch((error) => {
        console.log('pairtMarketAccounut error:', error);
        reject(error);
      });
    });
  }

  let sessionId = await CommonService.startFaceTouceSessionId();
  let signatures = await BitmarkSDK.rickySignMessage([token], sessionId);
  let user = await requestPair(signatures[0]);
  await CommonService.endNewFaceTouceSessionId();
  return user;
};

const getBalanceOnMarket = (marketServerUrl) => {
  return new Promise((resolve, reject) => {
    let statusCode = null;
    fetch(marketServerUrl + '/s/api/balance', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error('getBalanceOnMarket error :' + JSON.stringify(data)));
      }
      let ethData = (data && data.fund) ? data.fund.eth : {};
      let balance = ethData.balance || 0;
      let pending = ethData.pending || 0;
      resolve({ balance, pending });
    }).catch((error) => {
      reject(error);
    });
  });
};

const getBalanceHistoryOnMarket = (marketServerUrl) => {
  return new Promise((resolve, reject) => {
    let statusCode = null;
    fetch(marketServerUrl + '/s/api/balance-history', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error('getBalanceHistoryOnMarket error :' + JSON.stringify(data)));
      }
      resolve(data.history || []);
    }).catch((error) => {
      reject(error);
    });
  });
};

// ================================================================================================
// ================================================================================================
// ================================================================================================

let AccountService = {
  createNewAccount,
  getCurrentAccount,
  check24Words,
  accessBy24Words,
  doCheckPairingStatus,
  checkPairingStatusAllMarket,
  logout,
  pairtMarketAccounut,
  getBalanceOnMarket,
  getBalanceHistoryOnMarket,
}

export {
  AccountService,
}
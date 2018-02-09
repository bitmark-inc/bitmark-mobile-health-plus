import moment from 'moment';
import { BitmarkSDK } from './adapters'
import { config } from './../configs';

// ================================================================================================
// ================================================================================================
const checkPairingStatus = (marketUrl, loaclBitmarkAccountNumber, timestamp, signature) => {
  return new Promise((resolve, reject) => {
    let urlCheck = marketUrl + `/s/api/mobile/pairing-account?timestamp=${timestamp}&account_number=${loaclBitmarkAccountNumber}&signature=${signature}`;
    fetch(urlCheck, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    }).then((response) => response.json()).then((data) => {
      resolve(data.user || {});
    }).catch((error) => {
      reject(error);
    });
  });
};

// const checkSession = (marketUrl, loaclBitmarkAccountNumber) => {
//   return new Promise((resolve, reject) => {
//     //TODO urlCheck
//     let urlCheck = marketUrl + `/s/api/check-session?account_number=${loaclBitmarkAccountNumber}`;
//     fetch(urlCheck, {
//       method: 'GET',
//       headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json',
//       }
//     }).then((response) => {
//       if (response.status === 401) {
//         return Promise.resolve(false);
//       } else {
//         return response.json();
//       }
//     }).then((result) => {
//       resolve(!!result);
//     }).catch((error) => {
//       reject(error);
//     });
//   });
// };
// ================================================================================================
// ================================================================================================
let bitmarkNetwork = config.network === config.NETWORKS.devnet ? config.NETWORKS.testnet : config.network;
const createNewAccount = async () => {
  let sessionId = await BitmarkSDK.newAccount(bitmarkNetwork);
  let userInfo = await BitmarkSDK.accountInfo(sessionId);
  await BitmarkSDK.disposeSession(sessionId);
  return userInfo;
};

const getCurrentAccount = async () => {
  let sessionId = await BitmarkSDK.requestSession(bitmarkNetwork);
  let userInfo = await BitmarkSDK.accountInfo(sessionId);
  await BitmarkSDK.disposeSession(sessionId);
  return userInfo;
};

const check24Words = async (pharse24Words) => {
  return await BitmarkSDK.try24Words(pharse24Words);
};

const accessBy24Words = async (pharse24Words) => {
  let sessionId = await BitmarkSDK.newAccountFrom24Words(pharse24Words);
  let userInfo = await BitmarkSDK.accountInfo(sessionId);
  let marketInfos = {};
  for (let market in config.markets) {
    let timestamp = moment().toDate().getTime().toString();
    let signatures = await BitmarkSDK.rickySignMessage([timestamp], sessionId);
    let marketInfo = await checkPairingStatus(config.market_urls[market], userInfo.bitmarkAccountNumber, timestamp, signatures[0]);
    marketInfos[market] = {
      id: marketInfo.id,
      name: marketInfo.name,
      email: marketInfo.email,
      account_number: marketInfo.account_number,
    }
  }
  await BitmarkSDK.disposeSession(sessionId);
  userInfo.marktes = marketInfos;
  return userInfo;
};

const logout = async () => {
  return await BitmarkSDK.removeAccount();
}

const pairtMarketAccounut = async (loaclBitmarkAccountNumber, token, marketUrl) => {

  let requestPair = (signatures) => {
    return new Promise((resolve, reject) => {
      fetch(marketUrl + '/s/api/mobile/qrcode', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account_number: loaclBitmarkAccountNumber,
          action: 'pair',
          code: token,
          signature: signatures,
        })
      }).then((response) => response.json()).then((data) => {
        resolve(data.user || {});
      }).catch((error) => {
        console.log('pairtMarketAccounut error:', error);
        reject(error);
      });
    });
  }

  let sessionId = await BitmarkSDK.requestSession(bitmarkNetwork);
  let signature = await BitmarkSDK.rickySignMessage([token], sessionId);
  let user = await requestPair(signature);
  await BitmarkSDK.disposeSession(sessionId);
  return user;
};

const getBalanceOnMarket = (marketServerUrl) => {
  return new Promise((resolve, reject) => {
    fetch(marketServerUrl + '/s/api/balance', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    }).then((response) => response.json()).then((data) => {
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
    fetch(marketServerUrl + '/s/api/balance-history', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    }).then((response) => response.json()).then((data) => {
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
  logout,
  pairtMarketAccounut,
  getBalanceOnMarket,
  getBalanceHistoryOnMarket,
}

export {
  AccountService,
}
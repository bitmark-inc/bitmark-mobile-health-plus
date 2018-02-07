import moment from 'moment';
import { bitmarkSDK } from './adapters'
import { config } from './../configs';

// ================================================================================================
// ================================================================================================
// ================================================================================================
let bitmarkNetwork = config.network === config.NETWORKS.devnet ? config.NETWORKS.testnet : config.network;
const createNewAccount = async () => {
  return await bitmarkSDK.newAccount(bitmarkNetwork);
};

const getCurrentAccount = async () => {
  return await bitmarkSDK.accountInfo(bitmarkNetwork);
};

const check24Words = async (pharse24Words) => {
  return await bitmarkSDK.try24Words(pharse24Words);
};

const accessBy24Words = async (pharse24Words) => {
  return await bitmarkSDK.newAccountFrom24Words(pharse24Words);
};

const logout = async () => {
  return await bitmarkSDK.removeAccount();
}
// ================================================================================================
// ================================================================================================
const pairtMarketAccounut = (loaclBitmarkAccountNumber, token, marketUrl) => {
  return new Promise((resolve, reject) => {
    bitmarkSDK.rickySignMessage([token], bitmarkNetwork).then(signatures => {
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
          signature: signatures[0],
        })
      }).then((response) => response.json()).then((data) => {
        console.log('pairtMarketAccounut :', data);
        resolve(data.user || {});
      }).catch((error) => {
        console.log('pairtMarketAccounut error:', error);
        reject(error);
      });
    }).catch(reject);
  });
};

const checkPairingStatus = (loaclBitmarkAccountNumber, marketUrl) => {
  let timestamp = moment().getTime().toString();
  return new Promise((resolve, reject) => {
    bitmarkSDK.rickySignMessage([timestamp], bitmarkNetwork).then(signatures => {
      let urlCheck = marketUrl + `/s/api/mobile/pairing-account?timestamp=${timestamp}&account_number=${loaclBitmarkAccountNumber}&signature=${signatures[0]}`;
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
    }).catch(reject);
  });
};


//TODO for totemic
const generateCodeForSignInMarket = (marketServerUrl) => {
  return new Promise((resolve, reject) => {
    fetch(marketServerUrl + '/s/api/mobile/login', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    }).then((response) => response.json()).then((data) => {
      resolve(data.code || null);
    }).catch((error) => {
      reject(error);
    });
  });
};

const loginMarket = (marketServerUrl, loaclBitmarkAccountNumber) => {
  return new Promise((resolve, reject) => {
    let codeResult = '';
    generateCodeForSignInMarket(marketServerUrl).then((code) => {
      codeResult = code;
      return bitmarkSDK.rickySignMessage([code], bitmarkNetwork);
    }).then(signatures => {
      return fetch(marketServerUrl + '/s/api/mobile/login', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account_number: loaclBitmarkAccountNumber,
          code: codeResult,
          signature: signatures[0],
        })
      })
    }).then((response) => response.json()).then((data) => {
      resolve(data.code || null);
    }).catch(reject);
  });
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
  checkPairingStatus,
  loginMarket,
  getBalanceOnMarket,
  getBalanceHistoryOnMarket,
}

export {
  AccountService
}
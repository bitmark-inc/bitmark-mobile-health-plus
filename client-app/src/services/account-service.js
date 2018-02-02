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

const pairtMarketAccounut = (loaclBitmarkAccountNumber, token, pairUrl) => {
  return new Promise((resolve, reject) => {
    bitmarkSDK.signMessage(token, bitmarkNetwork).then(signature => {
      fetch(pairUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account_number: loaclBitmarkAccountNumber,
          action: 'pair',
          code: token,
          signature: signature,
        })
      }).then((response) => response.json()).then((data) => {
        resolve(data.user || {});
      }).catch((error) => {
        reject(error);
      });
    }).catch(reject);
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
}

export {
  AccountService
}
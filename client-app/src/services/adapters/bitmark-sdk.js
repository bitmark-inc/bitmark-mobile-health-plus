import { NativeModules } from 'react-native'
let SwiftBitmarkSDK = NativeModules.BitmarkSDK;

const bitmarkSDK = {
  newAccount: (network) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.newAccount(network, (ok, bitmarkAccountNumber, pharse24Words) => {
        if (ok) {
          resolve({ bitmarkAccountNumber, pharse24Words });
        } else {
          reject(new Error('Can not create new Account!'));
        }
      });
    });
  },
  accountInfo: (network) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.accountInfo(network, (ok, bitmarkAccountNumber, pharse24Words) => {
        console.log('accountInfo :', ok, bitmarkAccountNumber, pharse24Words);
        if (ok) {
          resolve({ bitmarkAccountNumber, pharse24Words });
        } else {
          reject(new Error('Can not get current account!'));
        }
      });
    });
  },
  newAccountFrom24Words: (pharse24Words) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.newAccountFrom24Words(pharse24Words, (ok, bitmarkAccountNumber, pharse24Words) => {
        if (ok) {
          resolve({ bitmarkAccountNumber, pharse24Words });
        } else {
          reject(new Error('Can not recovery account from 24 words!'));
        }
      });
    });
  },

  try24Words: (pharse24Words) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.try24Words(pharse24Words, (ok, bitmarkAccountNumber, pharse24Words) => {
        if (ok) {
          resolve({ bitmarkAccountNumber, pharse24Words });
        } else {
          reject(new Error('Can not recovery account from 24 words!'));
        }
      });
    });
  },

  removeAccount: () => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.removeAccount((ok) => {
        if (ok) {
          resolve();
        } else {
          reject(new Error('Can not recovery account from 24 words!'));
        }
      });
    });
  }

};
export { bitmarkSDK };
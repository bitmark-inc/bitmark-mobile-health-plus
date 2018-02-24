import { NativeModules } from 'react-native'
let SwiftBitmarkSDK = NativeModules.BitmarkSDK;

const BitmarkSDK = {
  // return session id
  newAccount: (network) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.newAccount(network, (ok, sessionId) => {
        if (ok) {
          resolve(sessionId);
        } else {
          reject(new Error('Can not create new Account!'));
        }
      });
    });
  },
  newAccountFrom24Words: (pharse24Words) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.newAccountFrom24Words(pharse24Words, (ok, sessionId) => {
        if (ok) {
          resolve(sessionId);
        } else {
          reject(new Error('Can not recovery account from 24 words!'));
        }
      });
    });
  },
  requestSession: (network) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.requestSession(network, (ok, sessionId) => {
        if (ok && sessionId) {
          resolve(sessionId);
        } else {
          reject(new Error('Can not reuest session!'));
        }
      });
    });
  },

  // one time
  removeAccount: () => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.removeAccount((ok) => {
        if (ok) {
          resolve();
        } else {
          reject(new Error('Can not remove account!'));
        }
      });
    });
  },

  // use session id
  disposeSession: (sessionId) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.disposeSession(sessionId, (ok) => {
        if (ok && sessionId) {
          resolve(sessionId);
        } else {
          reject(new Error('Can not dispose session!'));
        }
      });
    });
  },
  accountInfo: (sessionId) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.accountInfo(sessionId, (ok, bitmarkAccountNumber, pharse24Words) => {
        if (ok) {
          resolve({ bitmarkAccountNumber, pharse24Words });
        } else {
          reject(new Error('Can not get current account!'));
        }
      });
    });
  },
  signMessage: (message, sessionId) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.sign(sessionId, message, (ok, signature) => {
        if (ok) {
          resolve(signature);
        } else {
          reject(new Error('Can not sign message!'));
        }
      });
    });
  },
  rickySignMessage: (messages, sessionId) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.rickySign(sessionId, messages, (ok, signatures) => {
        if (ok && signatures && signatures.length === messages.length) {
          resolve(signatures);
        } else {
          reject(new Error('Can not sign message!'));
        }
      });
    });
  },
  registerAccessPublicKey: (sessionId) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.registerAccessPublicKey(sessionId, (ok, accessPublicKey) => {
        if (ok && accessPublicKey) {
          resolve(accessPublicKey);
        } else {
          reject(new Error('Can not registerAccessPublicKey!'));
        }
      });
    });
  },

  issueFile: (sessionId, filePath, property_name, metadata, quantity) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.issueFile(sessionId, {
        url: filePath,
        property_name,
        metadata,
        quantity,
      }, (ok, bitmarkIds) => {
        if (ok && bitmarkIds) {
          resolve(bitmarkIds);
        } else {
          reject(new Error('Can not issueFile!'));
        }
      });
    });
  },

  issueThenTransferFile: (sessionId, filePath, property_name, metadata, receiver) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.issueThenTransferFile(sessionId, {
        url: filePath,
        property_name,
        metadata,
        receiver,
      }, (ok, bitmarkId) => {
        if (ok && bitmarkId) {
          resolve(bitmarkId);
        } else {
          reject(new Error('Can not registerAccessPublicKey!'));
        }
      });
    });
  },

  sign1stForTransfer: (sessionId, bitmarkId, receiver) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.sign1stForTransfer(sessionId, bitmarkId, receiver, (ok, txid, signature) => {
        if (ok && txid && signature) {
          resolve({ txid, signature });
        } else {
          reject(new Error('Can not sign1stForTransfer!'));
        }
      });
    });
  },
  sign2ndForTransfer: (sessionId, txid, signature1) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.sign2ndForTransfer(sessionId, txid, signature1, (ok, signature2) => {
        if (ok && signature2) {
          resolve(signature2);
        } else {
          reject(new Error('Can not sign2ndForTransfer!'));
        }
      });
    });
  },

  // don use session di
  try24Words: (pharse24Words) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.try24Words(pharse24Words, (ok, bitmarkAccountNumber, pharse24Words) => {
        if (ok) {
          resolve({ bitmarkAccountNumber, pharse24Words });
        } else {
          reject(new Error('Can not try 24 words!'));
        }
      });
    });
  },

  getAssetInfo: (filePath) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.getAssetInfo(filePath, (ok, id, fingerprint) => {
        if (ok) {
          resolve({ fingerprint, id });
        } else {
          reject(new Error('Can not getAssetInfo!'));
        }
      });
    });
  },
  validateMetadata: (metadata) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.validateMetadata(metadata, (ok) => {
        console.log('validateMetadata :', metadata, ok);
        if (ok) {
          resolve();
        } else {
          reject(new Error('validateMetadata error'));
        }
      });
    });
  }
};
export { BitmarkSDK };
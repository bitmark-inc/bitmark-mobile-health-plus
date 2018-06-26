import { NativeModules } from 'react-native'
let SwiftBitmarkSDK = NativeModules.BitmarkSDK;

const newError = (reason, defaultMessage) => {
  let message = (reason && typeof (reason) === 'string') ? reason : defaultMessage;
  message = message || 'Internal application error!'
  return new Error(message);
}

const BitmarkSDK = {
  // return session id
  newAccount: (network) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.newAccount(network, (ok, result) => {
        if (ok) {
          resolve(result);
        } else {
          reject(newError(result, 'Can not create new Account!'));
        }
      });
    });
  },
  newAccountFrom24Words: (phrase24Words, network) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.newAccountFrom24Words(phrase24Words, network, (ok, result) => {
        if (ok) {
          resolve(result);
        } else {
          reject(newError(result, 'Can not recovery account from 24 words!'));
        }
      });
    });
  },
  requestSession: (network, message) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.requestSession(network, message, (ok, result) => {
        if (ok) {
          resolve(result);
        } else {
          reject(newError(result, 'Can not request session!'));
        }
      });
    });
  },

  // one time
  removeAccount: () => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.removeAccount((ok, result) => {
        if (ok) {
          resolve();
        } else {
          reject(newError(result, 'Can not remove account!'));
        }
      });
    });
  },

  // use session id
  disposeSession: (sessionId) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.disposeSession(sessionId, (ok, result) => {
        if (ok && sessionId) {
          resolve(sessionId);
        } else {
          reject(newError(result, 'Can not dispose session!'));
        }
      });
    });
  },
  accountInfo: (sessionId) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.accountInfo(sessionId, (ok, result, phrase24Words) => {
        if (ok) {
          resolve({ bitmarkAccountNumber: result, phrase24Words });
        } else {
          reject(newError(result, 'Can not get current account!'));
        }
      });
    });
  },
  signMessage: (message, sessionId) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.sign(sessionId, message, (ok, result) => {
        if (ok) {
          resolve(result);
        } else {
          reject(newError(result, 'Can not sign message!'));
        }
      });
    });
  },
  rickySignMessage: (messages, sessionId) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.rickySign(sessionId, messages, (ok, results) => {
        if (ok && results && results.length === messages.length) {
          resolve(results);
        } else {
          reject(new Error(results || 'Can not sign message!'));
        }
      });
    });
  },
  registerAccessPublicKey: (sessionId) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.registerAccessPublicKey(sessionId, (ok, result) => {
        if (ok && result) {
          resolve(result);
        } else {
          reject(newError(result, 'Can not register access public key!'));
        }
      });
    });
  },

  createSessionData: (sessionId, encryptionKey) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.createSessionData(sessionId, encryptionKey, (ok, result) => {
        if (ok && result) {
          resolve(result);
        } else {
          reject(newError(result, 'Can not create session data!'));
        }
      });
    });
  },

  issueRecord: (sessionId, fingerprint, property_name, metadata, quantity) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.issueRecord(sessionId, { fingerprint, property_name, metadata, quantity }, (ok, result) => {
        if (ok && result) {
          resolve(result);
        } else {
          reject(newError(result, 'Can not issue bitmark!'));
        }
      });
    });
  },

  issueFile: (sessionId, filePath, propertyName, metadata, quantity, isPublicAsset) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.issueFile(sessionId, {
        url: filePath,
        property_name: propertyName,
        metadata,
        quantity,
        is_public_asset: !!isPublicAsset
      }, (ok, results) => {
        if (ok && results) {
          resolve(results);
        } else {
          reject(new Error(results || 'Can not issue file!'));
        }
      });
    });
  },
  transferOneSignature: (sessionId, bitmarkId, address) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.transferOneSignature(sessionId, bitmarkId, address, (ok, results) => {
        if (ok) {
          resolve({ result: ok });
        } else {
          reject(new Error(results || 'Can transfer One Signature!'));
        }
      });
    });
  },

  issueThenTransferFile: (sessionId, filePath, property_name, metadata, receiver, extra_info) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.issueThenTransferFile(sessionId, {
        url: filePath,
        property_name,
        metadata,
        receiver,
        extra_info,
      }, (ok, result) => {
        if (ok && result) {
          resolve(result);
        } else {
          reject(newError(result, 'Can not issue then transfer file!'));
        }
      });
    });
  },

  createAndSubmitTransferOffer: (sessionId, bitmarkId, receiver) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.createAndSubmitTransferOffer(sessionId, bitmarkId, receiver, (ok, result) => {
        if (ok && result) {
          resolve(result);
        } else {
          reject(newError(result, 'Can not sign first signature for transfer!'));
        }
      });
    });
  },
  signForTransferOfferAndSubmit: (sessionId, txid, signature1, offerId, action) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.signForTransferOfferAndSubmit(sessionId, txid, signature1, offerId, action, (ok, result) => {
        if (ok) {
          resolve({ result: ok });
        } else {
          reject(newError(result, 'Can not sign second signature for transfer!'));
        }
      });
    });
  },

  // don use session di
  try24Words: (phrase24Words, network) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.try24Words(phrase24Words, network, (ok, result, phrase24Words) => {
        if (ok) {
          resolve({ bitmarkAccountNumber: result, phrase24Words });
        } else {
          reject(newError(result, 'Can not try 24 words!'));
        }
      });
    });
  },

  getAssetInfo: (filePath) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.getAssetInfo(filePath, (ok, result, fingerprint) => {
        if (ok) {
          resolve({ fingerprint, id: result });
        } else {
          reject(newError(result, 'Can not get basic asset information!'));
        }
      });
    });
  },
  validateMetadata: (metadata) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.validateMetadata(metadata, (ok, result) => {
        if (ok) {
          resolve();
        } else {
          reject(newError(result, 'Metadata invalid!'));
        }
      });
    });
  },
  validateAccountNumber: (accountNumber, network) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.validateAccountNumber(accountNumber, network, (ok, result) => {
        if (ok) {
          resolve();
        } else {
          reject(newError(result, 'Account invalid!'));
        }
      });
    });
  },
  downloadBitmark: (sessionId, bitmarkId) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.downloadBitmark(sessionId, bitmarkId, (ok, result) => {
        if (ok) {
          resolve(result);
        } else {
          reject(newError(result, 'Can not download bitmark!'));
        }
      });
    });
  },
};
export { BitmarkSDK };
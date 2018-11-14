import { NativeModules } from 'react-native'
let SwiftBitmarkSDK = NativeModules.BitmarkSDK;

const newError = (reason, defaultMessage) => {
  let message = (reason && typeof (reason) === 'string') ? reason : defaultMessage;
  message = message || 'Internal application error!'
  return new Error(message);
}

const BitmarkSDK = {
  // return session id
  newAccount: (network, version = 'v2', enableTouchFaceId) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.newAccount(network, version, enableTouchFaceId, (ok, result) => {
        if (ok) {
          resolve(result);
        } else {
          reject(newError(result, 'Can not create new Account!'));
        }
      });
    });
  },
  newAccountFromPhraseWords: (phraseWords, network, enableTouchFaceId) => {
    console.log('phraseWords :', phraseWords);
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.newAccountFromPhraseWords(phraseWords, network, enableTouchFaceId, (ok, result) => {
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
      SwiftBitmarkSDK.accountInfo(sessionId, (ok, result, phraseWords) => {
        if (ok) {
          resolve({ bitmarkAccountNumber: result, phraseWords });
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

  issueFile: (sessionId, localFolderPath, filePath, propertyName, metadata, quantity, isPublicAsset) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.issueFile(sessionId, {
        url: filePath,
        property_name: propertyName,
        metadata,
        quantity,
        is_public_asset: !!isPublicAsset
      }, localFolderPath,
        (ok, bitmarkIds, assetId, sessionData, encryptedFilePath) => {
          console.log('issueFile :', ok, bitmarkIds, assetId, sessionData, encryptedFilePath);
          if (ok) {
            resolve({ bitmarkIds, assetId, sessionData, encryptedFilePath });
          } else {
            reject(new Error(bitmarkIds || 'Can not issue file!'));
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

  issueThenTransferFile: (sessionId, localFolderPath, filePath, property_name, metadata, receiver, extra_info) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.issueThenTransferFile(sessionId, {
        url: filePath,
        property_name,
        metadata,
        receiver,
        extra_info,
      }, localFolderPath,
        (ok, result) => {
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
  tryPhraseWords: (phraseWords, network) => {
    console.log('phraseWords :', phraseWords);
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.tryPhraseWords(phraseWords, network, (ok, result, phraseWords) => {
        if (ok) {
          resolve({ bitmarkAccountNumber: result, phraseWords });
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
  downloadBitmark: (sessionId, bitmarkId, localFolderPath) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.downloadBitmark(sessionId, bitmarkId, localFolderPath, (ok, result) => {
        if (ok) {
          resolve(result);
        } else {
          reject(newError(result, 'Can not download bitmark!'));
        }
      });
    });
  },
  downloadBitmarkWithGrantId: (sessionId, grantId, localFolderPath) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.downloadBitmarkWithGrantId(sessionId, grantId, localFolderPath, (ok, result) => {
        if (ok) {
          resolve(result);
        } else {
          reject(newError(result, 'Can not download bitmark via grand id!'));
        }
      });
    });
  },


  createSessionDataFromLocalForRecipient: (sessionId, bitmarkId, sessionData, recipient) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.createSessionDataFromLocalForRecipient(sessionId, bitmarkId, sessionData, recipient, (ok, result) => {
        if (ok && result) {
          resolve(result);
        } else {
          reject(newError(result, 'Can not create session data local!'));
        }
      });
    });
  },
  createSessionDataForRecipient: (sessionId, bitmarkId, recipient) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.createSessionDataForRecipient(sessionId, bitmarkId, recipient, (ok, result) => {
        if (ok && result) {
          resolve(result);
        } else {
          reject(newError(result, 'Can not create session data!'));
        }
      });
    });
  },


};
export { BitmarkSDK };
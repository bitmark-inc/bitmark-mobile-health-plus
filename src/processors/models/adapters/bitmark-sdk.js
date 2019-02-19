import { NativeModules } from 'react-native'
let SwiftBitmarkSDK = NativeModules.BitmarkSDKWrapper;

const BitmarkSDK = {

  sdkInit: async (network) => {
    return await SwiftBitmarkSDK.sdkInit(network);
  },
  // return session id
  newAccount: async (enableTouchFaceId) => {
    // todo call authenticate before call new account for case enableTouchFaceId
    return await SwiftBitmarkSDK.createAccount(enableTouchFaceId);
  },
  newAccountFromPhraseWords: async (phraseWords, enableTouchFaceId) => {
    // todo call authenticate before call login for case enableTouchFaceId
    return await SwiftBitmarkSDK.createAccountFromPhrase(phraseWords, enableTouchFaceId);
  },
  requestSession: async (message) => {
    return await SwiftBitmarkSDK.authenticate(message);
  },

  // one time
  removeAccount: async () => {
    return await SwiftBitmarkSDK.removeAccount();
  },

  accountInfo: async () => {
    let list = await SwiftBitmarkSDK.accountInfo();
    return {
      bitmarkAccountNumber: list[0],
      phraseWords: list[1],
    };
  },

  generatePhrase: async () => {
    let list = await SwiftBitmarkSDK.generatePhrase();
    return {
      bitmarkAccountNumber: list[0],
      phraseWords: list[1],
    };
  },
  storeFileSecurely: async (filePath, desFilePath) => {
    return await SwiftBitmarkSDK.storeFileSecurely(filePath, desFilePath);
  },
  signMessages: async (messages) => {
    return await SwiftBitmarkSDK.sign(messages);
  },
  issue: async (filePath, propertyName, metadata, quantity) => {
    let list = await SwiftBitmarkSDK.issue({
      url: filePath,
      property_name: propertyName,
      metadata,
      quantity,
    });
    return {
      bitmarkIds: list[0],
      assetId: list[1],
    };
  },
  transfer: async (bitmarkId, address) => {
    return await SwiftBitmarkSDK.transfer({
      address, bitmark_id: bitmarkId
    });
  },

  // don use session di
  tryPhrase: async (phraseWords) => {
    return await SwiftBitmarkSDK.tryPhrase(phraseWords);
  },

  getAssetInfo: async (filePath) => {
    let list = await SwiftBitmarkSDK.getAssetInfo(filePath);
    return { id: list[0], fingerprint: list[1] };
  },
  validateMetadata: async (metadata) => {
    try {
      await SwiftBitmarkSDK.validateMetadata(metadata);
      return true;
    } catch (error) {
      return false;
    }
  },
  validateAccountNumber: async (accountNumber) => {
    return await SwiftBitmarkSDK.validateAccountNumber(accountNumber);
  },
  migrateFrom24WordsTo12Words: async (twelveWords, progressCallback) => {
    return await SwiftBitmarkSDK.migrate(twelveWords, progressCallback);
  },

};
export { BitmarkSDK };
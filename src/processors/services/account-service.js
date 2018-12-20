import DeviceInfo from 'react-native-device-info';
import ReactNative from 'react-native';

import { AccountModel, CommonModel, UserModel, BitmarkModel } from './../models';
import { FileUtil, populateAssetNameFromPdf, populateAssetNameFromImage, runPromiseWithoutError, isPdfFile, isImageFile } from 'src/utils';
import { CryptoAdapter } from '../models/adapters/crypto';
import moment from 'moment';

const {
  PushNotificationIOS,
  Platform,
} = ReactNative;

// ================================================================================================\
const doGetCurrentAccount = async () => {
  let userInfo = await AccountModel.doGetCurrentAccount();
  let userInformation = { bitmarkAccountNumber: userInfo.bitmarkAccountNumber };

  await UserModel.doUpdateUserInfo(userInformation);
  return userInformation;
}

const doCreateSignatureData = async (touchFaceIdMessage) => {
  let signatureData = await CommonModel.doCreateSignatureData(touchFaceIdMessage);
  if (!signatureData) {
    return null;
  }
  let userInfo = await UserModel.doGetCurrentUser();
  signatureData.account_number = userInfo.bitmarkAccountNumber;
  return signatureData;
};

// ================================================================================================
// ================================================================================================
let configure = (onRegister, onNotification) => {
  return AccountModel.configure(onRegister, onNotification);
};

let isRequesting = false;
let requestResult = null;
let waitRequestPermission = () => {
  return new Promise((resolve) => {
    let checkRequestDone = () => {
      if (!isRequesting) {
        resolve(requestResult);
      } else {
        setTimeout(checkRequestDone, 200);
      }
    }
    checkRequestDone();
  });
};
let doRequestNotificationPermissions = async () => {
  if (isRequesting) {
    return await waitRequestPermission();
  }
  isRequesting = true;
  requestResult = await AccountModel.doRequestNotificationPermissions();
  isRequesting = false;
  return requestResult;
};

let doCheckNotificationPermission = () => {
  return new Promise((resolve) => {
    doRequestNotificationPermissions().then(resolve).catch(error => {
      console.log('AccountService doCheckNotificationPermission error :', error);
      resolve();
    })
  });
};

let setApplicationIconBadgeNumber = (number) => {
  return AccountModel.setApplicationIconBadgeNumber(number);
};

let doRegisterNotificationInfo = async (accountNumber, token, intercomUserId) => {
  let signatureData;
  if (accountNumber) {
    signatureData = await CommonModel.doCreateSignatureData();
    if (!signatureData) {
      return;
    }
  } else {
    signatureData = {};
  }
  let client = 'healthplus';
  client = (DeviceInfo.getBundleId() === 'com.bitmark.healthplus.inhouse') ? 'healthplusinhouse' :
    (DeviceInfo.getBundleId() === 'com.bitmark.healthplus.beta') ? 'healthplusbeta' : client;
  return await AccountModel.doRegisterNotificationInfo(accountNumber, signatureData.timestamp, signatureData.signature, Platform.OS, token, client, intercomUserId);
};

let doTryDeregisterNotificationInfo = (accountNumber, token, signatureData) => {
  return new Promise((resolve) => {
    AccountModel.doDeregisterNotificationInfo(accountNumber, signatureData.timestamp, signatureData.signature, token)
      .then(resolve)
      .catch(error => {
        console.log('doTryDeregisterNotificationInfo error :', error);
        resolve();
      });
  });
};

let removeAllDeliveredNotifications = () => {
  PushNotificationIOS.removeAllDeliveredNotifications();
};

let doProcessEmailRecords = async (bitmarkAccountNumber, emailIssueRequestsFromAnEmail) => {
  let results = { ids: [], list: [] };
  for (let emailIssueRequest of emailIssueRequestsFromAnEmail) {
    let folderPath = `${FileUtil.CacheDirectory}/${bitmarkAccountNumber}/email_records/${emailIssueRequest.id}`;
    await FileUtil.mkdir(folderPath);
    let unzipFolder = `${folderPath}/temp_email_records`;
    await FileUtil.mkdir(unzipFolder);

    let encryptedFilePath = `${folderPath}/temp_email_records_encrypted.zip`;
    await FileUtil.downloadFile(emailIssueRequest.download_url, encryptedFilePath);


    let decryptedFilePath = `${folderPath}/temp_email_records_decrypted.zip`;
    await CryptoAdapter.decryptAES(encryptedFilePath, emailIssueRequest.aes_key, emailIssueRequest.aes_iv, emailIssueRequest.aes_cipher, decryptedFilePath);

    await FileUtil.unzip(decryptedFilePath, unzipFolder);

    let existDataFolder = await runPromiseWithoutError(FileUtil.exists(`${unzipFolder}/data`));
    if (existDataFolder && !existDataFolder.error) {
      let list = await FileUtil.readDir(`${unzipFolder}/data`);
      if (list && list.length > 0) {
        results.ids.push(emailIssueRequest.id);
        for (let filename of list) {
          if (!filename.toLowerCase().endsWith('.desc')) {
            let filePath = `${unzipFolder}/data/${filename}`;
            let assetName;
            let detectedTexts;
            let existingAsset = false;
            let metadataList = [];
            let assetInfo = await BitmarkModel.doPrepareAssetInfo(filePath);
            let assetInformation = await BitmarkModel.doGetAssetInformation(assetInfo.id);
            if (assetInformation) {
              existingAsset = true;
              assetName = assetInformation.name;
            } else {

              assetName = `HR${moment().format('YYYYMMMDDHHmmss')}`.toUpperCase();
              if (isPdfFile(filePath)) {
                let detectResult = await populateAssetNameFromPdf(filePath);
                detectedTexts = detectResult.detectedTexts;
              } else if (isImageFile(filePath)) {
                let detectResult = await populateAssetNameFromImage(filePath);
                detectedTexts = detectResult.detectedTexts;
              }
              metadataList.push({ label: 'Source', value: 'Medical Records' });
              metadataList.push({ label: 'Saved Time', value: new Date(emailIssueRequest.created_at).toISOString() });
            }

            results.list.push({
              filePath, assetName,
              metadata: metadataList,
              existingAsset,
              detectedTexts
            });
          }
        }
      }
    }
  }
  return results;
};


let doGetAllEmailRecords = async (bitmarkAccountNumber, jwt) => {
  let emailIssueRequests = await AccountModel.doGetAllEmailRecords(jwt);

  let result = {};
  if (emailIssueRequests && emailIssueRequests.length > 0) {
    for (let emailIssueRequest of emailIssueRequests) {
      result[emailIssueRequest.sender] = result[emailIssueRequest.sender] || [];
      result[emailIssueRequest.sender].push(emailIssueRequest);
    }
  }
  return result;
};

let AccountService = {
  doGetCurrentAccount,
  doCreateSignatureData,

  configure,
  setApplicationIconBadgeNumber,
  removeAllDeliveredNotifications,

  doRequestNotificationPermissions,
  doCheckNotificationPermission,
  doRegisterNotificationInfo,
  doTryDeregisterNotificationInfo,
  doGetAllEmailRecords,
  doProcessEmailRecords,
};

export { AccountService };
import DeviceInfo from 'react-native-device-info';
import ReactNative from 'react-native';
import { sha3_256 } from 'js-sha3';
import aesjs from 'aes-js';
import randomString from 'random-string';

import { AccountModel, CommonModel, BitmarkSDK, UserModel, BitmarkModel } from './../models';
import { config } from '../configs';
import { FileUtil, populateAssetNameFromPdf, populateAssetNameFromImage, runPromiseWithoutError } from './../utils';
const {
  PushNotificationIOS,
  Platform,
} = ReactNative;

// ================================================================================================\
const doGetCurrentAccount = async (touchFaceIdSession) => {
  let userInfo = await AccountModel.doGetCurrentAccount(touchFaceIdSession);
  let userInformation = { bitmarkAccountNumber: userInfo.bitmarkAccountNumber };

  await UserModel.doUpdateUserInfo(userInformation);
  return userInformation;
}

const doCreateSignatureData = async (touchFaceIdMessage) => {
  let signatureData = await CommonModel.doTryCreateSignatureData(touchFaceIdMessage);
  if (!signatureData) {
    return null;
  }
  let userInfo = await UserModel.doGetCurrentUser();
  signatureData.account_number = userInfo.bitmarkAccountNumber;
  return signatureData;
};

const doValidateBitmarkAccountNumber = async (accountNumber) => {
  let userInfo = await UserModel.doGetCurrentUser();
  if (userInfo.bitmarkAccountNumber === accountNumber) {
    throw new Error('Can not transfer for current user!');
  }
  return await BitmarkSDK.validateAccountNumber(accountNumber, config.bitmark_network);
}

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

let doRegisterNotificationInfo = async (accountNumber, token) => {
  let signatureData = await CommonModel.doTryCreateSignatureData('Please sign to authorize your transactions');
  if (!signatureData) {
    return;
  }
  let client = 'healthplus';
  client = (DeviceInfo.getBundleId() === 'com.bitmark.healthplus.inhouse') ? 'healthplusinhouse' :
    (DeviceInfo.getBundleId() === 'com.bitmark.healthplus.beta') ? 'healthplusbeta' : client;
  let intercomUserId = `HealthPlus_${sha3_256(accountNumber)}`;
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

let doGetAllGrantedAccess = async (accountNumber, jwt) => {
  let data = await AccountModel.doGetAllGrantedAccess(accountNumber);
  let granted_from = [];
  let granted_to = [];
  data.access_grants.forEach(item => {
    if (item.from === accountNumber) {
      let grantedInfo = granted_to.find(it => it.grantee === item.to);
      if (!grantedInfo) {
        grantedInfo = {
          ids: {},
          grantor: accountNumber,
          grantee: item.to,
          created_at: item.created_at,
          granted_at: item.start_at,
        };
        grantedInfo.ids[item.asset_id] = item.id;
        granted_to.push(grantedInfo);
      } else {
        grantedInfo.ids[item.asset_id] = item.id;
      }
    } else if (item.to === accountNumber) {
      let grantedInfo = granted_from.find(it => it.grantor === item.from);
      if (!grantedInfo) {
        grantedInfo = {
          ids: {},
          grantor: item.from,
          grantee: accountNumber,
          created_at: item.created_at,
          granted_at: item.start_at,
        };
        grantedInfo.ids[item.asset_id] = item.id;
        granted_from.push(grantedInfo);
      } else {
        grantedInfo.ids[item.asset_id] = item.id;
      }
    }
  });
  console.log('doGetAllGrantedAccess :', granted_from, granted_to);
  let waiting = await AccountModel.doGetWaitingGrantedAccess(jwt);
  return { waiting, granted_from, granted_to };
};

let doProcessEmailRecords = async (bitmarkAccountNumber, emailIssueRequestsFromAnEmail) => {
  let results = { ids: [], list: [] };
  for (let emailIssueRequest of emailIssueRequestsFromAnEmail) {
    let folderPath = `${FileUtil.CacheDirectory}/${bitmarkAccountNumber}/email_records/${emailIssueRequest.id}`;
    await FileUtil.mkdir(folderPath);
    let unzipFolder = `${folderPath}/temp_email_records`;
    await FileUtil.mkdir(unzipFolder);

    let encryptedFilePath = `${folderPath}/temp_email_records_encrypted.zip`;
    let start = Date.now();
    await FileUtil.downloadFile(emailIssueRequest.download_url, encryptedFilePath);
    console.log('download time:', (Date.now() - start) / 1000);

    start = Date.now();
    let contentEncryptedFile = await FileUtil.readFile(encryptedFilePath, 'base64');

    let keyInByte = Buffer.from(emailIssueRequest.aes_key, 'hex');
    let ivInByte = Buffer.from(emailIssueRequest.aes_iv, 'hex');
    let contentEncryptedFileInBytes = Buffer.from(contentEncryptedFile, 'base64');

    let aesOfbDecrypt = new aesjs.ModeOfOperation.ofb(keyInByte, ivInByte);
    let contentDecryptedFileInBytes = aesOfbDecrypt.decrypt(contentEncryptedFileInBytes);

    let decryptedFilePath = `${folderPath}/temp_email_records_decrypted.zip`;
    await FileUtil.writeFile(decryptedFilePath, Buffer.from(contentDecryptedFileInBytes).toString('base64'), 'base64');
    console.log('decrypt time:', (Date.now() - start) / 1000);
    start = Date.now();
    await FileUtil.unzip(decryptedFilePath, unzipFolder);
    console.log('unzip time:', (Date.now() - start) / 1000);

    let existDataFolder = await runPromiseWithoutError(FileUtil.exists(`${unzipFolder}/data`));
    if (existDataFolder && !existDataFolder.error) {
      start = Date.now();
      let list = await FileUtil.readDir(`${unzipFolder}/data`);
      if (list && list.length > 0) {
        results.ids.push(emailIssueRequest.id);
        for (let filename of list) {
          if (!filename.toLowerCase().endsWith('.desc')) {
            let filePath = `${unzipFolder}/data/${filename}`;
            let assetName;
            let existingAsset = false;
            let metadataList = [];
            let assetInfo = await BitmarkModel.doPrepareAssetInfo(filePath);
            let assetInformation = await BitmarkModel.doGetAssetInformation(assetInfo.id);
            if (assetInformation) {
              existingAsset = true;
              assetName = assetInformation.name;
            } else {

              let fileExtension = filePath.substring(filePath.lastIndexOf('.') + 1);
              let defaultAssetName = `HA${randomString({ length: 8, numeric: true, letters: false, })}`;

              const imageExtensions = ['PNG', 'JPG', 'JPEG', 'HEIC', 'TIFF', 'BMP', 'HEIF', 'IMG'];
              const pdfExtensions = ['PDF'];
              if (pdfExtensions.includes(fileExtension.toUpperCase())) {
                assetName = await populateAssetNameFromPdf(filePath, defaultAssetName);
              } else if (imageExtensions.includes(fileExtension.toUpperCase())) {
                assetName = await populateAssetNameFromImage(filePath, defaultAssetName);
              } else {
                assetName = defaultAssetName;
              }
              metadataList.push({ label: 'Source', value: 'Medical Records' });
              metadataList.push({ label: 'Saved Time', value: new Date(emailIssueRequest.created_at).toISOString() });
            }

            results.list.push({
              filePath, assetName,
              metadata: metadataList,
              existingAsset,
            });
          }
        }
      }
      console.log('detect asset time:', (Date.now() - start) / 1000);
    }
  }
  return results;
};


let doGetAllEmailRecords = async (bitmarkAccountNumber, jwt) => {
  let emailIssueRequests = await AccountModel.doGetAllEmailRecords(jwt);

  // let emailIssueRequests = [
  //   {
  //     "id": "2f05da53-4e34-4a02-96df-35092108f160",
  //     "account_number": "eB8RZTonPwUUpBPD6kXPffWfjvztdCyy9Ah7FD94iJnPZ4sFYN",
  //     "sender": "Moise Domino <ngleanh.reg@gmail.com>",
  //     "subject": "Medical report from Dr. Anh",
  //     "download_url": "https://drop.test.bitmark.com/zips/z_20181018_084441_768e9d919c663af68f32eb6a8eb43985.ezip",
  //     "aes_cipher": "aes-256-ofb",
  //     "aes_key": "b3b11c127ced166a246adf650a804addb6e5379099b1f7f2bcbb9e58c91dae1f",
  //     "aes_iv": "91055c52c036d7a67fa70ce3cf658a5b",
  //     "created_at": "2018-10-18T08:44:41.593533Z"
  //   }
  // ];
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
  doValidateBitmarkAccountNumber,

  configure,
  setApplicationIconBadgeNumber,
  removeAllDeliveredNotifications,

  doRequestNotificationPermissions,
  doCheckNotificationPermission,
  doRegisterNotificationInfo,
  doTryDeregisterNotificationInfo,
  doGetAllGrantedAccess,
  doGetAllEmailRecords,
  doProcessEmailRecords,
};

export { AccountService };
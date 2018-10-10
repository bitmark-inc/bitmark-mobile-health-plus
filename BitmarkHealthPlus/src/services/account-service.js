import { AccountModel, CommonModel, BitmarkSDK, UserModel } from './../models';
import { config } from '../configs';
import DeviceInfo from 'react-native-device-info';
import ReactNative from 'react-native';
import { sha3_256 } from 'js-sha3';
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
  client = DeviceInfo.getBundleId() === 'com.bitmark.healthplus.inhouse' ? 'healthplusinhouse' :
    (DeviceInfo.getBundleId() === 'com.bitmark.healthplus.beta' ? 'healthplusbeta' : client);
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
};

export { AccountService };
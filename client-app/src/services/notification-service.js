import DeviceInfo from 'react-native-device-info';
import ReactNative from 'react-native';
const {
  PushNotificationIOS,
  Platform,
} = ReactNative;
import { NotificationModel, CommonModel } from './../models';

let configure = (onRegister, onNotification) => {
  return NotificationModel.configure(onRegister, onNotification);
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
  requestResult = await NotificationModel.doRequestNotificationPermissions();
  isRequesting = false;
  return requestResult;
};

let doCheckNotificationPermission = () => {
  return new Promise((resolve) => {
    doRequestNotificationPermissions().then(resolve).catch(error => {
      console.log('NotificationService doCheckNotificationPermission error :', error);
      resolve();
    })
  });
};

let setApplicationIconBadgeNumber = (number) => {
  return NotificationModel.setApplicationIconBadgeNumber(number);
};

let doRegisterNotificationInfo = async (accountNumber, token) => {
  let signatureData = await CommonModel.doTryCreateSignatureData('Please sign to authorize your transactions');
  if (!signatureData) {
    return;
  }
  let client = 'primary';
  client = DeviceInfo.getBundleId() === 'com.bitmark.bitmarkios.inhouse' ? 'beta' : client;
  client = DeviceInfo.getBundleId() === 'com.bitmark.bitmarkios.development' ? 'development' : client;
  return await NotificationModel.doRegisterNotificationInfo(accountNumber, signatureData.timestamp, signatureData.signature, Platform.OS, token, client);
};

let doTryDeregisterNotificationInfo = (accountNumber, token, signatureData) => {
  return new Promise((resolve) => {
    NotificationModel.doDeregisterNotificationInfo(accountNumber, signatureData.timestamp, signatureData.signature, token)
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

let NotificationService = {
  configure,
  setApplicationIconBadgeNumber,
  removeAllDeliveredNotifications,

  doRequestNotificationPermissions,
  doCheckNotificationPermission,
  doRegisterNotificationInfo,
  doTryDeregisterNotificationInfo,
};

export { NotificationService };
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
let waitRequestPermistion = () => {
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
    return await waitRequestPermistion();
  }
  isRequesting = true;
  requestResult = await NotificationModel.doRequestNotificationPermissions();
  isRequesting = false;
  return requestResult;
};

let doCheckNotificaitonPermission = () => {
  return new Promise((resolve) => {
    doRequestNotificationPermissions().then(resolve).catch(error => {
      console.log('NotificationService doCheckNotificaitonPermission error :', error);
      resolve();
    })
  });
};

let setApplicationIconBadgeNumber = (number) => {
  return NotificationModel.setApplicationIconBadgeNumber(number);
};

let doRegisterNotificationInfo = async (accountNumber, token) => {
  let signatureData = CommonModel.doTryCreateSignatureData('Touch/Face ID or a passcode is required to authorize your transactions');
  return await NotificationModel.doRegisterNotificationInfo(accountNumber, signatureData.timestamp, signatureData.signature, Platform.OS, token);
};

let doDeregisterNotificationInfo = async (accountNumber, token, signatureData) => {
  return await NotificationModel.doDeregisterNotificationInfo(accountNumber, signatureData.timestamp, signatureData.signature, token);
};

let removeAllDeliveredNotifications = () => {
  PushNotificationIOS.removeAllDeliveredNotifications();
};

let NotificationService = {
  configure,
  setApplicationIconBadgeNumber,
  removeAllDeliveredNotifications,

  doRequestNotificationPermissions,
  doCheckNotificaitonPermission,
  doRegisterNotificationInfo,
  doDeregisterNotificationInfo,
};

export { NotificationService };
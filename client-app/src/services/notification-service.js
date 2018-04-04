import ReactNative from 'react-native';
const {
  PushNotificationIOS,
  Platform,
} = ReactNative;
import { NotificationModel, CommonModel, DonationModel } from './../models';

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

let doRegisterNotificationInfo = async (accountNumber, token, joinedDonation) => {
  console.log('doRegisterNotificationInfo : ', accountNumber, token, joinedDonation)
  let signatureData = await CommonModel.doTryCreateSignatureData('Touch/Face ID or a passcode is required to authorize your transactions');
  await DonationModel.doRegisterUserInformation(accountNumber, signatureData.timestamp, signatureData.signature, token);
  return await NotificationModel.doRegisterNotificationInfo(accountNumber, signatureData.timestamp, signatureData.signature, Platform.OS, token);
};

let doTryDeregisterNotificationInfo = (accountNumber, token, signatureData) => {
  return new Promise((resolve) => {
    NotificationModel.doDeregisterNotificationInfo(accountNumber, signatureData.timestamp, signatureData.signature, token).then(resolve).catch(error => {
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
  doCheckNotificaitonPermission,
  doRegisterNotificationInfo,
  doTryDeregisterNotificationInfo,
};

export { NotificationService };
import { NotificationModel } from './../models';

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

let doTryRegisterNotificationInfo = (deviceInfo) => {
  return new Promise((resolve) => {
    NotificationModel.doRegisterNotificationInfo(deviceInfo).then(resolve).catch(error => {
      console.log('NotificationService doTryRegisterNotificationInfo error :', error);
    })
  });
};

let doTryDeregisterNotificationInfo = (deviceInfo) => {
  return new Promise((resolve) => {
    NotificationModel.doDeregisterNotificationInfo(deviceInfo).then(resolve).catch(error => {
      console.log('NotificationService doTryRegisterNotificationInfo error :', error);
    });
  });
};

let NotificationService = {
  configure,
  setApplicationIconBadgeNumber,

  doRequestNotificationPermissions,
  doCheckNotificaitonPermission,
  doTryRegisterNotificationInfo,
  doTryDeregisterNotificationInfo,
  doRegisterNotificationInfo: NotificationModel.doRegisterNotificationInfo,
  doDeregisterNotificationInfo: NotificationModel.doDeregisterNotificationInfo,
};

export { NotificationService };
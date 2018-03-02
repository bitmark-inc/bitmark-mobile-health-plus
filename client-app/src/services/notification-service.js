import PushNotification from 'react-native-push-notification';

let configure = (onRegister, onNotification) => {
  PushNotification.configure({
    onRegister: onRegister,
    onNotification: onNotification,
    //ios default all permission
    requestPermissions: false,
  });
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
  requestResult = await PushNotification.requestPermissions();
  isRequesting = false;
  return requestResult;
};

let doCheckNotificaitonPermission = () => {
  return new Promise((resolve) => {
    NotificationService.doRequestNotificationPermissions().then(resolve).catch(error => {
      console.log('NotificationService doCheckNotificaitonPermission error :', error);
      resolve();
    })
  });
};

let setApplicationIconBadgeNumber = (number) => {
  return PushNotification.setApplicationIconBadgeNumber(number);
};

let NotificationService = {
  configure,
  doRequestNotificationPermissions,
  doCheckNotificaitonPermission,
  setApplicationIconBadgeNumber,
};

export { NotificationService };
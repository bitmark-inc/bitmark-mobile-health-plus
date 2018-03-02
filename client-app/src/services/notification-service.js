import PushNotification from 'react-native-push-notification';

let configure = (onRegister, onNotification) => {
  PushNotification.configure({
    onRegister: onRegister,
    onNotification: onNotification,
    //ios default all permission
    requestPermissions: false,
  });
};

let doRequestPermissions = async () => {
  return await PushNotification.requestPermissions();
};

let setApplicationIconBadgeNumber = (number) => {
  return PushNotification.setApplicationIconBadgeNumber(number);
};

let NotificationService = {
  configure,
  doRequestPermissions,
  setApplicationIconBadgeNumber,
};

export { NotificationService };
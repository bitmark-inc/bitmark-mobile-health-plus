import PushNotification from 'react-native-push-notification';

const doRegisterNotificationInfo = (deviceInfo) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    //TODO
    let tempURL = '';
    fetch(tempURL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deviceInfo),
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error('doGetProvenance error :' + JSON.stringify(data)));
      }
      //TODO
      resolve(data);
    }).catch(reject);
  });
};

const doDeregisterNotificationInfo = (deviceInfo) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    //TODO
    let tempURL = '';
    fetch(tempURL, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deviceInfo),
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error('doGetProvenance error :' + JSON.stringify(data)));
      }
      //TODO
      resolve(data);
    }).catch(reject);
  });
};

let configure = (onRegister, onNotification) => {
  PushNotification.configure({
    onRegister: onRegister,
    onNotification: onNotification,
    requestPermissions: false,
  });
};

let doRequestNotificationPermissions = async () => {
  return await PushNotification.requestPermissions();
};

let setApplicationIconBadgeNumber = (number) => {
  return PushNotification.setApplicationIconBadgeNumber(number);
};

let NotificationModel = {
  doRegisterNotificationInfo,
  doDeregisterNotificationInfo,

  configure,
  doRequestNotificationPermissions,
  setApplicationIconBadgeNumber,
};

export { NotificationModel };
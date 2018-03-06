import PushNotification from 'react-native-push-notification';
import { config } from '../configs';

const doRegisterNotificationInfo = (accountNumber, timestamp, signature, platform, token) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let tempURL = `${config.trade_server_url}/mobile/push_tokens`;
    fetch(tempURL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        requester: 'user/' + accountNumber,
        timestamp,
        signature,
      },
      body: JSON.stringify({ platform, token }),
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error('doGetProvenance error :' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const doDeregisterNotificationInfo = (accountNumber, timestamp, signature, token) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let tempURL = `${config.trade_server_url}/mobile/push_tokens/${token}`;
    fetch(tempURL, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        requester: 'user/' + accountNumber,
        timestamp,
        signature,
      },
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error('doGetProvenance error :' + JSON.stringify(data)));
      }
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
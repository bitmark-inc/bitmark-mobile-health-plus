import CookieManager from 'react-native-cookies';
import PushNotification from 'react-native-push-notification';
import { BitmarkSDK } from './adapters';
import { config } from '../configs';
import { FileUtil, runPromiseWithoutError } from './../utils';

const doCreateAccount = async (enableTouchFaceId) => {
  await CookieManager.clearAll();
  return await BitmarkSDK.newAccount(enableTouchFaceId);
};

const doLogin = async (phraseWords, enableTouchFaceId) => {
  await CookieManager.clearAll();
  return await BitmarkSDK.newAccountFromPhraseWords(phraseWords, enableTouchFaceId);
}

const doGetCurrentAccount = async () => {
  return await BitmarkSDK.accountInfo();
};

const doCheckPhraseWords = async (phraseWords) => {
  return await BitmarkSDK.tryPhrase(phraseWords);
};

const doLogout = async (jwt) => {
  let result = await runPromiseWithoutError(BitmarkSDK.removeAccount());
  if (result && result.error) {
    return null;
  }
  await CookieManager.clearAll();
  await doDeleteAccount(jwt);
  return true;
};

const doRegisterNotificationInfo = (accountNumber, timestamp, signature, platform, token, client, intercom_user_id) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let tempURL = `${config.mobile_server_url}/api/push_uuids`;
    let headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    if (accountNumber) {
      headers.requester = accountNumber;
      headers.timestamp = timestamp;
      headers.signature = signature;
    }
    fetch(tempURL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ platform, token, client, intercom_user_id }),
    }).then((response) => {
      statusCode = response.status;
      if (statusCode >= 500) {
        return response.text();
      }
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error('doRegisterNotificationInfo error :' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const doDeregisterNotificationInfo = (accountNumber, timestamp, signature, token) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let tempURL = `${config.mobile_server_url}/api/push_uuids/${token}`;
    fetch(tempURL, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        requester: accountNumber,
        timestamp,
        signature,
      },
    }).then((response) => {
      statusCode = response.status;
      if (statusCode >= 500) {
        return response.text();
      }
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error('doDeregisterNotificationInfo error :' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const doTryRegisterAccount = (accountNumber, timestamp, signature) => {
  return new Promise((resolve) => {
    let statusCode;
    let tempURL = `${config.mobile_server_url}/api/accounts`;
    fetch(tempURL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        requester: accountNumber,
        timestamp,
        signature,
      },
    }).then((response) => {
      statusCode = response.status;
      if (statusCode >= 500) {
        return response.text();
      }
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return resolve();
      }
      resolve(data);
    }).catch(() => resolve());
  });
};

const doTryGetAppVersion = () => {
  return new Promise((resolve) => {
    let statusCode;
    let tempURL = `${config.mobile_server_url}/api/app-versions/healthplus`;
    fetch(tempURL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      statusCode = response.status;
      if (statusCode >= 500) {
        return response.text();
      }
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return resolve();
      }
      resolve(data);
    }).catch(() => resolve());
  });
};

let configure = (onRegister, onNotification) => {
  PushNotification.configure({
    onRegister: onRegister,
    onNotification: onNotification,
    requestPermissions: true,
  });
};

let doRequestNotificationPermissions = async () => {
  return await PushNotification.requestPermissions();
};

let setApplicationIconBadgeNumber = (number) => {
  return PushNotification.setApplicationIconBadgeNumber(number);
};

let doRegisterJWT = (accountNumber, timestamp, signature) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let tempURL = `${config.mobile_server_url}/api/auth`;
    fetch(tempURL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requester: accountNumber,
        timestamp,
        signature,
      })
    }).then((response) => {
      statusCode = response.status;
      if (statusCode >= 500) {
        return response.text();
      }
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error('Request failed!' + statusCode + ' - ' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

let doDeleteAccount = (jwt) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let tempURL = `${config.mobile_server_url}/api/accounts`;
    fetch(tempURL, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + jwt,
      },
    }).then((response) => {
      statusCode = response.status;
      if (statusCode >= 500) {
        return response.text();
      }
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error('Request failed!' + statusCode + ' - ' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
}

let doGetAllEmailRecords = (jwt) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let tempURL = `${config.mobile_server_url}/api/email_issue_requests`;
    fetch(tempURL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + jwt,
      },
    }).then((response) => {
      statusCode = response.status;
      if (statusCode >= 500) {
        return response.text();
      }
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error('Request failed!' + statusCode + ' - ' + JSON.stringify(data)));
      }
      resolve(data.email_issue_requests);
    }).catch(reject);
  });
};

let doDownloadEmailRecordAttachment = async (jwt, attachmentId, filePath) => {
  return await FileUtil.downloadFile(`${config.mobile_server_url}/api/email_issue_requests/attachments/${attachmentId}/download`, filePath, {
    Authorization: 'Bearer ' + jwt,
  });
};

let doDeleteEmailRecord = (jwt, id) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let tempURL = `${config.mobile_server_url}/api/email_issue_requests/${id}`;
    fetch(tempURL, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + jwt,
      },
    }).then((response) => {
      statusCode = response.status;
      if (statusCode >= 500) {
        return response.text();
      }
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error('Request failed!' + statusCode + ' - ' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};


let doGetHockeyAppVersion = (appId, token) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    fetch(`https://rink.hockeyapp.net/api/2/apps/${appId}/app_versions`, {
      method: 'GET',
      headers: {
        'X-HockeyAppToken': token,
      },
    }).then((response) => {
      statusCode = response.status;
      if (statusCode >= 500) {
        return response.text();
      }
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return resolve();
      }
      resolve(data);
    }).catch(reject);
  });
};



let AccountModel = {
  doGetCurrentAccount,
  doCheckPhraseWords,
  doCreateAccount,
  doLogin,
  doLogout,

  doRegisterNotificationInfo,
  doDeregisterNotificationInfo,
  doTryGetAppVersion,

  configure,
  doRequestNotificationPermissions,
  setApplicationIconBadgeNumber,
  doTryRegisterAccount,

  doRegisterJWT,
  doDeleteAccount,

  doGetAllEmailRecords,
  doDownloadEmailRecordAttachment,
  doDeleteEmailRecord,

  doGetHockeyAppVersion,
}

export {
  AccountModel,
}
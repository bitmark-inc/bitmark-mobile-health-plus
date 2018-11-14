import CookieManager from 'react-native-cookies';
import PushNotification from 'react-native-push-notification';
import { BitmarkSDK } from './adapters';
import { config } from '../configs';
import { FileUtil, runPromiseWithoutError } from './../utils';

const doCreateAccount = async () => {
  await CookieManager.clearAll();
  return await BitmarkSDK.newAccount(config.bitmark_network);
};

const doLogin = async (phraseWords) => {
  await CookieManager.clearAll();
  return await BitmarkSDK.newAccountFromPhraseWords(phraseWords, config.bitmark_network);
}

const doGetCurrentAccount = async (touchFaceIdSession) => {
  return await BitmarkSDK.accountInfo(touchFaceIdSession);
};

const doCheckPhraseWords = async (phraseWords) => {
  return await BitmarkSDK.tryPhraseWords(phraseWords, config.bitmark_network);
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
    //TODO API
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

let doGrantingAccess = (jwt) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let tempURL = `${config.mobile_server_url}/api/granting_bitmarks`;
    fetch(tempURL, {
      method: 'POST',
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

let doReceiveGrantingAccess = (jwt, token, body) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let tempURL = `${config.mobile_server_url}/api/granting_bitmarks/${token}`;
    fetch(tempURL, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + jwt,
      },
      body: JSON.stringify(body || {})
    }).then((response) => {
      statusCode = response.status;
      if (statusCode >= 500) {
        return response.text();
      }
      return response.json();
    }).then((data) => {
      if (statusCode >= 500) {
        return reject(new Error('Request failed!' + statusCode + ' - ' + JSON.stringify(data)));
      } else if (statusCode >= 400) {
        resolve({ error: 'Access code is invalid or expired!' });
      }
      resolve(data);
    }).catch(reject);
  });
};

let doRevokeGrantingAccess = (jwt, token) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let tempURL = `${config.mobile_server_url}/api/granting_bitmarks/${token}`;
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

let doGetAllGrantedAccess = (accountNumber) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let tempURL = `${config.api_server_url}/v2/access-grants?account=${accountNumber}`;
    console.log('tempURL :', tempURL);
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
        return reject(new Error('Request failed!' + statusCode + ' - ' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

let doGetWaitingGrantedAccess = (jwt) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let tempURL = `${config.mobile_server_url}/api/granting_bitmarks`;
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
      resolve(data.waiting);
    }).catch(reject);
  });
};

let doRemoveGrantingAccess = (from, to, requester, timestamp, signature) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let tempURL = `${config.api_server_url}/v2/access-grants?from=${from}&to=${to}`;
    fetch(tempURL, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        requester,
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
        return reject(new Error('Request failed!' + statusCode + ' - ' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};


let doCancelGrantingAccess = (jwt, token) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let tempURL = `${config.mobile_server_url}/api/granting_bitmarks/${token}`;
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


const doCheckMigration = (jwt) => {
  return new Promise((resolve) => {
    let statusCode;
    let tempURL = `${config.mobile_server_url}/api/accounts/metadata`;
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
        return resolve();
      }
      resolve(data.metadata.bitmarks_migrated);
    }).catch(() => resolve());
  });
};

const doMarkMigration = (jwt, status) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let tempURL = `${config.mobile_server_url}/api/accounts/metadata`;
    fetch(tempURL, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + jwt,
      },
      body: JSON.stringify({
        metadata: { bitmarks_migrated: status === undefined ? true : status },
      })
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
  doGrantingAccess,
  doReceiveGrantingAccess,
  doGetAllGrantedAccess,
  doGetWaitingGrantedAccess,
  doRevokeGrantingAccess,
  doRemoveGrantingAccess,
  doCancelGrantingAccess,
  doGetAllEmailRecords,
  doDownloadEmailRecordAttachment,
  doDeleteEmailRecord,

  doCheckMigration,
  doMarkMigration,
}

export {
  AccountModel,
}
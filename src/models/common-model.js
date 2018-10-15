import moment from 'moment';

import { FaceTouchId, BitmarkSDK } from './adapters'
import { AsyncStorage } from 'react-native';
import { config } from './../configs';

const KEYS = {
  APP_INFORMATION: 'app-information',

  USER_INFORMATION: 'user-information',
  //original data

  USER_DATA_COMMON: 'user-data:common',
  USER_DATA_BITMARK: 'user-data:bitmark',
  USER_DATA_ACCOUNT_ACCESSES: 'user-data:account-access',
};

// ================================================================================================
// ================================================================================================
// private
const doRichSignMessage = (messages, sessionId) => {
  return new Promise((resolve) => {
    BitmarkSDK.rickySignMessage(messages, sessionId).then(resolve).catch(() => resolve());
  });
};

// ================================================================================================
const doSetLocalData = (localDataKey, data) => {
  localDataKey = localDataKey || KEYS.USER_INFORMATION;
  data = data || {};
  return new Promise((resolve, reject) => {
    AsyncStorage.setItem(localDataKey, JSON.stringify(data), (error) => {
      if (error) {
        return reject(error);
      }
      resolve();
    });
  });
};
const doGetLocalData = (localDataKey) => {
  localDataKey = localDataKey || KEYS.USER_INFORMATION;
  return new Promise((resolve, reject) => {
    AsyncStorage.getItem(localDataKey, (error, data) => {
      if (error) {
        return reject(error);
      }
      let localData;
      try {
        localData = JSON.parse(data);
      } catch (error) {
        console.log('doGetLocalData error:', error);
      }
      resolve(localData);
    });
  });
};
const doRemoveLocalData = (localDataKey) => {
  return new Promise((resolve, reject) => {
    AsyncStorage.removeItem(localDataKey, (error) => {
      if (error) {
        return reject(error);
      }
      resolve();
    });
  });
};
// ================================================================================================
const doCheckPasscodeAndFaceTouchId = async () => {
  return await FaceTouchId.isSupported();
};
// ================================================================================================
let currentFaceTouchSessionId = null;
let isRequestingSessionId = false;
let doWaitRequestSessionId = async () => {
  let isRequesting = isRequestingSessionId;
  return new Promise((resolve) => {
    let checkRequestingFinish = () => {
      if (!isRequestingSessionId) {
        resolve(isRequesting);
      } else {
        setTimeout(checkRequestingFinish, 500);
      }
    };
    checkRequestingFinish();
  });

};
const doEndNewFaceTouchSessionId = async () => {
  if (currentFaceTouchSessionId) {
    await BitmarkSDK.disposeSession(currentFaceTouchSessionId);
    currentFaceTouchSessionId = null;
  }
};

let queueStartFaceTouchSessionId = [];
const doStartFaceTouchSessionId = (touchFaceIdMessage) => {
  return new Promise((resolve, reject) => {
    if (isRequestingSessionId) {
      queueStartFaceTouchSessionId.push({ resolve, reject });
      return;
    }
    isRequestingSessionId = true;
    queueStartFaceTouchSessionId.push({ resolve, reject });
    doEndNewFaceTouchSessionId().then(() => {
      return BitmarkSDK.requestSession(config.bitmark_network, touchFaceIdMessage);
    }).then((faceTouchSessionId) => {
      currentFaceTouchSessionId = faceTouchSessionId;
      queueStartFaceTouchSessionId.forEach(prm => prm.resolve(currentFaceTouchSessionId));
      isRequestingSessionId = false;
    }).catch(error => {
      queueStartFaceTouchSessionId.forEach(prm => prm.reject(error));
      isRequestingSessionId = false;
    });
  });
};
const setFaceTouchSessionId = (sessionId) => {
  currentFaceTouchSessionId = sessionId;
};

const getFaceTouchSessionId = () => {
  return currentFaceTouchSessionId;
};
const resetFaceTouchSessionId = () => {
  currentFaceTouchSessionId = null;
};

const doTryRickSignMessage = async (messages, touchFaceIdMessage) => {
  let result = await doWaitRequestSessionId();
  if (result && !currentFaceTouchSessionId) {
    return null;
  }
  if (!currentFaceTouchSessionId) {
    await doStartFaceTouchSessionId(touchFaceIdMessage);
    if (!currentFaceTouchSessionId) {
      return null;
    }
  }
  let signatures = await doRichSignMessage(messages, currentFaceTouchSessionId);
  if (!signatures) {
    await doStartFaceTouchSessionId(touchFaceIdMessage);
    if (!currentFaceTouchSessionId) {
      return null;
    }
    signatures = await doRichSignMessage(messages, currentFaceTouchSessionId);
  }
  return signatures;
};

const doTryCreateSignatureData = async (touchFaceIdMessage) => {
  let result = await doWaitRequestSessionId();
  if (result && !currentFaceTouchSessionId) {
    return null;
  }
  if (!currentFaceTouchSessionId) {
    await doStartFaceTouchSessionId(touchFaceIdMessage);
    if (!currentFaceTouchSessionId) {
      return null;
    }
  }
  let timestamp = moment().toDate().getTime() + '';
  let signatures = await doRichSignMessage([timestamp], currentFaceTouchSessionId);
  if (!signatures) {
    await doStartFaceTouchSessionId(touchFaceIdMessage);
    if (!currentFaceTouchSessionId) {
      return null;
    }
    timestamp = moment().toDate().getTime() + '';
    signatures = await doRichSignMessage([timestamp], currentFaceTouchSessionId);
  }
  return { timestamp, signature: signatures[0] };
};

const doCreateSignatureData = async (touchFaceId) => {
  if (!touchFaceId) {
    touchFaceId = currentFaceTouchSessionId;
  }
  let timestamp = moment().toDate().getTime() + '';
  let signatures = await doRichSignMessage([timestamp], touchFaceId);
  return { timestamp, signature: signatures[0] };
};

// ================================================================================================
// ================================================================================================
// ================================================================================================
const doTrackEvent = (tags, fields) => {
  fields = fields || {};
  fields.hit = 1;
  return new Promise((resolve) => {
    let statusCode;
    let bitmarkUrl = config.mobile_server_url + `/api/metrics`;
    fetch(bitmarkUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metrics: [{
          tags, fields,
        }]
      })
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        console.log('doTrackEvent error :', data);
      }
      resolve(data);
    }).catch((error) => {
      console.log('doTrackEvent error :', error);
    });
  });
};
// ================================================================================================
// ================================================================================================
// ==
let CommonModel = {
  KEYS,
  doCheckPasscodeAndFaceTouchId,
  doSetLocalData,
  doGetLocalData,
  doRemoveLocalData,
  doStartFaceTouchSessionId,
  doCreateSignatureData,
  doTryCreateSignatureData,
  doTryRickSignMessage,
  setFaceTouchSessionId,
  getFaceTouchSessionId,
  resetFaceTouchSessionId,
  doTrackEvent,
}

export {
  CommonModel
}
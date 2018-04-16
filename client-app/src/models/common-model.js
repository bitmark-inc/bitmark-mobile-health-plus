import moment from 'moment';

import { FaceTouchId, BitmarkSDK } from './adapters'
import { AsyncStorage } from 'react-native';
import { config } from './../configs';

const KEYS = {
  USER_INFORMATION: 'bitmark-app',

  USER_DATA_LOCAL_BITMARKS: 'user-data:local-bitmarks',
  USER_DATA_TRACKIING_BITMARKS: 'user-data:tracking-bitmarks',
  USER_DATA_DONATION_INFORMATION: 'user-data:doantion-information',
  USER_DATA_TRANSACTIONS: 'user-data:transactions',
  USER_DATA_TRANSFER_OFFERS: 'user-data:transfer-offers',
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
      let localData = {};
      try {
        localData = JSON.parse(data);
      } catch (error) {
        doSetLocalData(localDataKey, localData);
      }
      resolve(localData || {});
    });
  });
};
// ================================================================================================
const doCheckPasscodeAndFaceTouchId = async () => {
  return await FaceTouchId.isSupported();
};
// ================================================================================================
let currentFaceTouceSessionId = null;
let isRequestingSessionId = false;
let doWaitRequestionSessionId = async () => {
  let isRequesting = isRequestingSessionId;
  return new Promise((resolve) => {
    let checRequestingFinish = () => {
      if (!isRequestingSessionId) {
        resolve(isRequesting);
      } else {
        setTimeout(checRequestingFinish, 500);
      }
    };
    checRequestingFinish();
  });

};
const doEndNewFaceTouceSessionId = async () => {
  if (currentFaceTouceSessionId) {
    await BitmarkSDK.disposeSession(currentFaceTouceSessionId);
    currentFaceTouceSessionId = null;
  }
};

const doStartFaceTouceSessionId = async (touchFaceIdMessage) => {
  await doEndNewFaceTouceSessionId();
  if (!currentFaceTouceSessionId) {
    isRequestingSessionId = true;
    currentFaceTouceSessionId = await BitmarkSDK.requestSession(config.bitmark_network, touchFaceIdMessage);
  }
  isRequestingSessionId = false;
  return currentFaceTouceSessionId;
};
const setFaceTouceSessionId = (sessionId) => {
  currentFaceTouceSessionId = sessionId;
};

const doTryRickSignMessage = async (messages, touchFaceIdMessage) => {
  let result = await doWaitRequestionSessionId();
  if (result && !currentFaceTouceSessionId) {
    return null;
  }
  if (!currentFaceTouceSessionId) {
    await doStartFaceTouceSessionId(touchFaceIdMessage);
    if (!currentFaceTouceSessionId) {
      return null;
    }
  }
  let signatures = await doRichSignMessage(messages, currentFaceTouceSessionId);
  if (!signatures) {
    await doStartFaceTouceSessionId(touchFaceIdMessage);
    if (!currentFaceTouceSessionId) {
      return null;
    }
    signatures = await doRichSignMessage(messages, currentFaceTouceSessionId);
  }
  return signatures;
};

const doTryCreateSignatureData = async (touchFaceIdMessage) => {
  let result = await doWaitRequestionSessionId();
  if (result && !currentFaceTouceSessionId) {
    return null;
  }
  if (!currentFaceTouceSessionId) {
    await doStartFaceTouceSessionId(touchFaceIdMessage);
    if (!currentFaceTouceSessionId) {
      return null;
    }
  }
  let timestamp = moment().toDate().getTime() + '';
  let signatures = await doRichSignMessage([timestamp], currentFaceTouceSessionId);
  if (!signatures) {
    await doStartFaceTouceSessionId(touchFaceIdMessage);
    if (!currentFaceTouceSessionId) {
      return null;
    }
    timestamp = moment().toDate().getTime() + '';
    signatures = await doRichSignMessage([timestamp], currentFaceTouceSessionId);
  }
  return { timestamp, signature: signatures[0] };
};

const doCreateSignatureData = async (touchFaceId) => {
  if (!touchFaceId) {
    touchFaceId = currentFaceTouceSessionId;
  }
  let timestamp = moment().toDate().getTime() + '';
  let signatures = await doRichSignMessage([timestamp], touchFaceId);
  return { timestamp, signature: signatures[0] };
};

// ================================================================================================
// ================================================================================================
// ================================================================================================

let CommonModel = {
  KEYS,
  doCheckPasscodeAndFaceTouchId,
  doSetLocalData,
  doGetLocalData,
  doStartFaceTouceSessionId,
  doCreateSignatureData,
  doTryCreateSignatureData,
  doTryRickSignMessage,
  setFaceTouceSessionId,
}

export {
  CommonModel
}
import moment from 'moment';

import { FaceTouchId, BitmarkSDK } from './adapters'
import { AsyncStorage } from 'react-native';
import { config } from './../configs';

const KEYS = {
  USER_INFORMATION: 'bitmark-app',

  //original data
  USER_DATA_LOCAL_BITMARKS: 'user-data:local-bitmarks',
  USER_DATA_TRACKING_BITMARKS: 'user-data:tracking-bitmarks',
  USER_DATA_DONATION_INFORMATION: 'user-data:donation-information',
  USER_DATA_IFTTT_INFORMATION: 'user-data:ifttt-information',
  USER_DATA_TRANSACTIONS: 'user-data:transactions',
  USER_DATA_TRANSFER_OFFERS: 'user-data:transfer-offers',

  // data can be change 
  USER_DATA_TRANSACTIONS_ACTION_REQUIRED: 'user-data:transaction-action-required',
  USER_DATA_TRANSACTIONS_HISTORY: 'user-data:transaction-history',
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
        // 
      }
      resolve(localData);
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

const doStartFaceTouchSessionId = async (touchFaceIdMessage) => {
  await doEndNewFaceTouchSessionId();
  if (!currentFaceTouchSessionId) {
    isRequestingSessionId = true;
    currentFaceTouchSessionId = await BitmarkSDK.requestSession(config.bitmark_network, touchFaceIdMessage);
  }
  isRequestingSessionId = false;
  return currentFaceTouchSessionId;
};
const setFaceTouchSessionId = (sessionId) => {
  currentFaceTouchSessionId = sessionId;
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

let CommonModel = {
  KEYS,
  doCheckPasscodeAndFaceTouchId,
  doSetLocalData,
  doGetLocalData,
  doStartFaceTouchSessionId,
  doCreateSignatureData,
  doTryCreateSignatureData,
  doTryRickSignMessage,
  setFaceTouchSessionId,
}

export {
  CommonModel
}
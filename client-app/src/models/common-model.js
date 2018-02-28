import moment from 'moment';

import { FaceTouchId, BitmarkSDK } from './adapters'
import { AsyncStorage } from 'react-native';
import { config } from './../configs';

const app_local_data_key = 'bitmark-app';

// ================================================================================================
// ================================================================================================
// private 
const doTyryRichSignMessage = (messages, sessionId) => {
  return new Promise((resolve) => {
    BitmarkSDK.rickySignMessage(messages, sessionId).then(resolve).catch(() => resolve());
  });
};

// ================================================================================================
const doSetLocalData = (localDataKey, data) => {
  localDataKey = localDataKey || app_local_data_key;
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
  localDataKey = localDataKey || app_local_data_key;
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
const doCheckFaceTouchId = async () => {
  return await FaceTouchId.isSupported();
}
// ================================================================================================
let currentFaceTouceSessionId = null;

const doEndNewFaceTouceSessionId = async () => {
  if (currentFaceTouceSessionId) {
    await BitmarkSDK.disposeSession(currentFaceTouceSessionId);
    currentFaceTouceSessionId = null;
  }
};

const doStartFaceTouceSessionId = async (touchFaceIdMessage) => {
  await doEndNewFaceTouceSessionId();
  if (!currentFaceTouceSessionId) {
    currentFaceTouceSessionId = await BitmarkSDK.requestSession(config.bitmark_network, touchFaceIdMessage);
  }
  return currentFaceTouceSessionId;
};
const setFaceTouceSessionId = (sessionId) => {
  currentFaceTouceSessionId = sessionId;
};

const doTryRickSignMessage = async (messages, touchFaceIdMessage) => {
  if (!currentFaceTouceSessionId) {
    await doStartFaceTouceSessionId(touchFaceIdMessage);
    if (!currentFaceTouceSessionId) {
      return null;
    }
  }
  let signatures = await doTyryRichSignMessage(messages, currentFaceTouceSessionId);
  if (!signatures) {
    await doStartFaceTouceSessionId(touchFaceIdMessage);
    if (!currentFaceTouceSessionId) {
      return null;
    }
    signatures = await doTyryRichSignMessage(messages, currentFaceTouceSessionId);
  }
  return signatures;
};

const doCreateSignatureData = async (touchFaceIdMessage) => {
  let timestamp = moment().toDate().getTime() + '';
  let signatures = await doTryRickSignMessage([timestamp], touchFaceIdMessage);
  if (!signatures) {
    return null;
  }
  return { timestamp, signature: signatures[0] };
};

// ================================================================================================
// ================================================================================================
// ================================================================================================

let CommonModel = {
  app_local_data_key,
  doCheckFaceTouchId,
  doSetLocalData,
  doGetLocalData,
  doStartFaceTouceSessionId,
  doEndNewFaceTouceSessionId,
  doCreateSignatureData,
  doTryRickSignMessage,
  setFaceTouceSessionId,
}

export {
  CommonModel
}
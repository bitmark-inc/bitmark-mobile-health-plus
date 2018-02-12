import { FaceTouchId, BitmarkSDK } from './adapters'
import { AsyncStorage } from 'react-native';
import { config } from './../configs';

const app_local_data_key = 'bitmark-app';


// ================================================================================================
const setLocalData = (localDataKey, data) => {
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
const getLocalData = (localDataKey) => {
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
        setLocalData(localDataKey, localData);
      }
      resolve(localData || {});
    });
  });
};
// ================================================================================================
const checkFaceTouchId = async () => {
  return await FaceTouchId.isSupported();
}
// ================================================================================================
let currentFaceTouceSessionId = null;

const endNewFaceTouceSessionId = async () => {
  if (currentFaceTouceSessionId) {
    await BitmarkSDK.disposeSession(currentFaceTouceSessionId);
    currentFaceTouceSessionId = null;
  }
};

const startFaceTouceSessionId = async () => {
  await endNewFaceTouceSessionId();
  if (!currentFaceTouceSessionId) {
    currentFaceTouceSessionId = await BitmarkSDK.requestSession(config.bitmark_network);
  }
  return currentFaceTouceSessionId;
};

// ================================================================================================
// ================================================================================================
// ================================================================================================

let CommonService = {
  app_local_data_key,
  checkFaceTouchId,
  setLocalData,
  getLocalData,
  startFaceTouceSessionId,
  endNewFaceTouceSessionId,
}

export {
  CommonService
}
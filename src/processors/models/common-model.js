import moment from 'moment';
import { AsyncStorage } from 'react-native';

import { FaceTouchId, BitmarkSDK } from './adapters'
import { config } from 'src/configs';

const KEYS = {
  APP_INFORMATION: 'app-information',

  USER_INFORMATION: 'user-information',
  //original data

  USER_DATA_COMMON: 'user-data:common',
  USER_DATA_BITMARK: 'user-data:bitmark',
};

// ================================================================================================
// ================================================================================================
// private
const doSignMessages = (messages) => {
  return new Promise((resolve) => {
    BitmarkSDK.signMessages(messages).then(resolve).catch(() => resolve());
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

const doCreateSignatureData = async () => {
  let timestamp = moment().toDate().getTime() + '';
  let signatures = await doSignMessages([timestamp]);
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
      console.log('doTrackEvent success :', { tags, fields, data });
      resolve(data);
    }).catch((error) => {
      resolve();
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
  doCreateSignatureData,
  doTrackEvent,
}

export {
  CommonModel
}
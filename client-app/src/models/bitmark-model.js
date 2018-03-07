import moment from 'moment';

import { config } from './../configs';
import { BitmarkSDK } from './adapters';

// ===================================================================================================================
// ===================================================================================================================
const doGet100Bitmarks = (accountNumber, lastOffset) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let bitmarkUrl = config.get_way_server_url +
      `/v1/bitmarks?owner=${accountNumber}&asset=true&pending=true&to=earlier` + (lastOffset ? `&at=${lastOffset}` : '');
    fetch(bitmarkUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error('doGetBitmarks error :' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const doGetAllBitmarks = (accountNumber) => {
  return new Promise((resolve, reject) => {
    let totalData;
    let tryMineBitmark = (lastOffset) => {
      doGet100Bitmarks(accountNumber, lastOffset).then(data => {
        if (!totalData) {
          totalData = data;
        } else {
          data.assets.forEach((item) => {
            let index = totalData.assets.findIndex(asset => asset.id === item.id);
            if (index < 0) {
              totalData.assets.push(item);
            }
          });
          totalData.bitmarks = totalData.bitmarks.concat(data.bitmarks);
        }
        if (data.bitmarks.length < 100) {
          return resolve(totalData);
        }
        data.bitmarks.forEach(bitmark => {
          if (!lastOffset || lastOffset > bitmark.offset) {
            lastOffset = bitmark.offset;
          }
        });
        tryMineBitmark(lastOffset);
      }).catch(reject);
    };
    tryMineBitmark();
  });
};

const doGetProvenance = (bitmark) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    fetch(config.get_way_server_url + `/v1/bitmarks/${bitmark.id}?provenance=true`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error('doGetProvenance error :' + JSON.stringify(data)));
      }
      let provenance = (data.bitmark && data.bitmark.provenance) ? data.bitmark.provenance : [];
      provenance.forEach(item => item.created_at = moment(item.created_at).format('YYYY MMM DD HH:mm:ss'));
      resolve(provenance);
    }).catch(reject);
  });
};

const doGetAssetInformation = (assetId) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    fetch(config.get_way_server_url + `/v1/assets/${assetId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      if (statusCode === 404) {
        return resolve();
      }
      if (statusCode >= 400) {
        return reject(new Error('getAssetInfo error :' + JSON.stringify(data)));
      }
      resolve(data.asset);
    }).catch(reject);
  });
};

const doPrepareAssetInfo = async (filePath) => {
  return await BitmarkSDK.getAssetInfo(filePath);
};

const doCheckMetadata = async (metadata) => {
  return await BitmarkSDK.validateMetadata(metadata);
};

const doIssueFile = async (touchFaceIdSession, filePath, assetName, metadata, quantity) => {
  let result = await BitmarkSDK.issueFile(touchFaceIdSession, filePath, assetName, metadata, quantity);
  return result;
};

const doGetTransactionInformation = (txid) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let bitmarkUrl = config.get_way_server_url +
      `/v1/txs/${txid}?pending=true`;
    fetch(bitmarkUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error('doGetBitmarkInformation error :' + JSON.stringify(data)));
      }
      resolve(data.tx);
    }).catch(reject);
  });
};

const doGetBitmarkInformation = (bitmarkId) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let bitmarkUrl = config.get_way_server_url +
      `/v1/bitmarks/${bitmarkId}?asset=true&pending=true&provenance=true`;
    fetch(bitmarkUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error('doGetBitmarkInformation error :' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

let BitmarkModel = {
  doGetAssetInformation,
  doGetAllBitmarks,
  doGetProvenance,
  doPrepareAssetInfo,
  doIssueFile,
  doCheckMetadata,
  doGetBitmarkInformation,
  doGetTransactionInformation,
};

export { BitmarkModel };
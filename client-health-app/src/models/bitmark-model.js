import { chunk } from 'lodash';

import { config } from './../configs';
import { BitmarkSDK } from './adapters';

// ===================================================================================================================
// ===================================================================================================================

const doGetList100Bitmarks = (bitmarkIds, external) => {
  let queryString = '';
  return new Promise((resolve, reject) => {
    if (bitmarkIds && bitmarkIds.length > 0) {
      bitmarkIds.forEach(bitmarkId => {
        queryString += queryString ? `&bitmark_ids=${bitmarkId}` : `?bitmark_ids=${bitmarkId}&pending=true`;
      });
      queryString += (external && external.includeAsset) ? '&asset=true' : '';
    }
    if (!queryString) {
      return resolve([]);
    }
    let statusCode;
    fetch(config.api_server_url + `/v1/bitmarks` + queryString, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    }).then((response) => {
      statusCode = response.status;
      if (statusCode < 400) {
        return response.json();
      }
      return response.text();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error('doGetList100Bitmarks error :' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const doGetListBitmarks = async (bitmarkIds, external) => {
  let groupListBitmarks = chunk(bitmarkIds, 100);
  let returnedData;
  for (let each100Bitmarks of groupListBitmarks) {
    let data = await doGetList100Bitmarks(each100Bitmarks, external);
    if (!returnedData) {
      returnedData = data;
    } else {
      returnedData.bitmarks = (returnedData.bitmarks || []).concat(data.bitmarks || []);
      if (external && external.includeAsset) {
        returnedData.assets = returnedData.assets || [];
        (data.assets || []).forEach(asset => {
          let exist = (returnedData.assets || []).findIndex(ea => ea.id == asset.id) >= 0;
          if (!exist) {
            returnedData.assets.push(asset);
          }
        });
      }
    }
  }
  return returnedData;
};

const doGetAssetInformation = (assetId) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    fetch(config.api_server_url + `/v1/assets/${assetId}`, {
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

const doGetAssetAccessibility = (assetId) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    fetch(config.api_server_url + `/v2/assets/${assetId}/info`, {
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
      resolve(data);
    }).catch(reject);
  });
};

const doGetAssetTextContent = (assetId) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    fetch(config.preview_asset_url + `/${assetId}`, {
      method: 'GET'
    }).then((response) => {
      statusCode = response.status;
      return response.text();
    }).then((data) => {
      if (statusCode === 404) {
        return resolve();
      }
      if (statusCode >= 400) {
        return reject(new Error('getAssetInfo error :' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const doGetAssetTextContentType = (assetId) => {
  return new Promise((resolve) => {
    fetch(config.preview_asset_url + `/${assetId}`, {
      method: 'HEAD'
    }).then((response) => {
      let contentType;
      let contentTypeHeader = response.headers.get('content-type');

      if (contentTypeHeader) {
        if (contentTypeHeader.startsWith('text/plain')) {
          contentType = 'text';
        } else if (contentTypeHeader.startsWith('image/')) {
          contentType = 'image';
        }
      }

      return resolve(contentType);
    }).catch(() => {
      resolve();
    });
  });
};

const doPrepareAssetInfo = async (filePath) => {
  return await BitmarkSDK.getAssetInfo(filePath);
};

const doCheckMetadata = async (metadata) => {
  return await BitmarkSDK.validateMetadata(metadata);
};

const doIssueFile = async (touchFaceIdSession, filePath, assetName, metadata, quantity, isPublicAsset) => {
  let result = await BitmarkSDK.issueFile(touchFaceIdSession, filePath, assetName, metadata, quantity, isPublicAsset);
  return result;
};

const doIssueThenTransferFile = async (touchFaceIdSession, filePath, assetName, metadata, receiver, extra) => {
  let result = await BitmarkSDK.issueThenTransferFile(touchFaceIdSession, filePath, assetName, metadata, receiver, extra);
  return result;
};


const doGet100Transactions = (accountNumber, offsetNumber) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let tempURL = config.api_server_url + `/v1/txs?owner=${accountNumber}&pending=true&to=later&sent=true&block=true`;
    tempURL += offsetNumber ? `&at=${offsetNumber}` : '';
    fetch(tempURL, {
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
        return reject(new Error('doGet100Transactions error :' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const doGetAllTransactions = async (accountNumber, lastOffset) => {
  let totalTxs;
  let canContinue = true;
  while (canContinue) {
    let data = await doGet100Transactions(accountNumber, lastOffset);
    data.txs.forEach(tx => {
      tx.block = data.blocks.find(block => block.number === tx.block_number);
    });
    if (!totalTxs) {
      totalTxs = data.txs;
    } else {
      totalTxs = totalTxs.concat(data.txs);
    }
    if (data.txs.length < 100) {
      canContinue = false;
      break;
    }
    data.txs.forEach(tx => {
      if (!lastOffset || lastOffset < tx.offset) {
        lastOffset = tx.offset;
      }
    });
  }
  return totalTxs;
};

const doGetTransactionDetail = (txid) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let tempURL = config.api_server_url + `/v1/txs/${txid}?pending=true&asset=true&block=true`;
    fetch(tempURL, {
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
        return reject(new Error('doGetTransactionDetail error :' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};


const doGetBitmarkInformation = (bitmarkId) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let bitmarkUrl = config.api_server_url +
      `/v1/bitmarks/${bitmarkId}?asset=true&pending=true&provenance=true`;
    console.log('bitmarkUrl :', bitmarkUrl);
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
        return reject(new Error(`doGetBitmarkInformation ${bitmarkId} error :` + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

let BitmarkModel = {
  doGetAssetInformation,
  doPrepareAssetInfo,
  doIssueFile,
  doIssueThenTransferFile,
  doCheckMetadata,
  doGetBitmarkInformation,
  doGetTransactionDetail,
  doGetAllTransactions,
  doGet100Transactions,
  doGetListBitmarks,
  doGetAssetAccessibility,
  doGetAssetTextContentType,
  doGetAssetTextContent,

};

export { BitmarkModel };
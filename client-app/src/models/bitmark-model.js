import moment from 'moment';

import { config } from './../configs';
import { BitmarkSDK } from './adapters';

// ===================================================================================================================
// ===================================================================================================================
const doGet100Bitmarks = (accountNumber, lastOffset) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let bitmarkUrl = config.api_server_url +
      `/v1/bitmarks?owner=${accountNumber}&asset=true&pending=true&to=later&sent=true` + (lastOffset ? `&at=${lastOffset}` : '');
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

const doGetAllBitmarks = async (accountNumber, lastOffset) => {
  let totalData;
  let canContinue = true;
  while (canContinue) {
    let data = await doGet100Bitmarks(accountNumber, lastOffset);
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
      canContinue = false;
      break;
    }
    data.bitmarks.forEach(bitmark => {
      if (!lastOffset || lastOffset < bitmark.offset) {
        lastOffset = bitmark.offset;
      }
    });
  }
  return totalData;
};

const getListBitmarks = (bitmarkIds) => {
  let queryString = '';
  return new Promise((resolve, reject) => {
    if (bitmarkIds && bitmarkIds.length > 0) {
      bitmarkIds.forEach(bitmarkId => {
        queryString += queryString ? `&bitmark_ids=${bitmarkId}` : `?bitmark_ids=${bitmarkId}`;
      });
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
        console.log('getListBitmarks data :', data);
        return reject(new Error('getListBitmarks error :' + JSON.stringify(data)));
      }
      resolve(data.bitmarks || []);
    }).catch(reject);
  });
};

const doGetProvenance = (bitmarkId) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    fetch(config.api_server_url + `/v1/bitmarks/${bitmarkId}?provenance=true&pending=true`, {
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
      let bitmark = data.bitmark;
      let provenance = (bitmark && bitmark.provenance) ? bitmark.provenance : [];
      provenance.forEach(item => item.created_at = moment(item.created_at).format('YYYY MMM DD HH:mm:ss'));
      bitmark.provenance = provenance;
      resolve({ bitmark, provenance });
    }).catch(reject);
  });
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

const doIssueThenTransferFile = async (touchFaceIdSession, filePath, assetName, metadata, receiver, extra) => {
  let result = await BitmarkSDK.issueThenTransferFile(touchFaceIdSession, filePath, assetName, metadata, receiver, extra);
  return result;
};


const get100Transactions = (accountNumber, offsetNumber) => {
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
        return reject(new Error('get100Transactions error :' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const getAllTransactions = async (accountNumber, lastOffset) => {
  let totalTxs;
  let canContinue = true;
  while (canContinue) {
    let data = await get100Transactions(accountNumber, lastOffset);
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

const getTransactionDetail = (txid) => {
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
        return reject(new Error('getTransactionDetail error :' + JSON.stringify(data)));
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

const doAddTrackinBitmark = async (bitmarkAccount, timestamp, signature, bitmark_id, tx_id, status) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let bitmarkUrl = config.mobile_server_url + `/api/tracking_bitmarks`;
    fetch(bitmarkUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        timestamp,
        signature,
        requester: bitmarkAccount,
      },
      body: JSON.stringify({
        bitmark_id, tx_id, status
      })
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error(`doAddTrackinBitmark error :` + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const doStopTrackingBitmark = async (bitmarkAccount, timestamp, signature, bitmark_id) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let bitmarkUrl = config.mobile_server_url + `/api/tracking_bitmarks/${bitmark_id}`;
    fetch(bitmarkUrl, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        timestamp,
        signature,
        requester: bitmarkAccount,
      },
    }).then((response) => {
      statusCode = response.status;
      if (statusCode < 400) {
        return response.json();
      }
      return response.text();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error(`doStopTrackingBitmark error :` + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const doGetAllTrackingBitmark = async (bitmarkAccount) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let bitmarkUrl = config.mobile_server_url + `/api/tracking_bitmarks`;
    fetch(bitmarkUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        requester: bitmarkAccount,
      },
    }).then((response) => {
      statusCode = response.status;
      if (statusCode < 400) {
        return response.json();
      }
      return response.text();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error(`doGetAllTrackingBitmark error :` + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const doConfirmWebAccount = async (bitmarkAccount, code, timestamp, signature) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let bitmarkUrl = config.web_account_server_url + `/s/api/mobile/confirmations`;
    fetch(bitmarkUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        requester: bitmarkAccount,
        timestamp,
        signature,
      },
      body: JSON.stringify({ code })
    }).then((response) => {
      statusCode = response.status;
      if (statusCode < 400) {
        return response.json();
      }
      return response.text();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error(`doGetAllTrackingBitmark error :` + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
}

let BitmarkModel = {
  doGetAssetInformation,
  doGetAllBitmarks,
  doGetProvenance,
  doPrepareAssetInfo,
  doIssueFile,
  doIssueThenTransferFile,
  doCheckMetadata,
  doGetBitmarkInformation,
  getTransactionDetail,
  getAllTransactions,
  getListBitmarks,
  doGetAssetAccessibility,

  doAddTrackinBitmark,
  doStopTrackingBitmark,
  doGetAllTrackingBitmark,
  doConfirmWebAccount,
};

export { BitmarkModel };
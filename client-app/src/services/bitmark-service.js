import moment from 'moment';

import { config } from './../configs';
import { BitmarkSDK } from './adapters';
import { CommonService } from './common-service';

// ===================================================================================================================
// ===================================================================================================================
const withdrawFirstSignature = (localBitmarkAccount, bitmarkIds) => {
  return new Promise((resolve, reject) => {
    let withdrawURL = config.trade_server_url + `/bitmarks/withdraw_request`;
    let header = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      requester: 'user/' + localBitmarkAccount,
    };
    let data = {
      bitmarks: bitmarkIds
    };
    let statusCode;
    fetch(withdrawURL, {
      method: 'POST',
      headers: header,
      body: JSON.stringify(data)
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      if (statusCode !== 200) {
        return reject(new Error('withdrawFirstSignature error :' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const withdrawSecondSignature = (localBitmarkAccount, timestamp, signature, signedTransfers) => {
  return new Promise((resolve, reject) => {
    let withdrawURL = config.trade_server_url + `/bitmarks/withdraw`;
    let header = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      requester: 'user/' + localBitmarkAccount,
      timestamp,
      signature,
    };
    let data = { items: signedTransfers };
    console.log('withdrawSecondSignature data :', JSON.stringify(data));
    let statusCode = null;
    fetch(withdrawURL, {
      method: 'POST',
      headers: header,
      body: JSON.stringify(data)
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      if (statusCode !== 200) {
        return reject(new Error('withdrawSecondSignature error :' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const deposit = (localBitmarkAccount, timestamp, signature, firstSignatures) => {
  return new Promise((resolve, reject) => {
    let withdrawURL = config.trade_server_url + `/bitmarks/deposit`;
    let header = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      requester: 'user/' + localBitmarkAccount,
      signature,
      timestamp,
    };
    let data = { items: firstSignatures };
    console.log('deposit data :', JSON.stringify(data));
    let statusCode = null;
    fetch(withdrawURL, {
      method: 'POST',
      headers: header,
      body: JSON.stringify(data)
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      if (statusCode !== 200) {
        return reject(new Error('transferUse2Signature error :' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

// ===================================================================================================================
// ===================================================================================================================
const getBitmarks = (loaclBitmarkAccountNumber) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    fetch(config.get_way_server_url + `/v1/bitmarks?owner=${loaclBitmarkAccountNumber}&asset=true&pending=true`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((localBitmarks) => {
      if (statusCode !== 200) {
        return reject(new Error('getBitmarks error :' + JSON.stringify(localBitmarks)));
      }
      let localAssets = [];
      if (localBitmarks && localBitmarks.bitmarks && localBitmarks.assets) {
        localBitmarks.assets.forEach((asset) => {
          asset.asset_id = asset.id;
          localBitmarks.bitmarks.forEach((bitmark) => {
            if (!bitmark.bitmark_id) {
              bitmark.bitmark_id = bitmark.id;
            }
            if (bitmark.asset_id === asset.id) {
              if (!asset.bitmarks) {
                asset.bitmarks = [];
                asset.totalPending = 0;
              }
              asset.metadata = (asset.metadata && (typeof asset.metadata === 'string')) ? JSON.parse(asset.metadata) : asset.metadata;
              asset.created_at = moment(asset.created_at).format('YYYY MMM DD HH:mm:ss')
              asset.totalPending += (bitmark.status === 'pending') ? 1 : 0;
              asset.bitmarks.push(bitmark);
            }
          });
          localAssets.push(asset);
        });
      }
      resolve(localAssets);
    }).catch(reject);
  });
};

const getProvenance = (bitmark) => {
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
      if (statusCode !== 200) {
        return reject(new Error('getProvenance error :' + JSON.stringify(data)));
      }
      let provenance = (data.bitmark && data.bitmark.provenance) ? data.bitmark.provenance : [];
      provenance.forEach(item => item.created_at = moment(item.created_at).format('YYYY MMM DD HH:mm:ss'));
      resolve(provenance);
    }).catch(reject);
  });
}

const doWithdrawBitmarks = async (bitmarkIds, localBitmarkAccount) => {
  let sessionId = await CommonService.startFaceTouceSessionId();
  let firstSignatureData = await withdrawFirstSignature(localBitmarkAccount, bitmarkIds);
  console.log('firstSignatureData :', firstSignatureData);
  let signedTransfers = [];
  for (let item of firstSignatureData.items) {
    signedTransfers.push({
      bitmark_id: item.bitmark_id,
      signed_transfer: {
        link: item.half_signed_transfer.link,
        owner: item.half_signed_transfer.owner,
        signature: item.half_signed_transfer.signature,
        countersignature: await BitmarkSDK.sign2ndForTransfer(sessionId, item.half_signed_transfer.link, item.half_signed_transfer.signature)
      }
    });
  }

  console.log('signedTransfers :', signedTransfers);
  let timestamp = moment().toDate().getTime() + '';
  let timestampSignatures = await BitmarkSDK.rickySignMessage([timestamp], sessionId);
  await CommonService.endNewFaceTouceSessionId();
  return withdrawSecondSignature(localBitmarkAccount, timestamp, timestampSignatures, signedTransfers);
};

const doDepositBitmarks = async (bitmarkIds, localBitmarkAccount, marketBitmarkAccount) => {
  let sessionId = await CommonService.startFaceTouceSessionId();
  let timestamp = moment().toDate().getTime() + '';
  let signatures = await BitmarkSDK.rickySignMessage([timestamp], sessionId);
  let firstSignatures = {};
  for (let bitmarkId of bitmarkIds) {
    let firstSignatureData = await BitmarkSDK.sign1stForTransfer(sessionId, bitmarkId, marketBitmarkAccount);
    firstSignatures[bitmarkId] = {
      link: firstSignatureData.txid,
      owner: localBitmarkAccount,
      signature: firstSignatureData.signature,
    };
  }
  await CommonService.endNewFaceTouceSessionId();
  return await deposit(localBitmarkAccount, timestamp, signatures, firstSignatures);
};

let BitmarkService = {
  getBitmarks,
  getProvenance,
  doWithdrawBitmarks,
  doDepositBitmarks,
};

export { BitmarkService };
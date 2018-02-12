import moment from 'moment';

import { config } from './../configs';
import { BitmarkSDK } from './adapters';
import { CommonService } from './common-service';

// ===================================================================================================================
// ===================================================================================================================
const withdrawFirstSignature = (localBitmarkAccount, timestamp, signature, bitmarkIds) => {
  return new Promise((resolve, reject) => {
    let withdrawURL = config.trade_server_url + `/bitmarks/withdraw`;
    let header = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      requester: 'user/' + localBitmarkAccount,
      signature: signature,
      timestamp: timestamp,
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
        return reject(new Error('transferUse2Signature error :' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const transferUse2Signature = (link, owner, signature, countersignature) => {
  return new Promise((resolve, reject) => {
    let withdrawURL = config.get_way_server_url + `/v1/transfer`;
    let header = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    let data = { link, owner, signature, countersignature, };
    console.log('transferUse2Signature data :', JSON.stringify(data));
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
    fetch(config.get_way_server_url + `/v1/bitmarks?owner=${loaclBitmarkAccountNumber}&asset=true`, {
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
        return reject(new Error('transferUse2Signature error :' + JSON.stringify(localBitmarks)));
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
        return reject(new Error('transferUse2Signature error :' + JSON.stringify(data)));
      }
      let provenance = (data.bitmark && data.bitmark.provenance) ? data.bitmark.provenance : [];
      provenance.forEach(item => item.created_at = moment(item.created_at).format('YYYY MMM DD HH:mm:ss'));
      resolve(provenance);
    }).catch(reject);
  });
}

const doWithdrawBitmarks = async (bitmarkIds, localBitmarkAccount) => {

  let sessionId = await CommonService.startFaceTouceSessionId();
  let timestamp = moment().toDate().getTime() + '';
  let signatures = await BitmarkSDK.rickySignMessage([timestamp], sessionId);
  let firstSignatureData = await withdrawFirstSignature(localBitmarkAccount, timestamp, signatures[0], bitmarkIds);
  let secondSignature = await BitmarkSDK.sign2ndForTransfer(sessionId, firstSignatureData.signed_transfers[0].link, firstSignatureData.signed_transfers[0].signature);
  console.log('firstSignatureData: ', firstSignatureData);
  console.log('secondSignature: ', secondSignature);
  return transferUse2Signature(firstSignatureData.signed_transfers[0].link, firstSignatureData.signed_transfers[0].owner, firstSignatureData.signed_transfers[0].signature, secondSignature);
};

let BitmarkService = {
  getBitmarks,
  getProvenance,
  doWithdrawBitmarks,
};

export { BitmarkService };
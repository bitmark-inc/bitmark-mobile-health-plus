import moment from 'moment';

import { config } from './../configs';

// ===================================================================================================================
// ===================================================================================================================

// ===================================================================================================================
// ===================================================================================================================
const getBitmarks = (loaclBitmarkAccountNumber) => {
  return new Promise((resolve, reject) => {
    fetch(config.get_way_server_url + `/v1/bitmarks?owner=${loaclBitmarkAccountNumber}&asset=true`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    }).then((response) => response.json()).then((localBitmarks) => {
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
    fetch(config.get_way_server_url + `/v1/bitmarks/${bitmark.id}?provenance=true`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    }).then((response) => response.json()).then((data) => {
      let provenance = (data.bitmark && data.bitmark.provenance) ? data.bitmark.provenance : [];
      provenance.forEach(item => item.created_at = moment(item.created_at).format('YYYY MMM DD HH:mm:ss'));
      resolve(provenance);
    }).catch(reject);
  });
}

const withdraw = (localBitmarkAccount, timestamp, signature, bitmarkIds) => {
  return new Promise((resolve, reject) => {
    let withdrawURL = config.trade_server_url + `/bitmarks/withdraw`;
    console.log('withdrawURL :', withdrawURL);
    fetch(withdrawURL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        requester: 'user/' + localBitmarkAccount,
        signature: signature,
        timestamp: timestamp
      },
      body: JSON.stringify({
        bitmarks: bitmarkIds
      })
    }).then((response) => response.json()).then((data) => {
      resolve(data);
    }).catch(reject);
  });
};

let BitmarkService = {
  getBitmarks,
  getProvenance,
  withdraw,
};

export { BitmarkService };
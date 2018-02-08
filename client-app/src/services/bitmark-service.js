import moment from 'moment';

import { config } from './../configs';

// ===================================================================================================================
// ===================================================================================================================

// ===================================================================================================================
// ===================================================================================================================
const getBitamrks = (loaclBitmarkAccountNumber) => {
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
          localBitmarks.bitmarks.forEach((bitmark) => {
            if (bitmark.asset_id === asset.id) {
              if (!asset.bitmarks) {
                asset.bitmarks = [];
                asset.totalPending = 0;
              }
              asset.metadata = (asset.metadata && (typeof asset.metadata === 'string')) ? JSON.parse(asset.metadata) : asset.metadata;
              asset.metadata['test'] = 'test';
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
      console.log('getProvenance :', data);
      let provenance = (data.bitmark && data.bitmark.provenance) ? data.bitmark.provenance : [];
      provenance.forEach(item => item.created_at = moment(item.created_at).format('YYYY MMM DD HH:mm:ss'));
      resolve(provenance);
    }).catch(reject);
  });
}

let BitmarkService = {
  getBitamrks,
  getProvenance,
};

export { BitmarkService };
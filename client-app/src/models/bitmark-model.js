import moment from 'moment';

import { config } from './../configs';
import { BitmarkSDK } from './adapters';
import { sortList } from './../utils';

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

const doGetBitmarks = async (accountNumber) => {
  let data = await doGetAllBitmarks(accountNumber);
  let localAssets = [];
  if (data && data.bitmarks && data.assets) {
    data.assets.forEach((asset) => {
      asset.asset_id = asset.id;
      data.bitmarks.forEach((bitmark) => {
        bitmark.created_at = moment(bitmark.created_at).format('YYYY MMM DD HH:mm:ss')
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
          if (asset.totalPending === 0 && bitmark.status !== 'pending') {
            let bitmarkCreatedAt = moment(bitmark.created_at).toDate();
            asset.newest_created_at = !asset.newest_created_at ? bitmarkCreatedAt :
              (asset.newest_created_at.getTime() < bitmarkCreatedAt.getTime() ? bitmarkCreatedAt : asset.newest_created_at);
          } else {
            asset.newest_created_at = null;
          }
          asset.bitmarks.push(bitmark);
        }
      });
      asset.bitmarks = sortList(asset.bitmarks, ((a, b) => {
        if (!a || !a.created_at || a.status === 'pending') { return -1; }
        if (!b || !b.created_at || b.status === 'pending') { return -1; }
        return moment(a.created_at).toDate().getTime() < moment(b.created_at).toDate().getTime();
      }));
      localAssets.push(asset);
    });
  }
  localAssets = sortList(localAssets, ((a, b) => {
    if (!a || !a.newest_created_at || a.totalPending > 0) { return 1; }
    if (!b || !b.newest_created_at || b.totalPending > 0) { return 1; }
    return moment(a.newest_created_at).toDate().getTime() < moment(b.newest_created_at).toDate().getTime();
  }));
  return localAssets;
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

let BitmarkModel = {
  doGetAssetInformation,
  doGetBitmarks,
  doGetProvenance,
  doPrepareAssetInfo,
  doIssueFile,
  doCheckMetadata,
};

export { BitmarkModel };
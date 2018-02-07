import moment from 'moment';

import { config } from './../configs';

// ===================================================================================================================
// ===================================================================================================================
const convertDataFromMarket = (market, marketBitmarks) => {
  let marketAssets = [];
  if (market === config.markets.totemic) {
    if (marketBitmarks && marketBitmarks.editions && marketBitmarks.cards) {
      marketBitmarks.cards.forEach((asset) => {
        asset.market = market;
        marketBitmarks.editions.forEach((bitmark) => {
          bitmark.market = market;
          if (bitmark.card_id === asset.id) {
            if (!asset.bitmarks) {
              asset.bitmarks = [];
              asset.totalPending = 0;
            }
            asset.metadata = (asset.metadata && (typeof asset.metadata === 'string')) ? JSON.parse(asset.metadata) : asset.metadata;
            asset.metadata['test'] = 'test';
            asset.totalPending += (bitmark.status === 'pending') ? 1 : 0;
            asset.created_at = moment(asset.created_at).format('YYYY MMM DD HH:mm:ss');
            let issuer = (marketBitmarks.users || []).find((user) => user.id === asset.creator_id);
            asset.issuer = issuer ? issuer.account_number : null;
            asset.bitmarks.push(bitmark);
          }
        });
        marketAssets.push(asset);
      });
    }
  }
  return marketAssets;
};

const getProvenanceFromMarket = (bitmark) => {
  return new Promise((resolve, reject) => {
    if (!bitmark.market || !config.market_urls[bitmark.market]) {
      return reject(new Error('Invalid market!'));
    }
    let marketServerUrl = config.market_urls[bitmark.market];
    let marketBitmarkUrl = marketServerUrl +
      `/s/api/editions/${bitmark.id}?include_provenance=true`;
    fetch(marketBitmarkUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    }).then((response) => response.json()).then((data) => {
      let provenance = data.provenance || [];
      provenance.forEach(item => item.created_at = moment(item.created_at).format('YYYY MMM DD HH:mm:ss'));
      resolve(provenance);
    }).catch(reject);
  });
};

const getLocalProvenance = (bitmark) => {
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
// ===================================================================================================================
// ===================================================================================================================
const getMarketBitmarks = (market, userId) => {
  return new Promise((resolve, reject) => {
    if (!market || !config.market_urls[market]) {
      return reject(new Error('Invalid market!'));
    }
    let marketServerUrl = config.market_urls[market];
    let marketBitmarkUrl = marketServerUrl +
      `/s/api/editions?owner=${userId}&include_card=true&include_user=true`;
    fetch(marketBitmarkUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    }).then((response) => response.json()).then((data) => {
      resolve(convertDataFromMarket(market, data || {}));
    }).catch(reject);
  });
};

const getLocalBitamrks = (loaclBitmarkAccountNumber) => {
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
  if (bitmark.market) {
    return getProvenanceFromMarket(bitmark);
  } else {
    return getLocalProvenance();
  }
};

let BitmarkService = {
  getMarketBitmarks,
  getLocalBitamrks,
  getProvenance,
};

export { BitmarkService };
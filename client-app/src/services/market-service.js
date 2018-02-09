import { config } from './../configs';
import moment from 'moment';

// ===================================================================================================================
// ===================================================================================================================
const convertDataFromMarket = (market, marketBitmarks) => {
  let marketAssets = [];
  if (market === config.markets.totemic.name) {
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

// ===================================================================================================================
// ===================================================================================================================
const getListingUrl = (bitmark) => {
  if (bitmark && bitmark.market && bitmark.market === config.markets.totemic.name) {
    return config.market_urls.totemic + `/edition/${bitmark.id}`;
  }
  return '';
};

const getBalancUrl = (market) => {
  if (market === config.markets.totemic.name) {
    return config.market_urls.totemic + `/account-balance`;
  }
  return '';
};

const getBitmarks = (market, userId) => {
  return new Promise((resolve, reject) => {
    if (!market || !config.market_urls[market]) {
      return reject(new Error('Invalid market!'));
    }
    let marketServerUrl = config.market_urls[market];
    let marketBitmarkUrl = marketServerUrl +
      `/s/api/editions?owner=${userId}&include_card=true&include_user=true&include_order=true`;
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

const getProvenance = (bitmark) => {
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

let MarketService = {
  getListingUrl,
  getBalancUrl,
  getBitmarks,
  getProvenance,
}

export {
  MarketService
}
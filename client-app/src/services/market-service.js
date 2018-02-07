import { config } from './../configs';

const getListingUrl = (bitmark) => {
  if (bitmark && bitmark.market && bitmark.market === config.markets.totemic) {
    return config.market_urls.totemic + `/edition/${bitmark.id}`;
  }
  return '';
};

const getBalancUrl = (market) => {
  if (market === config.markets.totemic) {
    return config.market_urls.totemic + `/account-balance`;
  }
  return '';
};

let MarketService = {
  getListingUrl,
  getBalancUrl
}

export {
  MarketService
}
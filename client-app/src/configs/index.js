import { iosConfig, iosConstant } from './ios/ios.config';
import { androidConfig, androidConstant } from './android/android.config';

let NETWORKS = {
  devnet: 'devnet',
  testnet: 'testnet',
  livenet: 'livenet',
}
let config = {
  network: NETWORKS.testnet,
  // network: NETWORKS.devnet,

  NETWORKS,
  bitmark_network: NETWORKS.testnet,
  appLink: 'https://itunes.apple.com/us/app/bitmark/id1213686437?ls=1&mt=8',
  api_server_url: 'https://api.test.bitmark.com',
  preive_asset_url: 'https://preview.assets.test.bitmark.com',
  registry_server_url: 'https://registry.test.bitmark.com',
  trade_server_url: 'https://trade.devel.bitmark.com',
  donation_server_url: 'http://localhost:9001',
};

if (config.network === NETWORKS.testnet) {
  config.trade_server_url = 'https://trade.test.bitmark.com';
  //TODO
  // config.market_urls.totemic = 'https://totemic.test.bitmark.com';
  // config.donation_server_url = 'http://donation.test.bitmark.com';
} else if (config.network === NETWORKS.livenet) {
  config.api_server_url = 'https://api.bitmark.com';
  config.preive_asset_url = 'https://preview.assets.bitmark.com';
  config.registry_server_url = 'https://registry.bitmark.com';
  config.bitmark_network = NETWORKS.livenet;

  config.trade_server_url = 'https://trade.bitmark.com';
  // config.market_urls.totemic = 'https://totemic.bitmark.com';
}

let ios = {
  config: iosConfig,
  constant: iosConstant,
};

let android = {
  config: androidConfig,
  constant: androidConstant,
};

export { config, ios, android };
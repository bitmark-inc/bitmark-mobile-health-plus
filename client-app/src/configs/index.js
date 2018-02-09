import { Platform } from 'react-native';

import { iosConfig, iosConstant } from './ios/ios.config';
import { androidConfig, androidConstant } from './android/android.config';

let NETWORKS = {
  devnet: 'devnet',
  testnet: 'testnet',
  livenet: 'livenet',
}
let config = {
  NETWORKS,
  platform: Platform.OS,
  // network: NETWORKS.testnet,
  network: NETWORKS.devnet,
  get_way_server_url: 'https://api.test.bitmark.com',
  preive_asset_url: 'https://preview.assets.test.bitmark.com',
  registry_server_url: 'https://registry.test.bitmark.com',
  trade_server_url: 'http://trade-ex.cluster.devel.bitmark.com:30095',
  market_urls: {
    totemic: '',
  },
  markets: {
    totemic: {
      name: 'totemic',
      sourceIcon: require('./../../assets/imgs/totemic-market.png'),
    }
  }
};

// local
config.market_urls.totemic = 'http://192.168.0.100:8088';

if (config.network === NETWORKS.testnet) {
  config.market_urls.totemic = 'https://totemic.test.bitmark.com';
  config.trade_server_url = 'http://trade-ex.cluster.test.bitmark.com:30095';
} else if (config.network === NETWORKS.livenet) {
  config.get_way_server_url = 'https://api.bitmark.com';
  config.preive_asset_url = 'https://preview.assets.bitmark.com';
  config.registry_server_url = 'https://registry.bitmark.com';
  //TODO
  config.trade_server_url = '';
  config.market_urls.totemic = '';
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
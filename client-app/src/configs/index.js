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
  network: NETWORKS.testnet,
  storage_server_url: '',
  get_way_server_url: '',
  preive_asset_url: '',
  totemic_server_url: '',
};

config.storage_server_url = 'https://storage.devel.bitmark.com';
config.get_way_server_url = 'https://api.devel.bitmark.com';
config.preive_asset_url = 'https://preview.assets.test.bitmark.com';
config.totemic_server_url = 'http://192.168.0.101:8088';

if (config.network === NETWORKS.testnet) {
  config.storage_server_url = 'https://assets.test.bitmark.com';
  config.get_way_server_url = 'https://api.test.bitmark.com';
  config.preive_asset_url = 'https://preview.assets.test.bitmark.com';
  config.totemic_server_url = 'https://totemic.test.bitmark.com';
} else if (config.network === NETWORKS.livenet) {
  config.storage_server_url = 'https://assets.bitmark.com';
  config.get_way_server_url = 'https://api.bitmark.com';
  config.preive_asset_url = 'https://preview.assets.bitmark.com';
  //TODO
  config.totemic_server_url = '';
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
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
  network: NETWORKS.devnet,
};

config.storage_server_url = 'https://storage.devel.bitmark.com';
config.get_way_server_url = 'https://api.devel.bitmark.com';

if (config.network === NETWORKS.testnet) {
  config.storage_server_url = 'https://assets.test.bitmark.com';
  config.get_way_server_url = 'https://api.test.bitmark.com';
} else if (config.network === NETWORKS.livenet) {
  config.storage_server_url = 'https://assets.bitmark.com';
  config.get_way_server_url = 'https://api.bitmark.com';
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
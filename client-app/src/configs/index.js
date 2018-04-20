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
  donation_server_url: 'http://192.168.0.202:9001',
  mobile_server_url: 'https://bm.devel.bitmark.com',
  ifttt_server_url: 'https://channel.devel.bitmark.com:8090',
  ifttt_invite_url: 'https://ifttt.com/features/redeem?code=10403-fa99108249f426f459a2e1033ddfbbb5',
  ifttt_connect_url: 'https://ifttt.com/features/redeem?code=10403-fa99108249f426f459a2e1033ddfbbb5',
};

if (config.network === NETWORKS.testnet) {
  config.trade_server_url = 'https://trade.test.bitmark.com';
  config.donation_server_url = 'https://data-donation.test.bitmark.com';
  config.mobile_server_url = 'https://bm.test.bitmark.com';
  config.ifttt_server_url = 'https://channel.test.bitmark.com:8090';
  config.ifttt_server_url = 'https://ifttt.com/features/redeem?code=10518-3f2950b543e7a5a2dc307de0c05775e4';
} else if (config.network === NETWORKS.livenet) {
  config.bitmark_network = NETWORKS.livenet;
  config.api_server_url = 'https://api.bitmark.com';
  config.preive_asset_url = 'https://preview.assets.bitmark.com';
  config.registry_server_url = 'https://registry.bitmark.com';
  config.trade_server_url = 'https://trade.bitmark.com';
  config.mobile_server_url = 'https://bm.bitmark.com';
  config.donation_server_url = 'https://data-donation.bitmark.com';
  config.ifttt_server_url = 'https://when.live.bitmark.com:8090';
  config.ifttt_server_url = 'https://ifttt.com/features/redeem?code=9187-5ba0e766190b2d174a5a3708fe2002ae';
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

// ┌────────────┬──────────────────────────────────────────────────────────────────┐
// │ Name       │ Deployment Key                                                   │
// ├────────────┼──────────────────────────────────────────────────────────────────┤
// │ Production │ ZcZy_ZeCnqCYnzaFGb4ZmljBQHJc5247aad0-6cc3-4dd7-b247-c76a433163da │
// ├────────────┼──────────────────────────────────────────────────────────────────┤
// │ Staging    │ H0VznPOIIkUc31GdXzWi5vSAifvk5247aad0-6cc3-4dd7-b247-c76a433163da │
// └────────────┴──────────────────────────────────────────────────────────────────┘
// code-push release-react Bitmark ios -m --description "update code" --targetBinaryVersion "~1.1.1"
// 
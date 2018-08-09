import DeviceInfo from 'react-native-device-info';
import { iosConfig, iosConstant } from './ios/ios.config';
import { androidConfig, androidConstant } from './android/android.config';

let NETWORKS = {
  devnet: 'devnet',
  testnet: 'testnet',
  livenet: 'livenet',
};

let network = NETWORKS.livenet;
network = DeviceInfo.getBundleId() === 'com.bitmark.health.inhouse' ? NETWORKS.testnet : network;

let config = {
  network,

  NETWORKS,
  bitmark_network: NETWORKS.testnet,
  appLink: 'https://itunes.apple.com/us/app/bitmark/id1213686437?ls=1&mt=8',
  api_server_url: 'https://api.test.bitmark.com',
  registry_server_url: 'https://registry.test.bitmark.com',
  donation_server_url: 'http://192.168.0.202:9001',
  mobile_server_url: 'https://bm.devel.bitmark.com',
  preview_asset_url: 'https://preview.test.bitmarkaccountassets.com',
  bitmark_web_site: 'https://website.test.bitmark.com',
  needResetLocalData: 1531973005311,
};

if (config.network === NETWORKS.testnet) {
  config.donation_server_url = 'https://data-donation.test.bitmark.com';
  // config.donation_server_url = 'http://192.168.0.202:9001';
  config.mobile_server_url = 'https://bm.test.bitmark.com';
  config.preview_asset_url = "https://preview.test.bitmarkaccountassets.com";
} else if (config.network === NETWORKS.livenet) {
  config.bitmark_network = NETWORKS.livenet;
  config.api_server_url = 'https://api.bitmark.com';
  config.registry_server_url = 'https://registry.bitmark.com';
  config.mobile_server_url = 'https://bm.bitmark.com';
  config.donation_server_url = 'https://data-donation.bitmark.com';
  config.preview_asset_url = "https://preview.bitmarkaccountassets.com";
  config.bitmark_web_site = 'https://bitmark.com';
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
// │ Production │ l6x1zspaECZPMjvSJ3Fw3TTeYiG85247aad0-6cc3-4dd7-b247-c76a433163da │
// ├────────────┼──────────────────────────────────────────────────────────────────┤
// │ Staging    │ DEz_j2LLFeBsXcYaTsKtSpk0kgYa5247aad0-6cc3-4dd7-b247-c76a433163da │
// └────────────┴──────────────────────────────────────────────────────────────────┘
// document
// https://microsoft.github.io/code-push/docs/cli.html#link-6

// code-push app add BitmarkHealth ios react-native


// testnet
// code-push release-react 'BitmarkHealth' ios --pre "Bitmark Health dev" --mandatory true  --sourcemapOutput "source-map-tool/source-map/test/main.jsbundle_1.0.map"
// code-push release-react 'BitmarkHealth' ios --pre "Bitmark Health dev" -m --description "update code" --sourcemapOutput "source-map-tool/source-map/test/main.jsbundle_1.0.0.map" [--targetBinaryVersion "~1.0.0"]

// livetnet
// code-push release-react 'BitmarkHealth' ios -d Production --mandatory true --sourcemapOutput "source-map-tool/source-map/live/main.jsbundle_1.0.0.map"
// code-push release-react 'BitmarkHealth' ios -d Production -m --description "update code" --sourcemapOutput "source-map-tool/source-map/live/main.jsbundle_1.0.0.map" [--targetBinaryVersion "~1.0.0"]


// react-native run-ios --device "Bitmark’s iPhone" --scheme 'Bitmark Health dev'
// react-native run-ios --device "iPhone 5 testing" --scheme 'Bitmark Health dev'

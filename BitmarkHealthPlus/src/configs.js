import { Dimensions } from 'react-native';
import DeviceInfo from 'react-native-device-info';
let NETWORKS = {
  devnet: 'devnet',
  testnet: 'testnet',
  livenet: 'livenet',
};

console.log('DeviceInfo :', DeviceInfo);
console.log('DeviceInfo getBundleId:', DeviceInfo.getBundleId());

let network = NETWORKS.livenet;
network = DeviceInfo.getBundleId() === 'com.bitmark.healthplus.inhouse' ? NETWORKS.testnet : network;

const currentSize = Dimensions.get('window');
const isIPhoneX = (currentSize.height === 812);

let config = {
  isIPhoneX,
  network,

  NETWORKS,
  bitmark_network: NETWORKS.testnet,
  appLink: 'https://itunes.apple.com/us/app/bitmark-health/id1428203492?ls=1&mt=8',
  api_server_url: 'https://api.test.bitmark.com',
  registry_server_url: 'https://registry.test.bitmark.com',
  mobile_server_url: 'https://bm.devel.bitmark.com',
  preview_asset_url: 'https://preview.test.bitmarkaccountassets.com',
  bitmark_web_site: 'https://bitmark.com',
  needResetLocalData: 1536550860837,
};

if (config.network === NETWORKS.testnet) {
  config.mobile_server_url = 'https://bm.test.bitmark.com';
  config.preview_asset_url = "https://preview.test.bitmarkaccountassets.com";
} else if (config.network === NETWORKS.livenet) {
  config.bitmark_network = NETWORKS.livenet;
  config.api_server_url = 'https://api.bitmark.com';
  config.registry_server_url = 'https://registry.bitmark.com';
  config.mobile_server_url = 'https://bm.bitmark.com';
  config.preview_asset_url = "https://preview.bitmarkaccountassets.com";
  config.bitmark_web_site = 'https://bitmark.com';
}
export { config, };

// ┌────────────┬──────────────────────────────────────────────────────────────────┐
// │ Name       │ Deployment Key                                                   │
// ├────────────┼──────────────────────────────────────────────────────────────────┤
// │ Production │ 4EFxSvLXVfsEWrPsNbwVFUqiSiPD5247aad0-6cc3-4dd7-b247-c76a433163da │
// ├────────────┼──────────────────────────────────────────────────────────────────┤
// │ Staging    │ mF45FYoNvB30ZvxkhJNjdbfjWQD45247aad0-6cc3-4dd7-b247-c76a433163da │
// └────────────┴──────────────────────────────────────────────────────────────────┘
// document
// https://microsoft.github.io/code-push/docs/cli.html#link-6

// code-push app add BitmarkHealthPlus ios react-native


// testnet
// code-push release-react 'BitmarkHealthPlus' ios --pre "Bitmark Health dev" --mandatory true  --sourcemapOutput "source-map-tool/source-map/test/main.jsbundle_1.1.1.map" --targetBinaryVersion "1.1.1"
// code-push release-react 'BitmarkHealthPlus' ios --pre "Bitmark Health dev" -m --description "update code" --sourcemapOutput "source-map-tool/source-map/test/main.jsbundle_1.0.0.map" [--targetBinaryVersion "~1.0.0"]

// livenet
// code-push release-react 'BitmarkHealthPlus' ios -d Production --mandatory true --sourcemapOutput "source-map-tool/source-map/live/main.jsbundle_1.1.1.map" --targetBinaryVersion "1.1.1"
// code-push release-react 'BitmarkHealthPlus' ios -d Production -m --description "update code" --sourcemapOutput "source-map-tool/source-map/live/main.jsbundle_1.0.0.map" [--targetBinaryVersion "~1.0.0"]


// react-native run-ios --device "Bitmark’s iPhone" --scheme 'Bitmark Health dev'
// react-native run-ios --device "iPhone 5 testing" --scheme 'Bitmark Health dev'

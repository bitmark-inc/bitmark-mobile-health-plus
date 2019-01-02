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
const isIPhoneX = (currentSize.height === 812 || currentSize.width === 812 || currentSize.height === 896 || currentSize.width === 896);

let config = {
  isIPhoneX,
  network,
  localization: DeviceInfo.getDeviceLocale(),

  NETWORKS,
  bitmark_network: NETWORKS.testnet,
  zeroAddress: 'dw9MQXcC5rJZb3QE1nz86PiQAheMP1dx9M3dr52tT8NNs14m33',
  appLink: 'https://itunes.apple.com/us/app/bitmark-health/id1436273185?ls=1&mt=8',
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
  config.zeroAddress = 'a3ezwdYVEVrHwszQrYzDTCAZwUD3yKtNsCq9YhEu97bPaGAKy1';
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
// code-push release-react 'BitmarkHealthPlus' ios --pre "BitmarkHealthPlus dev" --mandatory true  --targetBinaryVersion "1.0.9"
// code-push release-react 'BitmarkHealthPlus' ios --pre "BitmarkHealthPlus dev" --mandatory true  --sourcemapOutput "source-map-tool/source-map/test/main.jsbundle_1.1.0.map" [--targetBinaryVersion "~1.0.0"]

// livenet
// code-push release-react 'BitmarkHealthPlus' ios -d Production --mandatory true --sourcemapOutput "source-map-tool/source-map/live/main.jsbundle_1.1.1.map" --targetBinaryVersion "1.1.1"
// code-push release-react 'BitmarkHealthPlus' ios -d Production -m --description "update code" --sourcemapOutput "source-map-tool/source-map/live/main.jsbundle_1.0.0.map" [--targetBinaryVersion "~1.0.0"]


// react-native run-ios --device "Bitmark’s iPhone" --scheme 'BitmarkHealthPlus dev'
// react-native run-ios --device "iPhone 5 testing" --scheme 'BitmarkHealthPlus dev'
// react-native run-ios --device "Bin’s iPhone" --scheme 'BitmarkHealthPlus dev'


// code-push release-react 'BitmarkHealthPlus' ios --pre "BitmarkHealthPlus dev" --mandatory true --sourcemapOutput "source-map-tool/source-map/test/main.jsbundle_1.54.6.map" --plistFile=ios/Info-dev.plist
// export SENTRY_PROPERTIES=./sentry.properties


// $ appcenter codepush release-react --app YourApp --output-dir ./build
// $ export SENTRY_PROPERTIES=./ios/sentry.properties
// $ sentry-cli react-native appcenter YourApp ios ./build/codePush
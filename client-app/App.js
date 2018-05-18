import DeviceInfo from 'react-native-device-info';
import { Text } from 'react-native';

Text.defaultProps.allowFontScaling = false;

import {
  BitmarkAppComponent,
  CodePushMainAppComponent
} from './src';

let ApplicationComponent = BitmarkAppComponent;
if (DeviceInfo.getBundleId() === 'com.bitmark.bitmarkios' || DeviceInfo.getBundleId() === 'com.bitmark.bitmarkios.development') {
  ApplicationComponent = CodePushMainAppComponent;
}
export default ApplicationComponent;

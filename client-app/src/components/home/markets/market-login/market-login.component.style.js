import { StyleSheet, Platform, Dimensions } from 'react-native';
import {
  ios,
  android // TODO
} from './../../../../configs';

const deviceSize = Dimensions.get('window');

let constant = Platform.select({
  ios: ios.constant,
  android: android.constant
});

export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#E5E5E5',
  },

  main: {
    borderTopColor: '#C0CCDF',
    borderTopWidth: 0.5,
    height: deviceSize.height - constant.headerSize.height,
    backgroundColor: 'white',
  },
});
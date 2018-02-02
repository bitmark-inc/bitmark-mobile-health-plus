import { StyleSheet, Platform } from 'react-native';
import {
  ios,
  android // TODO
} from './../../../../configs';
let constant = Platform.select({
  ios: ios.constant,
  android: android.constant
});

export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
  },
  main: {
    borderTopColor: '#C0CCDF',
    borderTopWidth: 0.5,
    height: Platform.select({
      ios: constant.defaultWindowSize.height - constant.headerSize.height,
      android: '100%', //TODO
    }),
    backgroundColor: 'white',

  },
  marketIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    marginRight: 10,
  }
});
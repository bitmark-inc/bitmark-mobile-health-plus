import { StyleSheet, Platform, Dimensions } from 'react-native';
import {
  ios,
  // android  //TODO
} from './../../../configs'
const currentSize = Dimensions.get('window');

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
      ios: currentSize.height - ios.constant.headerSize.height,
      android: '100%', //TODO
    }),
    backgroundColor: 'white',
  },
});
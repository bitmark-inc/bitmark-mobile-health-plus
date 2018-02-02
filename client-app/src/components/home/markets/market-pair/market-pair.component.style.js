import { StyleSheet, Platform, Dimensions } from 'react-native';
import { convertWidth } from './../../../../utils';
import {
  ios,
  android // TODO
} from './../../../../configs';
let constant = Platform.select({
  ios: ios.constant,
  android: android.constant
});

const deviceSize = Dimensions.get('window');



export default StyleSheet.create({
  body: {
    flexDirection: 'column',
    alignItems: 'center',
    height: deviceSize.height - (constant.bottomTabsHeight + constant.blankFooter + constant.headerSize.height),
    width: '100%',
    backgroundColor: '#E5E5E5'
  },

  camera: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderWidth: 1,
    width: '100%',
  }
});
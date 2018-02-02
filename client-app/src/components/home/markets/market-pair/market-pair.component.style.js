import { StyleSheet, Platform, Dimensions } from 'react-native';
import { convertWidth } from './../../../../utils';
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
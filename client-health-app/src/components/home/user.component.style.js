import { StyleSheet, } from 'react-native';
import { convertWidth } from '../../utils';
// import { iosConstant } from "../../configs/ios/ios.config";

export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'white',
  },

  accountIcon: {
    width: 29,
    height: 29,
    resizeMode: 'contain',
    marginLeft: convertWidth(19),
  },

});
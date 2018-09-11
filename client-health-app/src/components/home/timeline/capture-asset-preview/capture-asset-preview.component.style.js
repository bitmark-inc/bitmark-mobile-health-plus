import { StyleSheet } from 'react-native';
import { convertWidth } from "../../../../utils";
import { iosConstant } from '../../../../configs/ios/ios.config';

export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#EFEFF4'
  },

  previewContainer: {
    flex: 1
  },

  previewImage: {
    height: '100%',
    resizeMode: 'contain'
  }
});
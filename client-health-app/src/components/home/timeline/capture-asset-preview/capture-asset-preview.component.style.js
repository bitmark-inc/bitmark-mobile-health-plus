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
  },

  bottomButton: {
    width: convertWidth(375),
    height: iosConstant.bottomBottomHeight,
    paddingTop: 10,
    paddingBottom: Math.max(10, iosConstant.blankFooter),
    backgroundColor: '#0060F2',
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center'
  },

  buttonText: {
    color: '#FFFFFF',
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 16,
  }
});
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
    height: '100%'
  },

  bottomButton: {
    width: convertWidth(375),
    height: 45 + iosConstant.blankFooter / 2,
    paddingTop: 10,
    paddingBottom: 10 + iosConstant.blankFooter / 2,
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
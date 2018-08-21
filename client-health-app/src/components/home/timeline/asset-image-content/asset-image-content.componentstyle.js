import { StyleSheet, } from 'react-native';
import { convertWidth } from '../../../../utils';
import { iosConstant } from '../../../../configs/ios/ios.config';

export default StyleSheet.create({
  body: {
    flexDirection: 'column',
    height: '100%',
    width: '100%',
  },

  bodyContent: {
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center'
  },
  imageContent: {
    height: '60%',
    resizeMode: 'cover'
  },
  downloadButton: {
    width: convertWidth(375),
    height: iosConstant.bottomBottomHeight,
    backgroundColor: '#0060F2',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    paddingBottom: Math.max(10, iosConstant.blankFooter),
  },
  downloadText: {
    fontSize: 16,
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    color: '#FFFFFF'
  }
});
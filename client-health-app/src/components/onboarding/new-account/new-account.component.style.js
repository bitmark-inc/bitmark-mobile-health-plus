import { StyleSheet } from 'react-native'
import { convertWidth } from './../../../utils';
import { ios } from '../../../configs';
import {iosConstant} from "../../../configs/ios/ios.config";

export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'white'
  },

  logoArea: {
    flex: 1,
    justifyContent: 'center'
  },

  appLogo: {
    width: convertWidth(285),
    height: 48 * convertWidth(285) / 285,
    resizeMode: 'contain',
  },

  buttonsArea: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
  },

  button: {
    height: 45,
    width: convertWidth(375),
    flexDirection: 'column',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: '#0060F2'
  },

  buttonText: {
    fontFamily: 'Avenir black',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    color: 'white'
  },

  lastBottomButton: {
    backgroundColor: '#F2FAFF',
    height: ios.constant.bottomBottomHeight,
    paddingTop: 10,
    paddingBottom: Math.max(10, iosConstant.blankFooter),
  },

  lastBottomButtonText: {
    color: '#0060F2'
  }
})
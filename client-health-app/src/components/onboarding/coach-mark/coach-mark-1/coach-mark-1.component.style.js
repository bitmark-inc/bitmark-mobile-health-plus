import {Dimensions, StyleSheet} from 'react-native';
import {convertWidth} from './../../../../utils';
import {ios} from '../../../../configs';

let currentSize = Dimensions.get('window');

const marginTop = ios.config.isIPhoneX ? 7: 10;
const marginBottom = ios.config.isIPhoneX ? 52 : 5;

export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#2D2D2D'
  },

  content: {
    marginTop: ios.constant.headerSize.paddingTop,
    width: '100%',
    height: '100%'
  },

  header: {
    alignItems: 'center',
    justifyContent: 'center',
    height: ios.constant.headerSize.height - ios.constant.headerSize.paddingTop,
    borderBottomWidth: 1,
    borderColor: 'rgba(00, 00, 00, 0.5)'
  },

  footer: {
    height: ios.constant.bottomTabsHeight + ios.constant.blankFooter,
    borderTopWidth: 1,
    borderColor: 'rgba(00, 00, 00, 0.1)',
    width: convertWidth(375),
    position: 'absolute',
    bottom: 0
  },

  backgroundImageArea: {
    width: '100%',
    height: currentSize.height - 19,
    position: 'absolute'
  },

  topLeftImage: {
    position: 'absolute',
    top: marginTop,
    left: convertWidth(19),
    width: 202,
    height: 100,
    resizeMode: 'contain'
  },

  topRightImage: {
    position: 'absolute',
    top: marginTop,
    right: convertWidth(19),
    width: 204,
    height: 163,
    resizeMode: 'contain'
  },

  bottomLeftImage: {
    position: 'absolute',
    bottom: marginBottom,
    left: convertWidth(19),
    width: 138,
    height: 153,
    resizeMode: 'contain'
  },

  bottomRightImage: {
    position: 'absolute',
    bottom: marginBottom,
    right: convertWidth(19),
    width: 210,
    height: 249,
    resizeMode: 'contain'
  },

  addIcon: {
    position: 'absolute',
    bottom: ios.constant.bottomTabsHeight + ios.constant.blankFooter + ios.constant.headerSize.paddingTop + 10,
    right: 19,
    opacity: 0.1,
    width: 64,
    height: 64,
    resizeMode: 'contain'
  },

  buttonsArea: {
    flex: 1,
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },

  button: {
    marginTop: ios.config.isIPhoneSE ? -90 : 0,
    height: 40,
    width: 116,
    borderWidth: 1,
    borderColor: 'white',
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
  }
})
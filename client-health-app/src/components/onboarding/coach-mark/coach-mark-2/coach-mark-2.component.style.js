import {StyleSheet} from 'react-native'
import {convertWidth} from './../../../../utils';
import {ios} from '../../../../configs';

export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#2D2D2D'
  },

  cover: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(00, 00, 00, 0.8)'
  },

  content: {
    marginTop: ios.constant.headerSize.paddingTop,
    width: '100%',
    height: '100%'
  },

  header: {
    backgroundColor: '#EDF0F4',
    borderBottomColor: 'rgba(0,0,0,0.3)',
    borderBottomWidth: 0.3
  },

  rightHeaderIcon: {
    width: 26,
    height: 26,
    marginRight: convertWidth(19)
  },

  imageArea: {
    position: 'absolute',
    top: ios.constant.headerSize.height - ios.constant.headerSize.paddingTop + 20,
    left: 0,
    width: '100%',
    alignItems: 'center'
  },

  signWeeklyImage: {
    width: 282,
    height: 127,
    resizeMode: 'contain'
  },

  textArea: {
    position: 'absolute',
    top: ios.constant.headerSize.height - ios.constant.headerSize.paddingTop + 20 + 127 + 10,
    width: '100%',
    paddingLeft: convertWidth(19),
    paddingRight: convertWidth(19)
  },

  text: {
    fontFamily: 'Avenir light',
    fontSize: 15,
    color: 'white'
  },

  addIcon: {
    position: 'absolute',
    bottom: ios.constant.bottomTabsHeight + ios.constant.blankFooter + ios.constant.headerSize.paddingTop + 15,
    right: 19,
    width: 78,
    height: 78,
    resizeMode: 'contain'
  },

  addIconText: {
    position: 'absolute',
    bottom: ios.constant.bottomTabsHeight + ios.constant.blankFooter + ios.constant.headerSize.paddingTop + 93,
    right: 97
  },

  buttonsArea: {
    position: 'absolute',
    bottom: ios.constant.bottomTabsHeight + ios.constant.blankFooter + ios.constant.headerSize.paddingTop - 5,
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },

  button: {
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
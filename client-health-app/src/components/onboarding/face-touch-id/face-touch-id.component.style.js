import { StyleSheet, Dimensions } from 'react-native'
import { convertWidth } from '../../../utils';
import { iosConstant } from '../../../configs/ios/ios.config';
let currentSize = Dimensions.get('window');
export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  scrollContent: {
    width: '100%',
    flexDirection: 'column',
    paddingLeft: 51,
    paddingRight: 51,
  },

  swipePageContent: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: currentSize.height - (85 + iosConstant.blankFooter / 2),
  },

  swipePageMainContent: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // notification
  faceTouchIdTitle: {
    fontFamily: 'Avenir black',
    color: '#0060F2',
    fontSize: 17,
    fontWeight: '900',
    marginTop: 54,
    width: convertWidth(375),
    textAlign: 'center',
  },

  passcodeRemindImages: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  touchIdImage: {
    width: 90,
    height: 90,
    resizeMode: 'contain',
  },
  faceIdImage: {
    marginLeft: 30,
    width: 90,
    height: 90,
    resizeMode: 'contain',
  },

  faceTouchIdDescription: {
    marginTop: 29,
    width: convertWidth(294),
    fontFamily: 'Avenir light',
    fontWeight: '300',
    fontSize: 16,
    lineHeight: 20,
    textAlign: 'center',
  },

  enableButtonArea: {
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  enableButton: {
    height: iosConstant.bottomBottomHeight,
    width: convertWidth(375),
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: '#0060F2',
    paddingTop: 10,
    paddingBottom: Math.max(10, iosConstant.blankFooter),
  },
  enableButtonText: {
    fontFamily: 'Avenir black',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    color: 'white'
  },
});
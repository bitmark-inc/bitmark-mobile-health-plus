import { StyleSheet } from 'react-native'
import { convertWidth } from '../../../utils';
import { iosConstant } from '../../../configs/ios/ios.config';
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

  // notification
  faceTouchIdTitle: {
    fontFamily: 'Avenir black',
    color: '#0060F2',
    fontSize: 17,
    fontWeight: '900',
    marginTop: 103,
    width: convertWidth(275),
  },

  passcodeRemindImages: {
    marginTop: 73,
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  touchIdImage: {
    width: 69,
    height: 69,
    resizeMode: 'contain',
  },
  faceIdImage: {
    marginLeft: 30,
    width: 69,
    height: 69,
    resizeMode: 'contain',
  },

  faceTouchIdDescription: {
    marginTop: 80,
    width: convertWidth(275),
    fontFamily: 'Avenir light',
    fontWeight: '300',
    fontSize: 17,
    lineHeight: 20,
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
    height: 45 + iosConstant.blankFooter / 2,
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
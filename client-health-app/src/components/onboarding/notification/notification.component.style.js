import { StyleSheet, Dimensions } from 'react-native'
import { convertWidth } from '../../../utils';
import { iosConstant } from '../../../configs/ios/ios.config';
let currentSize = Dimensions.get('window');
export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
    paddingLeft: convertWidth(50),
    paddingRight: convertWidth(50),
    paddingBottom: 90,
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
  notificationTitle: {
    fontFamily: 'Avenir black',
    color: '#0060F2',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 25,
    textAlign: 'center',
  },

  notificationImage: {
    width: convertWidth(275),
    height: 215 * convertWidth(275) / 275,
    resizeMode: 'contain',
  },

  notificationDescription: {
    marginTop: 25,
    width: convertWidth(275),
    fontFamily: 'Avenir light',
    fontWeight: '300',
    fontSize: 16,
    textAlign: 'center',
  },

  enableButtonArea: {
    flexDirection: 'column',
    width: '100%',
  },
  enableButton: {
    height: 45,
    width: convertWidth(375),
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: '#0060F2',
    paddingTop: 10,
    paddingBottom: 10,
  },
  enableButtonText: {
    fontFamily: 'Avenir black',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    color: 'white',
  },
});
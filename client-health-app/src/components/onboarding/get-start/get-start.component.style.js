import { StyleSheet } from 'react-native'
import { convertWidth } from '../../../utils';
import { iosConstant } from '../../../configs/ios/ios.config';
export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
    paddingLeft: convertWidth(50),
    paddingRight: convertWidth(50),
    paddingBottom: 90,
  },
  // getStart
  getStartTitle: {
    fontFamily: 'Avenir black',
    color: '#0060F2',
    fontSize: 17,
    fontWeight: '900',
    marginTop: 83,
  },

  accessIconArea: {
    marginTop: 111,
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
  },
  accessIcon: {
    height: 90,
    width: 90,
    resizeMode: 'contain'
  },
  accessIconPlus: {
    height: 24,
    width: 24,
    resizeMode: 'contain',
    marginLeft: 10,
    marginRight: 10,
  },

  getStartDescription: {
    marginTop: 37,
    width: convertWidth(275),
    fontFamily: 'Avenir light',
    fontWeight: '300',
    fontSize: 17,
  },

  enableButtonArea: {
    flexDirection: 'column',
    width: '100%',
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
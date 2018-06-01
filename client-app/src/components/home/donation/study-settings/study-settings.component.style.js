import { StyleSheet, Platform } from 'react-native';
import {
  ios,
  android // TODO
} from './../../../../configs';
import { convertWidth } from '../../../../utils';
import { iosConstant } from '../../../../configs/ios/ios.config';
let constant = Platform.select({
  ios: ios.constant,
  android: android.constant
});

export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    width: '100%',
  },
  main: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },

  dataSourceInstallIcon: {
    width: 104,
    height: 104,
    resizeMode: 'contain',
    marginTop: 94,
  },
  dataSourceInstallApp: {
    marginTop: 83.5,
    fontSize: 32,
    fontWeight: '900',
    fontFamily: 'Avenir Black'
  },
  dataSourceInstallDescription: {
    marginTop: 13,
    width: 322,
    fontSize: 15,
    fontFamily: 'Avenir Light',
    lineHeight: 20,
    fontWeight: '300',
    textAlign: 'center',
  },
  dataSourceInstallButton: {
    borderColor: '#0060F2',
    borderWidth: 1,
    width: convertWidth(186),
    minHeight: 46,
    borderRadius: 6,
    paddingTop: 9,
    marginTop: 20,
    marginBottom: 20,
  },
  dataSourceInstallButtonText: {
    textAlign: 'center',
    color: '#0060F2',
    lineHeight: 27,
    fontSize: 20,
    fontFamily: 'Avenir Black',
  },
  dataSourceInstallNote: {
    textAlign: 'center',
    fontFamily: 'Avenir Light',
    fontSize: 14,
    marginBottom: 10 + constant.blankFooter,
    width: convertWidth(360),
    fontWeight: '300',
  },

  thankYouTitle: {
    marginTop: 94,
    width: convertWidth(291),
    height: 124,
    fontFamily: 'Avenir Black',
    fontSize: 17,
    fontWeight: '900',
    color: '#0060F2',
  },
  thankYouDescription: {
    marginTop: 38,
    width: convertWidth(280),
    fontFamily: 'Avenir Light',
    fontSize: 17,
    fontWeight: '300',
    color: '#828282',
  },

  bottomButtonArea: {
    width: '100%',
    flexDirection: 'column',
    position: 'absolute',
    bottom: 0,
  },
  bottomButton: {
    backgroundColor: '#0060F2',
    width: '100%',
    height: 45 + iosConstant.blankFooter / 2,
    paddingTop: 10,
    paddingBottom: Math.max(10, iosConstant.blankFooter),
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomButtonText: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },

});
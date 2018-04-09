import { StyleSheet, Platform, Dimensions } from 'react-native';
import {
  ios,
  android //TODO
} from './../../../../configs';
let constant = Platform.select({ ios: ios.constant, android: android.constant });
let currentSize = Dimensions.get('window');


export default StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  main: {
    height: currentSize.height - constant.headerSize.height - 45,
    borderTopColor: '#C0CCDF',
    borderTopWidth: 0.5,
    backgroundColor: 'white',
  },
  infoButtonText: {
    fontFamily: 'Avenir Black',
    color: '#0060F2',
    fontSize: 18,
    fontWeight: '800',
  },
  bottomButtonArea: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  bottomButton: {
    minHeight: 45,
    paddingTop: 11,
    paddingBottom: Math.max(20, 10 + constant.blankFooter),
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: '#0060F2',
  },
  bottomButtonText: {
    fontFamily: 'Avenir black',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    color: 'white'
  }
});
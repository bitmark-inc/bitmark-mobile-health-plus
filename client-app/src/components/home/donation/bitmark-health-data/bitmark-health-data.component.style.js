import { StyleSheet, Platform } from 'react-native'
import { convertWidth } from '../../../../utils';

import {
  ios,
  android //TODO
} from './../../../../configs';
let constant = Platform.select({ ios: ios.constant, android: android.constant });


export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    alignContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
    paddingLeft: convertWidth(19),
    paddingRight: convertWidth(19),
  },
  bitmarkTitle: {
    fontFamily: 'Avenir Black',
    fontSize: 17,
    textAlign: 'center',
    color: '#0060F2',
    fontWeight: '900',
    marginTop: 53,
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

  bitmarkDescription: {
    fontFamily: 'Avenir Black',
    fontSize: 17,
    fontWeight: '300',
    width: convertWidth(275),
    marginTop: 80,
  },
  bitmarkButton: {
    position: 'absolute',
    bottom: 0,
    minHeight: 45,
    paddingTop: 11,
    paddingBottom: Math.max(11, constant.blankFooter),
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: '#0060F2',
  },
  bitmarkButtonText: {
    fontFamily: 'Avenir black',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    color: 'white'
  }
});
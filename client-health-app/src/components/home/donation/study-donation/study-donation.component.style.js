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
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    height: ios.constant.headerSize.height - ios.constant.headerSize.paddingTop,
    width: '100%',
  },
  main: {
    flex: 1,
    backgroundColor: 'white',
    flexDirection: 'column',
    alignItems: 'center',
  },
  donationTitle: {
    fontFamily: 'Avenir Black',
    fontSize: 20,
    textAlign: 'center',
    color: '#0060F2',
    fontWeight: '900',
    width: convertWidth(300),
    marginTop: 53,
  },
  passcodeRemindImages: {
    marginTop: 150,
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
  donationDescription: {
    fontFamily: 'Avenir Light',
    fontSize: 17,
    lineHeight: 20,
    fontWeight: '300',
    width: convertWidth(337),
    marginTop: 80,
  },
  bitmarkButton: {
    position: 'absolute',
    bottom: 0,
    minHeight: 45 + constant.blankFooter / 2,
    paddingTop: 10,
    paddingBottom: Math.max(10, constant.blankFooter),
    width: convertWidth(375),
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    borderTopColor: '#0060F2',
    borderTopWidth: 3,
    backgroundColor: '#F5F5F5',
  },
  bitmarkButtonText: {
    fontFamily: 'Avenir black',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    color: '#0060F2'
  }
});
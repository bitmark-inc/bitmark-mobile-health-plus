import { StyleSheet, Platform } from 'react-native'
import {
  ios,
  android // TODO
} from './../../../../configs';
let constant = Platform.select({
  ios: ios.constant,
  android: android.constant
});
export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    alignContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  swipePage: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
  },
  swipeDotButton: {
    backgroundColor: '#C4C4C4',
    width: 8,
    height: 8,
    borderRadius: 3,
    marginLeft: 3,
    marginRight: 3,
    marginTop: 3,
    marginBottom: 3,
  },
  swipePagination: {
    position: 'absolute',
    bottom: 115 + constant.blankFooter,
  },

  content: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: {
    marginTop: 111,
    width: 270,
    height: 58,
    fontFamily: 'Avenir black',
    fontSize: 17,
    fontWeight: '900',
    color: '#0060F2',
  },
  description: {
    marginTop: 22,
    width: 275,
    fontFamily: 'Avenir Light',
    fontSize: 17,
    lineHeight: 21,
    fontWeight: '300',
  },

  bitmarkTitle: {
    fontFamily: 'Avenir Black',
    fontSize: 17,
    textAlign: 'center',
    color: '#0060F2',
    fontWeight: '900',
    width: 277,
    marginTop: 39,
  },
  bitmarkIcon: {
    marginTop: 105,
    width: 237,
    height: 237,
    resizeMode: 'contain'
  },
  bitmarkDescription: {
    fontFamily: 'Avenir Black',
    fontSize: 17,
    fontWeight: '300',
    width: 275,
    marginTop: 386,
  },

  bitmarkAccountArea: {
    marginTop: 50,
    width: 270,
    height: 54,
    borderColor: '#0060F2',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
  },
  bitmarkAccountText: {
    fontFamily: 'Andale Mono',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '400',
    color: '#0060F2',
    width: 213,
  },

  accessIconArea: {
    marginTop: 23,
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
  },
  accessIcon: {
    height: 68,
    width: 68,
    resizeMode: 'contain'
  },
  accessIconPlus: {
    height: 25,
    width: 25,
    resizeMode: 'contain',
    marginLeft: 20,
    marginRight: 20,
  },

  bitmarkRequestTouchIdTitle: {
    fontFamily: 'Arial',
    fontSize: 15.42,
    textAlign: 'center',
    fontWeight: '800',
    width: 248,
    height: 106,
    marginTop: 26,
  },

  bitmarkRequestTouchIdCancelButton: {
    borderTopColor: '#919191',
    borderTopWidth: 1,
    width: '100%',
    paddingTop: 10,
    paddingBottom: 10,
  },
  bitmarkRequestTouchIdCancelButtonText: {
    fontFamily: 'Arial',
    fontSize: 15.42,
    textAlign: 'center',
    fontWeight: '800',
    color: '#0060F2',
  },

  bitmarkSuccessTitle: {
    fontFamily: 'Arial',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '900',
    width: 248,
    marginTop: 26,
  },
  bitmarkSuccessDescription: {
    fontFamily: 'Arial',
    fontSize: 15.42,
    textAlign: 'center',
    fontWeight: '300',
    width: 250,
    marginTop: 10,
    lineHeight: 20,
    marginBottom: 25,
  },
  passcodeRemindImages: {
    position: 'absolute',
    marginTop: 198,
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

  bottomButtonArea: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  bottomButton: {
    height: 45,
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
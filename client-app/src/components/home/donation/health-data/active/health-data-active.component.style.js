import { StyleSheet } from 'react-native'
import { ios } from '../../../../../configs';
import { convertWidth } from '../../../../../utils';

export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    alignContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
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
  swipePage: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
  },

  content: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
    paddingLeft: convertWidth(19),
    paddingRight: convertWidth(19),
    paddingBottom: 45,
  },
  description: {
    marginTop: 38,
    width: convertWidth(327),
    fontFamily: 'Avenir Light',
    fontSize: 17,
    fontWeight: '300',
    minHeight: 248,
  },
  accessIconArea: {
    marginTop: 90,
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
  },
  accessIcon: {
    height: 72,
    width: 72,
    resizeMode: 'contain'
  },
  accessIconPlus: {
    height: 25,
    width: 25,
    resizeMode: 'contain',
    marginLeft: 20,
    marginRight: 20,
  },


  healthDataTitle: {
    fontFamily: 'Avenir Black',
    fontSize: 17,
    fontWeight: '900',
    width: convertWidth(337),
    color: '#0060F2',
    marginTop: 38,
  },

  healthDataDescription: {
    fontFamily: 'Avenir Black',
    fontSize: 17,
    fontWeight: '300',
    width: convertWidth(337),
    marginTop: 50,
  },

  bitmarkRequestTouchIdTitle: {
    fontFamily: 'Arial',
    fontSize: 15.42,
    textAlign: 'center',
    fontWeight: '800',
    width: convertWidth(248),
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
    width: convertWidth(248),
    marginTop: 26,
  },
  bitmarkSuccessDescription: {
    fontFamily: 'Arial',
    fontSize: 15.42,
    textAlign: 'center',
    fontWeight: '300',
    width: convertWidth(250),
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
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  bottomButton: {
    width: convertWidth(375),
    minHeight: 45,
    paddingTop: 11,
    paddingBottom: 11,
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
import { StyleSheet } from 'react-native'
import { convertWidth } from '../../../../utils';

export default StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: 'white',
  },
  main: {
    flex: 1,
    backgroundColor: 'white',
    flexDirection: 'column',
    alignItems: 'center',
    paddingLeft: convertWidth(19),
    paddingRight: convertWidth(19),
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
  donationDescription: {
    fontFamily: 'Avenir Light',
    fontSize: 17,
    lineHeight: 20,
    fontWeight: '300',
    width: convertWidth(275),
    marginTop: 80,
  },
  bitmarkButton: {
    position: 'absolute',
    bottom: 0,
    height: 45,
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
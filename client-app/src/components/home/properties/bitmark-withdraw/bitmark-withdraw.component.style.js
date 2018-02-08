import { StyleSheet, } from 'react-native';

import { convertWidth } from './../../../../utils';

export default StyleSheet.create({
  scroll: {
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    backgroundColor: 'white',
  },
  body: {
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    backgroundColor: 'white',
  },

  depositArea: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  assetImage: {
    marginTop: 33,
    width: convertWidth(130),
    height: convertWidth(130),
    resizeMode: 'contain'
  },
  assetName: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 18,
    lineHeight: 20,
    marginTop: 19,
    width: convertWidth(337),
    textAlign: 'center',
  },
  withdrawMessage: {
    fontFamily: 'Avenir Light',
    fontWeight: '300',
    fontSize: 17,
    lineHeight: 20,
    marginTop: 27,
    width: convertWidth(337),
  },
  continueButton: {
    width: convertWidth(337),
    height: 42,
    marginTop: 58,
    backgroundColor: '#0060F2',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 17,
    lineHeight: 20,
    color: 'white',
  },
});
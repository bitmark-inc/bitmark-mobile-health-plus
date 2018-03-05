import { StyleSheet, } from 'react-native';

import { convertWidth } from './../../../../utils';

export default StyleSheet.create({
  body: {
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    backgroundColor: 'white',
  },
  content: {
    flexDirection: 'column',
  },

  chooseMarketArea: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  stepLabel: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 14,
    lineHeight: 16,
    marginTop: 49,
    height: 30,
    width: convertWidth(337),
  },
  stepMessage: {
    fontFamily: 'Avenir Black',
    fontWeight: '300',
    fontSize: 17,
    lineHeight: 20,
    marginTop: 17,
    width: convertWidth(337),
  },
  martketListArea: {
    flexDirection: 'column',
    marginTop: 35,
    alignItems: 'center',
    width: '100%',
  },
  marketButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderColor: '#A4B5CD',
    borderWidth: 1,
    width: convertWidth(337),
    height: 119,
    // marginLeft: convertWidth(19),
  },
  marketButtonIcon: {
    height: 51,
    width: 150,
    resizeMode: 'contain'
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
  depositMessage: {
    fontFamily: 'Avenir Light',
    fontWeight: '300',
    fontSize: 17,
    lineHeight: 20,
    marginTop: 27,
    width: convertWidth(337),
    textAlign: 'center',
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
import { StyleSheet, } from 'react-native';
import { convertWidth } from '../../../../../../utils';

export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'white',
  },

  swipePage: {
    flexDirection: 'column',
    paddingLeft: convertWidth(50),
  },

  title: {
    fontFamily: 'Avenir Black',
    fontSize: 17,
    fontWeight: '900',
    marginTop: 48,
    color: '#0060F2',
    width: convertWidth(320),
  },
  message: {
    fontFamily: 'Avenir Heavy',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 28,
    width: convertWidth(320),
  },
  description: {
    fontFamily: 'Avenir Light',
    fontSize: 17,
    fontWeight: '300',
    marginTop: 37,
    width: convertWidth(275),
  },

  thankYouMessage: {
    fontFamily: 'Avenir Light',
    fontSize: 14,
    fontWeight: '300',
    marginTop: 37,
    textAlign: 'center',
    width: convertWidth(320),
  },

  emailInput: {
    marginTop: 81,
    height: 46,
    width: convertWidth(290),
    borderWidth: 1,
    borderColor: '#0060F2',
    color: '#0060F2',
    fontFamily: 'Avenir Heavy',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  emailError: {
    fontFamily: 'Avenir Black',
    fontWeight: '600',
    fontSize: 15,
    color: '#FF003C',
    marginTop: 5,
    height: 20,
  },

  congratulations: {
    fontFamily: 'Avenir Heavy',
    fontSize: 17,
    fontWeight: '900',
    color: '#0060F2',
    marginTop: 105,
    textAlign: 'center',
    width: convertWidth(285),
  },
  madelenaImage: {
    width: 85,
    height: 85,
    resizeMode: 'contain',
    marginTop: 53,
  },
  madelenaName: {
    fontFamily: 'Avenir Black',
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 12,
  },
  madelenaThankMessage: {
    fontFamily: 'Avenir Light',
    fontSize: 15,
    fontWeight: '300',
    textAlign: 'center',
    marginTop: 4,
    width: convertWidth(285),
  },

  bottomButtons: {
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftButton: {
    height: 45,
    width: convertWidth(187.5),
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 3,
    borderTopColor: '#A4B5CD',
  },
  leftButtonText: {
    fontFamily: 'Avenir Heavy',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    color: '#A4B5CD',
  },
  rightButton: {
    height: 45,
    width: convertWidth(187.5),
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 3,
    borderTopColor: '#0060F2',
  },
  rightButtonText: {
    fontFamily: 'Avenir Heavy',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    color: '#0060F2',
  },
  submitButton: {
    height: 45,
    width: convertWidth(375),
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 3,
    borderTopColor: '#0060F2',
  },
  submitButtonText: {
    fontFamily: 'Avenir Heavy',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    color: '#0060F2',
  },

});
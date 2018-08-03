import { StyleSheet, } from 'react-native';
import { convertWidth } from '../../../../../../utils';
import { iosConstant } from '../../../../../../configs/ios/ios.config';

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
    paddingRight: convertWidth(50),
  },

  title: {
    fontFamily: 'Avenir Black',
    fontSize: 17,
    fontWeight: '900',
    marginTop: 48,
    color: '#0060F2',
    width: convertWidth(275),
  },
  message: {
    fontFamily: 'Avenir Heavy',
    fontSize: 17,
    fontWeight: '300',
    marginTop: 28,
    width: convertWidth(275),
  },
  description: {
    fontFamily: 'Avenir Black',
    fontSize: 17,
    fontWeight: '300',
    marginTop: 37,
    width: convertWidth(275),
  },
  thankYouMessage: {
    fontFamily: 'Avenir Light',
    fontSize: 17,
    fontWeight: '300',
    marginTop: 36,
    width: convertWidth(275),
  },

  emailInput: {
    marginTop: 81,
    height: 46,
    width: convertWidth(290),
    borderBottomWidth: 1,
    borderBottomColor: '#0060F2',
    fontFamily: 'Avenir Light',
    fontSize: 16,
    fontWeight: '300',
    paddingLeft: 7,
  },
  emailError: {
    fontFamily: 'Avenir Black',
    fontWeight: '600',
    fontSize: 15,
    marginLeft: convertWidth(19),
    color: '#FF003C',
    marginTop: 5,
    height: 20,
  },

  congratulations: {
    fontFamily: 'Avenir Heavy',
    fontSize: 17,
    fontWeight: '900',
    color: '#0060F2',
    marginTop: 103,
    width: convertWidth(275),
  },
  researcherArea: {
    flexDirection: 'column',
    alignItems: 'center',
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
    marginTop: 26,
  },
  madelenaThankMessage: {
    fontFamily: 'Avenir Light',
    fontSize: 17,
    fontWeight: '300',
    textAlign: 'center',
    marginTop: 10,
    width: convertWidth(285),
  },

  bottomButtons: {
    height: 45 + iosConstant.blankFooter,
    paddingTop: 10,
    paddingBottom: Math.max(10, iosConstant.blankFooter),
    flexDirection: 'row',
    alignItems: 'center',
  },
  interestedButton: {
    height: 45 + iosConstant.blankFooter,
    paddingTop: 10,
    paddingBottom: Math.max(10, iosConstant.blankFooter),
    width: convertWidth(186),
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 3,
    borderColor: '#0060F2',
  },
  interestedButtonText: {
    fontFamily: 'Avenir Black',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    color: '#0060F2',
  },
  optOutButton: {
    height: 45 + iosConstant.blankFooter,
    paddingTop: 10,
    paddingBottom: Math.max(10, iosConstant.blankFooter),
    width: convertWidth(186),
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 3,
    borderColor: '#A4B5CD',
  },
  optOutButtonText: {
    fontFamily: 'Avenir Black',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    color: '#A4B5CD',
  },

});
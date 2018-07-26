import { StyleSheet } from 'react-native'
import { convertWidth, calculateAdditionalHeight } from '../../../utils';
import { ios } from '../../../configs';
import { iosConstant } from '../../../configs/ios/ios.config';

export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'white',
    // borderWidth: 2, borderColor: 'red',
  },

  // new account
  main: {
    flex: 1,
  },
  swipeArea: {
  },
  swipePage: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
    paddingBottom: 50 + ios.constant.blankFooter,
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
    bottom: 50 + ios.constant.blankFooter,
  },

  introductionArea: {
    flexDirection: 'column',
    height: 145,
  },
  introductionTitle: {
    marginTop: 25,
    left: convertWidth(50),
    fontFamily: 'Avenir black',
    color: '#0060F2',
    fontSize: 17,
    fontWeight: '900',
  },
  introductionDescription: {
    marginTop: 30,
    left: convertWidth(50),
    width: convertWidth(275),
    fontFamily: 'Avenir light',
    fontWeight: '300',
    fontSize: 17,
  },
  introductionLinkButton: {
    marginTop: 20,
    left: convertWidth(50),
  },
  introductionLink: {
    fontFamily: 'Avenir light',
    fontWeight: '900',
    color: '#0060F2',
    fontSize: 14,
  },
  introductionImageArea: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
  },
  onBoardingImage: {
    resizeMode: 'contain',
    width: convertWidth(230),
    height: 370 * convertWidth(230) / 230
  },
  donationOnBoardingImage: {
    marginTop: 24,
    resizeMode: 'contain',
    width: convertWidth(196),
    height: 343 * convertWidth(196) / 196
  },
  publicAccountNumberOnBoardingImage: {
    marginTop: 20,
    resizeMode: 'contain',
    width: convertWidth(219),
    height: 298 * convertWidth(219) / 219
  },
  introductionTermPrivacy: {
    marginTop: calculateAdditionalHeight(667, 30, true),
    left: convertWidth(50),
    width: convertWidth(272),
  },
  termPrivacySecondLine: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
  },
  bitmarkTermsPrivacyText: {
    fontFamily: 'Avenir light',
    fontSize: 17,
    fontWeight: '300',
    lineHeight: 19,
  },
  bitmarkTermsPrivacyButtonText: {
    fontFamily: 'Avenir light',
    color: '#0060F2',
    fontSize: 17,
    fontWeight: '300',
    lineHeight: 19,
  },

  skipButtonArea: {
    position: 'absolute',
    bottom: 23 + ios.constant.blankFooter,
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
  },
  skipButton: {
    marginTop: 10,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    fontFamily: 'Avenir black',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    color: 'white'
  },

  letDoItButtonArea: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
  },
  letDoItButton: {
    marginTop: 10,
    width: convertWidth(375),
    minHeight: 45 + iosConstant.blankFooter / 2,
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: '#0060F2',
    paddingTop: 10,
    paddingBottom: Math.max(10, iosConstant.blankFooter),
  },
  letDoItButtonText: {
    fontFamily: 'Avenir Black',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    color: 'white'
  },
});
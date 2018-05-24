import { StyleSheet } from 'react-native'
import { convertWidth } from '../../../utils';
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
    paddingBottom: 70 + ios.constant.blankFooter,
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
    bottom: 70 + ios.constant.blankFooter,
  },

  introductionArea: {
    flexDirection: 'column',
    height: 290,
  },
  introductionTitle: {
    marginTop: 28,
    left: convertWidth(50),
    fontFamily: 'Avenir black',
    color: '#0060F2',
    fontSize: 17,
    fontWeight: '900',
  },
  introductionDescription: {
    marginTop: 40,
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
    fontWeight: '300',
    color: '#0060F2',
    fontSize: 14,
  },
  introductionImageArea: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
  },
  introductionImage: {
    backgroundColor: 'white',
    width: convertWidth(320),
    height: 180 * convertWidth(320) / 320,
  },
  introductionTermPrivacy: {
    marginTop: 66,
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
    lineHeight: 22,
  },
  bitmarkTermsPrivacyButtonText: {
    fontFamily: 'Avenir light',
    color: '#0060F2',
    fontSize: 17,
    fontWeight: '300',
    textDecorationLine: 'underline',
    lineHeight: 22,
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
    minHeight: 45,
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
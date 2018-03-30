import { StyleSheet } from 'react-native'
import { convertWidth } from '../../../utils';
import { ios } from '../../../configs';

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
    bottom: 15 + ios.constant.blankFooter,
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
    marginTop: 50,
    left: convertWidth(50),
    width: convertWidth(265),
    fontFamily: 'Avenir light',
    fontWeight: '300',
    fontSize: 17,
  },
  introductionLinkButton: {
    position: 'absolute',
    top: 279,
    left: convertWidth(50),
  },
  introductionLink: {
    fontFamily: 'Avenir light',
    fontWeight: '300',
    color: '#0060F2',
    fontSize: 14,
  },
  introductionImageArea: {
    position: 'absolute',
    top: 323,
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
  },
  introductionImage: {
    backgroundColor: 'white',
    width: 320,
    height: 180,
  },
  introductionTermPrivacy: {
    marginTop: 66,
    left: convertWidth(50),
    width: 272,
  },
  termPrivacySecondLine: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
  },
  bitmarkTermsPrivacyText: {
    fontFamily: 'Avenir light',
    fontSize: 14,
    fontWeight: '300',
    lineHeight: 22,
  },
  bitmarkTermsPrivacyButtonText: {
    fontFamily: 'Avenir light',
    color: '#0060F2',
    fontSize: 14,
    fontWeight: '300',
    textDecorationLine: 'underline',
    lineHeight: 22,
  },

  skipButtonArea: {
    position: 'absolute',
    bottom: 35 + ios.constant.blankFooter,
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
    backgroundColor: '#0060F2',
  },
  skipButtonText: {
    fontFamily: 'Avenir black',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    color: 'white'
  },

  letDoItButtonArea: {
    marginTop: 85,
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
  },
  letDoItButton: {
    marginTop: 10,
    width: 309,
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: '#0060F2',
  },
  letDoItButtonText: {
    fontFamily: 'Avenir black',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    color: 'white'
  },
});
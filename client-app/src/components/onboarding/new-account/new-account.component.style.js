import { StyleSheet, Platform } from 'react-native'
import {
  ios,
  // android // TODO
} from './../../../configs';

export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'white',
  },

  // new account
  main: {
    flex: 1,
  },
  swipeArea: {
  },
  swipePage: {
    flex: 1,
    width: '100%',
    height: '100%',
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
    bottom: Platform.select({
      ios: 58 + ios.constant.blankFooter,
      android: 58 // TODO;
    })
  },
  introductionTitle: {
    position: 'absolute',
    top: 119,
    left: 50,
    fontFamily: 'Avenir black',
    color: '#0060F2',
    fontSize: 17,
    fontWeight: '900',
  },
  introductionDescription: {
    position: 'absolute',
    top: 199,
    left: 50,
    width: 265,
    fontFamily: 'Avenir light',
    fontWeight: '300',
    fontSize: 17,
  },
  introductionLinkButton: {
    position: 'absolute',
    top: 349,
    left: 50,
  },
  introductionLink: {
    fontFamily: 'Avenir light',
    fontWeight: '300',
    color: '#0060F2',
    fontSize: 14,
  },
  introductionImageArea: {
    position: 'absolute',
    top: 393,
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
    position: 'absolute',
    top: 515,
    left: 50,
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

});
import { StyleSheet, Dimensions } from 'react-native'
import { convertWidth } from './../../../utils';
import { ios } from '../../../configs';

let currentSize = Dimensions.get('window');

export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'white',
  },

  swipeArea: {
  },
  swipeDotButton: {
    backgroundColor: '#C4C4C4',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
    marginTop: 3,
    marginBottom: 3,
  },
  swipePagination: {
    position: 'absolute',
    bottom: 107 + ios.constant.blankFooter,
  },

  swipePage: {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    alignContent: 'center',
  },

  swipePageContent: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: currentSize.height - (115 + ios.constant.blankFooter + ios.constant.headerSize.paddingTop),
  },

  swipePageMainContent: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: 320,
    height: 438,
  },

  welcomeLogo: {
    width: convertWidth(285),
    height: 48 * convertWidth(285) / 285,
    resizeMode: 'contain',
  },

  introductionArea: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  introductionTitle: {
    marginTop: 25,
    fontFamily: 'Avenir black',
    color: '#0060F2',
    fontSize: 17,
    fontWeight: '900',
    width: 275,
    textAlign: 'center',
  },
  introductionDescription: {
    marginTop: 15,
    width: 275,
    fontFamily: 'Avenir light',
    fontWeight: '300',
    fontSize: 16,
    textAlign: 'center',
  },

  introductionImageArea: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 15,
  },
  onBoardingImage: {
    resizeMode: 'contain',
    width: 216,
    height: 226,
  },

  welcomeButtonArea: {
    position: 'absolute',
    bottom: 0,
    marginTop: 33,
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
  },
  welcomeButton: {
    paddingTop: 10,
    paddingBottom: 10,
    height: 45,
    width: convertWidth(375),
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: '#0060F2',
  },
  welcomeButtonText: {
    fontFamily: 'Avenir black',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    color: 'white'
  },
});
import { StyleSheet, Dimensions } from 'react-native'
import { convertWidth } from './../../../utils';
import { ios } from '../../../configs';

let currentSize = Dimensions.get('window');

export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'white'
  },

  swipeArea: {
  },
  swipePagination: {
    position: 'absolute',
    bottom: 50 + ios.constant.blankFooter,
  },

  swipePage: {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    alignContent: 'center'
  },

  swipePageContent: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: currentSize.height - (115 + ios.constant.blankFooter + ios.constant.headerSize.paddingTop),
  },

  swipePageMainContent: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    width: 320
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

  introductionArea: {
    height: 200,
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
    width: 310,
    textAlign: 'left',
  },
  introductionDescription: {
    marginTop: 15,
    width: 310,
    fontFamily: 'Avenir light',
    fontWeight: '300',
    fontSize: 17,
    textAlign: 'left',
  },

  introductionImageArea: {
    flex: 1,
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  onBoardingImage: {
    resizeMode: 'contain',
    width: 216,
    height: 226,
  },

  doneButtonArea: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
  },
  doneButton: {
    height: 45,
    width: convertWidth(375),
    flexDirection: 'column',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: '#0060F2',
  },
  doneButtonText: {
    fontFamily: 'Avenir black',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    color: 'white'
  },
});
import { StyleSheet } from 'react-native'
import { convertWidth } from '../../../utils';
import { iosConstant } from '../../../configs/ios/ios.config';

export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
    paddingTop: 40,
    paddingBottom: 20,
  },

  swipePageContent: {
    flexDirection: 'column',
    flex: 1,
  },

  contentSubTitleText: {
    width: convertWidth(375),
    fontFamily: 'Avenir black',
    fontSize: 15,
    fontWeight: '900',
    paddingLeft: convertWidth(19),
    paddingRight: convertWidth(19),
    paddingTop: 20,
    paddingBottom: 20,
  },
  contentCreatedText: {
    width: convertWidth(375),
    paddingLeft: convertWidth(19),
    paddingRight: convertWidth(19),
    fontFamily: 'Avenir Light',
    fontSize: 15,
    fontStyle: 'italic',
    fontWeight: '300',
  },
  contentNormalText: {
    width: convertWidth(375),
    paddingLeft: convertWidth(19),
    paddingRight: convertWidth(19),
    fontSize: 15,
    fontWeight: '300',
    fontFamily: 'Avenir Light',
    marginTop: 5,
  },

  knowYourRights: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: convertWidth(19),
    marginRight: convertWidth(19),
    minHeight: 26,
    borderBottomWidth: 0.3,
    borderBottomColor: '#C1C1C1',
  },
  knowYourRightsText: {
    fontSize: 12,
    fontWeight: '300',
    fontFamily: 'Avenir Light',
    lineHeight: 21,
  },



  bottomButtonArea: {
    flexDirection: 'column',
    width: '100%',
  },
  bottomButton: {
    height: 45,
    width: convertWidth(375),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: '#919191',
    paddingTop: 10,
    paddingBottom: 10,
  },
  bottomButtonText: {
    fontFamily: 'Avenir black',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    color: '#0060F2',
  },
  bottomButtonIcon: {
    width: 8,
    height: 13,
    resizeMode: 'contain',
  },
  lastBottomButton: {
    height: iosConstant.bottomBottomHeight,
    width: convertWidth(375),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0060F2',
    paddingTop: 10,
    paddingBottom: 10,
  },
  lastBottomButtonText: {
    fontFamily: 'Avenir black',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    color: 'white',
  },
});
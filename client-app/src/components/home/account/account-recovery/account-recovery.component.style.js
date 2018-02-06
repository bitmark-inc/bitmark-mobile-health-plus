import { StyleSheet, Platform } from 'react-native';
import {
  ios,
  android // TODO
} from './../../../../configs';
import { convertWidth } from './../../../../utils';

let constant = Platform.select({
  ios: ios.constant,
  android: android.constant
});

export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#EDF0F4',
  },

  recoveryPhraseContent: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#EDF0F4',
    height: constant.defaultWindowSize.height - constant.bottomTabsHeight - constant.headerSize.height - constant.blankFooter,
  },
  recoveryPhraseWarningIcon: {
    width: 137,
    height: 36,
    resizeMode: 'contain',
    marginTop: 41,
  },
  recoveryDescription: {
    fontFamily: 'Avenir Heavy',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 23,
    width: 296,
  },
  recoveryPhraseBottomButton: {
    width: convertWidth(337),
    height: 42,
    backgroundColor: '#0060F2',
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  recoveryPhraseBottomButtonText: {
    fontFamily: 'Avenir Black',
    fontSize: 16,
    fontWeight: '900',
    color: 'white'
  },

  writeRecoveryPhraseContentMessage: {
    fontFamily: 'Avenir Light',
    fontSize: 14,
    fontWeight: '300',
    width: 351,
    marginTop: 20,
  },

  writeRecoveryPhraseContentList: {
    marginTop: 10,
    backgroundColor: 'white',
    width: '100%',
    height: 283,
    paddingLeft: 73,
    paddingRight: 73,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  writeRecoveryPhraseContentHalfList: {
    flexDirection: 'column',
    paddingTop: 17,
    paddingBottom: 17,
    height: 283,
  },
  writeRecoveryPhraseContentTestButtonText: {
    fontFamily: 'Avenir Light',
    fontSize: 14,
    fontWeight: '300',
    color: '#0060F2',
    marginTop: 66,
  },
  recoveryPhraseSet: {
    flexDirection: 'row',
    height: 21,
  },
  recoveryPhraseIndex: {
    fontFamily: 'Avenir Light',
    fontSize: 15,
    fontWeight: '300',
    color: '#D4D4D4',
    width: 23,
    textAlign: 'right',
  },
  recoveryPhraseWord: {
    fontFamily: 'Avenir Light',
    fontSize: 15,
    fontWeight: '300',
    color: '#0060F2',
    width: 80,
    marginLeft: 6,
  },

  ranDomWordsArea: {
    marginTop: 10,
    height: 145,
  },
  recoveryPhraseChoose: {
    height: 29,
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    width: 90,
  },
  recoveryPhraseChooseButton: {
    borderWidth: 1,
    borderColor: '#0060F2',
    backgroundColor: 'white',
    paddingLeft: 9,
    paddingRight: 9,
    borderRadius: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
  recoveryPhraseChooseButtonText: {
    fontFamily: 'Avenir Heavy',
    fontSize: 15,
    fontWeight: '300',
    color: '#0060F2',
  },
  recoveryPhraseTestResult: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  recoveryPhraseTestTitle: {
    fontFamily: 'Avenir Light',
    fontSize: 15,
    fontWeight: '900',
    marginTop: 27,
  },
  recoveryPhraseTestMessage: {
    fontFamily: 'Avenir Light',
    fontSize: 15,
    fontWeight: '300',
    textAlign: 'center',
    width: 335,
    marginTop: 11,
  },
});
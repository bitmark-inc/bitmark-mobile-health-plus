import { StyleSheet, Platform } from 'react-native'
import {
  ios,
  android // TODO
} from './../../../configs';

let constant = Platform.select({
  ios: ios.constant,
  android: android.constant
});

export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'white',
  },

  //sign-in
  recoveryPhraseContent: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#EDF0F4',
    height: constant.defaultWindowSize.height - constant.headerSize.height - constant.blankFooter - constant.buttonHeight,
  },
  writeRecoveryPhraseContentMessage: {
    fontFamily: 'Avenir Light',
    fontSize: 14,
    fontWeight: '300',
    width: 346,
    marginLeft: 12,
    marginTop: 14,
  },
  writeRecoveryPhraseArea: {
    marginTop: 14,
    backgroundColor: 'white',
    width: '100%',
    height: 364,
  },
  writeRecoveryPhraseContentList: {
    paddingLeft: 73,
    paddingRight: 73,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  writeRecoveryPhraseContentHalfList: {
    flexDirection: 'column',
    paddingTop: 19,
    paddingBottom: 19,
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
    height: 19,
    marginTop: 4,
    marginBottom: 4,
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
    width: 107,
    marginLeft: 6,
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
  recoveringMessage: {
    fontFamily: 'Avenir Black',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    color: '#0060F2',
    width: 307,
    height: 42,
    marginTop: 158,
  },
  recoveringIndicator: {
    marginTop: 30,
    transform: [
      { scale: 1.5 },
    ],
  },
});
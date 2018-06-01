import { StyleSheet } from 'react-native'
import { convertWidth } from './../../../utils'
import { ios } from '../../../configs';
import { iosConstant } from '../../../configs/ios/ios.config';

export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'white',
  },

  mainContent: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
    paddingBottom: Math.max(10, ios.constant.blankFooter),
    paddingLeft: convertWidth(19),
    paddingRight: convertWidth(19),
  },
  //sign-in
  writeRecoveryPhraseContentMessage: {
    fontFamily: 'Avenir Light',
    fontSize: 17,
    fontWeight: '300',
    width: convertWidth(336),
    marginTop: 18,
  },
  writeRecoveryPhraseArea: {
    marginTop: 14,
    backgroundColor: 'white',
    width: '100%',
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
    width: convertWidth(23),
    textAlign: 'right',
  },
  recoveryPhraseWord: {
    fontFamily: 'Avenir Light',
    fontSize: 15,
    fontWeight: '300',
    color: '#0060F2',
    width: convertWidth(107),
    marginLeft: 6,
  },

  recoveryPhraseTestResult: {
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: 80,
  },
  recoveryPhraseTestTitle: {
    fontFamily: 'Avenir Light',
    fontSize: 15,
    fontWeight: '900',
    marginTop: 10,
  },
  recoveryPhraseTestMessage: {
    fontFamily: 'Avenir Light',
    fontSize: 15,
    fontWeight: '300',
    textAlign: 'center',
    width: convertWidth(335),
    marginTop: 5,
  },
  recoveringMessage: {
    fontFamily: 'Avenir Black',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    color: '#0060F2',
    width: convertWidth(307),
    minHeight: 42,
    marginTop: 158,
  },
  recoveringIndicator: {
    marginTop: 30,
    transform: [
      { scale: 1.5 },
    ],
  },
  submitButton: {
    height: 45 + iosConstant.blankFooter / 2,
    paddingTop: 10,
    paddingBottom: Math.max(10, iosConstant.blankFooter),
    width: convertWidth(375),
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: '#0060F2',
  },
  submitButtonText: {
    fontFamily: 'Avenir black',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    color: 'white'
  },
});
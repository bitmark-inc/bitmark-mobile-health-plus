import { StyleSheet } from 'react-native'

export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'white',
  },

  mainContent: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  //sign-in
  writeRecoveryPhraseContentMessage: {
    fontFamily: 'Avenir Light',
    fontSize: 17,
    fontWeight: '300',
    width: 340,
    marginTop: 18,
  },
  writeRecoveryPhraseArea: {
    marginTop: 14,
    backgroundColor: 'white',
    width: '100%',
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
    marginTop: 18,
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
  submitButton: {
    marginTop: 40,
    minHeight: 42,
    width: 309,
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
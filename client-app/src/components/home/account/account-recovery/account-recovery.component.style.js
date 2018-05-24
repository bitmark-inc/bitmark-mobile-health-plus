import { StyleSheet, } from 'react-native';

import { convertWidth } from './../../../../utils';
import { ios } from '../../../../configs';


export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    height: ios.constant.headerSize.height - ios.constant.headerSize.paddingTop,
    width: '100%',
  },

  recoveryPhraseContent: {
    flex: 1,
    flexDirection: 'column',
    paddingLeft: convertWidth(19),
    paddingRight: convertWidth(19),
    backgroundColor: 'white',
  },
  recoveryPhraseWarningIcon: {
    width: 137,
    height: 36,
    resizeMode: 'contain',
    marginTop: 41,
    marginLeft: convertWidth(85),
  },
  recoveryDescription: {
    fontFamily: 'Avenir Heavy',
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 18,
    marginTop: 23,
    width: convertWidth(337),
  },
  recoveryPhraseBottomButton: {
    width: convertWidth(375),
    height: 45,
    backgroundColor: '#0060F2',
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recoveryPhraseBottomButtonText: {
    fontFamily: 'Avenir Black',
    fontSize: 16,
    fontWeight: '900',
    color: 'white',
    textAlign: 'center',
  },

  writeRecoveryPhraseContentMessage: {
    fontFamily: 'Avenir Light',
    fontSize: 17,
    fontWeight: '300',
    width: convertWidth(309),
    marginTop: 20,
  },

  writeRecoveryPhraseContentList: {
    marginTop: 10,
    backgroundColor: 'white',
    width: '100%',
    height: 283,
    flexDirection: 'row',
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
    width: convertWidth(39),
    textAlign: 'left',
  },
  recoveryPhraseWord: {
    fontFamily: 'Avenir Light',
    fontSize: 15,
    fontWeight: '300',
    color: '#0060F2',
    width: convertWidth(108),
  },

  recoveryPhraseChoose: {
    height: 29,
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    marginRight: 7,
  },
  recoveryPhraseChooseButton: {
    borderWidth: 1,
    borderColor: '#0060F2',
    backgroundColor: 'white',
    paddingLeft: 7,
    paddingRight: 7,
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
    textAlign: 'center',
  },
  recoveryPhraseTestResult: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 27,
    marginBottom: 27,
  },
  recoveryPhraseTestTitle: {
    fontFamily: 'Avenir Light',
    fontSize: 15,
    fontWeight: '900',
  },
  recoveryPhraseTestMessage: {
    fontFamily: 'Avenir Light',
    fontSize: 15,
    fontWeight: '300',
    textAlign: 'center',
    width: convertWidth(309),
    marginTop: 11,
  },
});
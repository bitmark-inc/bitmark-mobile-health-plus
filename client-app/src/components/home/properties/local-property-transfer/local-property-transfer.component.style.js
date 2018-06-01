import { StyleSheet } from 'react-native';
import { convertWidth } from './../../../../utils';
import { iosConstant } from '../../../../configs/ios/ios.config';


export default StyleSheet.create({
  body: {
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    backgroundColor: 'white',
  },
  threeDotIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    marginRight: 15,
  },
  content: {
    flexDirection: 'column',
  },
  mainContent: {
    flexDirection: 'column',
    paddingLeft: convertWidth(19),
    paddingRight: convertWidth(19),
  },
  transferTitle: {
    fontFamily: 'Avenir Light',
    fontWeight: '900',
    fontSize: 16,
    lineHeight: 19,
    marginTop: 38,
    height: 27,
    width: convertWidth(336),
  },
  inputAccountNumberBar: {
    borderBottomWidth: 1,
    borderBottomColor: '#0060F2',
    width: convertWidth(336),
    height: 35,
    paddingLeft: convertWidth(7),
    paddingRight: convertWidth(7),
    marginTop: 8,
  },
  inputAccountNumber: {
    fontFamily: 'Andale Mono',
    fontSize: 14,
    lineHeight: 16,
    width: convertWidth(315),
    marginTop: 12,
    height: 20,
  },
  removeAccountNumberButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 4,
  },
  removeAccountNumberIcon: {
    width: 10,
    height: 10,
    resizeMode: 'contain',
  },
  accountNumberError: {
    fontFamily: 'Avenir Light',
    fontSize: 14,
    lineHeight: 16,
    width: convertWidth(325),
    marginTop: 12,
    height: 20,
    color: '#FF003C',
  },
  transferMessage: {
    fontFamily: 'Avenir Light',
    fontWeight: '300',
    fontSize: 15,
    lineHeight: 18,
    marginTop: 20,
    width: convertWidth(336),
  },
  sendButton: {
    width: convertWidth(375),
    height: 45 + iosConstant.blankFooter / 2,
    borderTopWidth: 3,
    backgroundColor: '#F5F5F5',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    paddingBottom: Math.max(10, iosConstant.blankFooter),
  },
  sendButtonText: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 17,
    lineHeight: 20,
    color: '#0060F2',
  },


});
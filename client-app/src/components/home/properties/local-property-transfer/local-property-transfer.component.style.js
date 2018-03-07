import { StyleSheet } from 'react-native';
import { convertWidth } from './../../../../utils';


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
    marginTop: 28,
    width: convertWidth(336),
  },
  inputAccountNumberBar: {
    borderBottomWidth: 1,
    borderBottomColor: '#0060F2',
    width: convertWidth(336),
    height: 45,
    paddingLeft: convertWidth(7),
    paddingRight: convertWidth(7),
    marginTop: 8,
  },
  inputAccountNumber: {
    fontFamily: 'Andale Mono',
    fontSize: 14,
    lineHeight: 16,
    width: convertWidth(325),
    marginTop: 12,
    height: 20,
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
    marginTop: 31,
    width: convertWidth(336),
    height: 42,
    borderTopWidth: 3,
    backgroundColor: '#F5F5F5',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 17,
    lineHeight: 20,
    color: '#0060F2',
  },


});
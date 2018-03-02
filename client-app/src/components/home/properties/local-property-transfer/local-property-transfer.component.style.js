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
    alignItems: 'center',
  },
  inputAccountNumber: {
    fontFamily: 'Andale Mono',
    fontSize: 14,
    lineHeight: 16,
    width: convertWidth(325),
    marginTop: 47,
  },
  inputAccountNumberBar: {
    borderTopWidth: 1,
    borderTopColor: '#0060F2',
    width: convertWidth(336),
    marginTop: 9,
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
    borderTopWidth: 2,
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
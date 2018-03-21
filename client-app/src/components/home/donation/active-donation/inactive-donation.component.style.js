import { StyleSheet, } from 'react-native';
import { convertWidth } from '../../../../utils';

export default StyleSheet.create({
  disableContent: {
    paddingLeft: convertWidth(50),
    paddingRight: convertWidth(50),
    width: convertWidth(375),
    height: '100%',
    flexDirection: 'column',
    backgroundColor: 'white',
  },
  enableTitle: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 17,
    color: '#0060F2',
    marginTop: 111,
    width: '100%',
  },
  enableMessage: {
    fontFamily: 'Avenir Light',
    fontWeight: '300',
    fontSize: 17,
    lineHeight: 19,
    marginTop: 82,
    width: '100%',
  },
  enableButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 45,
    marginTop: 215,
    backgroundColor: '#0060F2',
  },
  enableButtonText: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 14,
    lineHeight: 16,
    color: 'white',
  },

});
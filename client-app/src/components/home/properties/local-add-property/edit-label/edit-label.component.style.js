import { StyleSheet, } from 'react-native';

import { convertWidth } from './../../../../../utils';

export default StyleSheet.create({
  body: {
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    backgroundColor: 'white',
  },
  bodyContent: {
    paddingLeft: convertWidth(10),
    paddingRight: convertWidth(19),
  },
  inputLabel: {
    marginTop: 28,
    width: convertWidth(337),
    fontFamily: 'Andale Mono',
    fontSize: 15,
    marginLeft: convertWidth(10),
  },
  inputLabelBar: {
    marginTop: 9,
    borderBottomColor: '#0060F2',
    borderBottomWidth: 1,
    marginLeft: convertWidth(10),
  },
  suggesionsList: {
    marginTop: 5,
    marginBottom: 20,
    width: '100%',
  },
  suggesionsButton: {
    width: '100%',
    paddingTop: 10,
    paddingLeft: 10,
  },
  suggesionsButtonText: {
    fontFamily: 'Andale Mono',
    fontSize: 15,
    color: '#0060F2',
  },

});
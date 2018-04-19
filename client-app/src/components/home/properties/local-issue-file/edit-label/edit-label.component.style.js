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
    marginTop: 47,
    width: convertWidth(337),
    fontFamily: 'Andale Mono',
    fontSize: 15,
    marginLeft: convertWidth(10),
  },
  removeLabelNumberButton: {
    position: 'absolute',
    top: 45,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingLeft: 4,
    paddingTop: 4,
    paddingBottom: 4,
  },
  removeLabelNumberIcon: {
    width: 12,
    height: 12,
    resizeMode: 'contain',
  },
  inputLabelBar: {
    marginTop: 9,
    borderBottomColor: '#0060F2',
    borderBottomWidth: 1,
    marginLeft: convertWidth(10),
    width: convertWidth(337),
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
import { StyleSheet, } from 'react-native';

import { convertWidth } from './../../../../../utils';

export default StyleSheet.create({
  scroll: {
    flexDirection: 'column',
    width: '100%',
    backgroundColor: 'white',
  },
  body: {
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    backgroundColor: 'white',
  },

  addFileArea: {
    flexDirection: 'column',
    width: '100%',
  },
  addFileLabel: {
    fontFamily: 'Avenir Light',
    fontSize: 14,
    lineHeight: 19,
    marginLeft: convertWidth(20),
    marginTop: 40,
    height: 28,
  },
  fileInputError: {
    fontFamily: 'Avenir Black',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: convertWidth(20),
    color: '#FF003C',
    marginTop: 10,
    width: convertWidth(340),
  },
  addFileButton: {
    marginLeft: convertWidth(20),
    padding: 5,
    borderBottomColor: '#0060F2',
    borderBottomWidth: 1,
    width: convertWidth(330),
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addFileIcon: {
    width: 14,
    height: 14,
    resizeMode: 'contain',
  },
  addFileButtonText: {
    fontFamily: 'Andale Mono',
    fontSize: 13,
    color: '#C2C2C2',
    marginLeft: 7,
  },
});
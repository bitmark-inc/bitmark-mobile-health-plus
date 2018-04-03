import { StyleSheet } from 'react-native'
import { convertWidth } from '../../../../../utils';

export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    alignContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },

  metadataRow: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    paddingLeft: convertWidth(19),
    paddingRight: convertWidth(19),
    marginTop: 9,
    paddingTop: 10,
  },
  metadataRowKey: {
    fontFamily: 'Andale Mono',
    fontSize: 13,
    width: convertWidth(130),
  },
  metadataRowValue: {
    fontFamily: 'Andale Mono',
    fontSize: 13,
    marginLeft: convertWidth(12),
    width: convertWidth(196),
  },

});
import { StyleSheet } from 'react-native'
import { convertWidth } from '../../../../../utils';
import { ios, } from './../../../../../configs';
export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    alignContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingTop: 10,
    paddingBottom: 10 + ios.constant.blankFooter
  },

  dataSourceRow: {
    flexDirection: 'row',
    width: convertWidth(375),
    alignItems: 'center',
    paddingLeft: convertWidth(29),
    paddingRight: convertWidth(29),
    marginTop: 3,
    minHeight: 21,
  },
  dataSourcesName: {
    fontFamily: 'Andale Mono',
    fontSize: 13,
    width: convertWidth(220),
    marginRight: convertWidth(20),
  },
  dataSourceActive: {
    color: '#0060F2',
    fontFamily: 'Andale Mono',
    fontSize: 12,
    lineHeight: 14,
    width: convertWidth(100),
    textAlign: 'left',
  },
  dataSourceInactive: {
    color: '#FF003C',
    fontFamily: 'Andale Mono',
    fontSize: 12,
    lineHeight: 14,
    textAlign: 'left',
    width: convertWidth(100),
  },

});
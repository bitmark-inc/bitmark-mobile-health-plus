import { StyleSheet } from 'react-native'
import { convertWidth } from '../../../../utils';
import { ios, } from './../../../../configs';
export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    alignContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EFEFF4',
    paddingTop: 50,
    paddingBottom: 10 + ios.constant.blankFooter,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0, 0, 0, 0.3)'
  },
  textContainer: {
    width: "100%",
    marginTop: 20,
    paddingBottom: 20,
    paddingLeft: convertWidth(19),
    paddingRight: convertWidth(19),
    borderColor: "#D8D8D8",
    borderBottomWidth: 1,
  },
  text: {
    fontFamily: 'Avenir Light',
    fontSize: 15,
    lineHeight: 18,
    textAlign: 'left',
    fontWeight: '300'
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  }
});
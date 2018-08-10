import { StyleSheet } from 'react-native'
import { ios, } from './../../../../configs';
export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    alignContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EFEFF4',
    paddingTop: 10,
    paddingBottom: 10 + ios.constant.blankFooter
  },
  headerItem: {
    backgroundColor: '#EFEFF4'
  }
});
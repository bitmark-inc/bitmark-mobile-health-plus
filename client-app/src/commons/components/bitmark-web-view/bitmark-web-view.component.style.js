import { StyleSheet, } from 'react-native';
import { ios } from '../../../configs';

export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    height: ios.constant.headerSize.height - ios.constant.headerSize.paddingTop,
    width: '100%',
  },
  main: {
    flex: 1,
    borderTopColor: '#C0CCDF',
    borderTopWidth: 0.5,
    backgroundColor: 'white',
  },
});
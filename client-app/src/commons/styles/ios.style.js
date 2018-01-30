import { StyleSheet } from 'react-native'
import { ios } from './../../configs';

export default StyleSheet.create({
  header: {
    width: ios.constant.headerSize.width,
    height: ios.constant.headerSize.height,
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: ios.constant.headerSize.paddingTop,
  },
  headerLeft: {
    width: 70,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  headerLeftIcon: {
    marginLeft: 23,
    width: 10,
    height: 19,
    resizeMode: 'contain'
  },
  headerTitle: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '900',
    fontFamily: 'Avenir Black'
  },
  headerRight: {
    width: 70,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  headerRightText: {
    fontFamily: 'Avenir Light',
    fontSize: 16,
    fontWeight: '300',
    color: '#0060F2',
    marginRight: 10,
    textAlign: 'right',
  },
});
import { StyleSheet } from 'react-native'
import { android } from './../../configs';
import { convertWidth } from './../../utils';

export default StyleSheet.create({
  header: {
    width: android.constant.headerSize.width,
    height: android.constant.headerSize.height,
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: android.constant.headerSize.paddingTop,
    backgroundColor: '#F5F5F5',
  },
  headerLeft: {
    width: convertWidth(70),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: '100%'
  },
  headerLeftIcon: {
    marginLeft: convertWidth(19),
    width: 10,
    height: 19,
    resizeMode: 'contain'
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: convertWidth(375) - convertWidth(140),
    height: '100%'
  },
  headerTitle: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '900',
    fontFamily: 'Avenir Black',
    maxWidth: convertWidth(235),
  },
  headerRight: {
    width: convertWidth(70),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  headerRightText: {
    fontFamily: 'Avenir Light',
    fontSize: 16,
    fontWeight: '300',
    color: '#0060F2',
    marginRight: 19,
    textAlign: 'right',
  },
});
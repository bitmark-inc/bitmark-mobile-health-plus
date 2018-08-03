import { StyleSheet } from 'react-native'
import { convertWidth } from './../../utils';

export default StyleSheet.create({
  header: {
    flex: 1,
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
  },
  headerLeft: {
    width: 70,
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
    justifyContent: 'center',
    maxWidth: convertWidth(375) - 140,
    height: '100%',
  },
  headerTitle: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '900',
    fontFamily: 'Avenir Black',
    maxWidth: convertWidth(375) - 140,
  },
  headerRight: {
    width: 70,
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
  }
});
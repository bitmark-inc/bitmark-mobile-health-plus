import {
  StyleSheet,
} from 'react-native';
import { ios } from '../../../configs';

export default StyleSheet.create({
  body: {
    flexDirection: 'column',
    width: '100%',
    flex: 1,
    zIndex: ios.constant.zIndex.internetOff,
  },
  content: {
    alignItems: 'center',
    alignContent: 'center',
    flexDirection: 'column',
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    flex: 1,
  },
  title: {
    width: '100%',
    height: 40,
    backgroundColor: '#FF003C',
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
  },
  titleText: {
    fontFamily: 'Avenir black',
    fontSize: 18,
    fontWeight: '900',
    color: 'white',
    textAlign: 'center',
  },
});
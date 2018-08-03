import {
  StyleSheet,
} from 'react-native';
import { ios } from '../../../configs';

export default StyleSheet.create({
  content: {
    alignItems: 'center',
    alignContent: 'center',
    flexDirection: 'column',
    width: '100%',
    flex: 1,
  },
  title: {
    width: '100%',
    height: 40 + ios.constant.headerSize.paddingTop,
    backgroundColor: '#FF003C',
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    paddingTop: ios.constant.headerSize.paddingTop,
    top: -ios.constant.headerSize.paddingTop,
  },
  titleText: {
    fontFamily: 'Avenir black',
    fontSize: 18,
    fontWeight: '900',
    color: 'white',
    textAlign: 'center',
  },
});
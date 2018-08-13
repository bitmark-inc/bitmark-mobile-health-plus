import { StyleSheet, } from 'react-native';
import { convertWidth } from '../../../../utils';

export default StyleSheet.create({
  body: {
    flexDirection: 'column',
    height: '100%',
    width: '100%',
  },

  bodyContent: {
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  imageContent: {
    width: convertWidth(375),
    height: 463 * convertWidth(375) / 375,
    resizeMode: 'contain',
  },
});
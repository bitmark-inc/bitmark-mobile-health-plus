import {
  StyleSheet, Platform
} from 'react-native';

import {
  ios,
  android //TODO
} from './../../../configs';
import { convertWidth } from '../../../utils';
const constant = Platform.select({ ios: ios.constant, android: android.constant });
export default StyleSheet.create({
  dialogBody: {
    flex: 1,
    alignItems: 'center',
    alignContent: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    position: 'absolute',
    top: 0,
    width: '100%',
    height: '100%',
    zIndex: constant.zIndex.dialog,
  },
  dialogBodyContent: {
    alignItems: 'center',
    alignContent: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  dialogContent: {
    width: convertWidth(245),
    minHeight: 125,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
});
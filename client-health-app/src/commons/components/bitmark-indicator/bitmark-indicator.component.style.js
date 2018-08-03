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
  dialog: {
    zIndex: constant.zIndex.indicator,
  },
  content: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  indicatorImage: {
    width: 90,
    height: 90,
    opacity: 1,
    marginTop: 5,
  },
  textArea: {
    marginBottom: 28,
    alignItems: 'center',
    flexDirection: 'column',
  },
  indicatorTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    width: convertWidth(230),
  },
  indicatorMessage: {
    fontSize: 13,
    fontWeight: '400',
    textAlign: 'center',
    width: convertWidth(235),
    marginTop: 5,
  },
});
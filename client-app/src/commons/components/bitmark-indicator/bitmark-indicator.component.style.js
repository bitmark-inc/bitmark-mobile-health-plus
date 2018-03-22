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
  },
  indicatorTitle: {
    fontSize: 15.42,
    fontWeight: '800',
    textAlign: 'center',
    width: convertWidth(234),
  },
  indicatorMessage: {
    fontSize: 15.42,
    fontWeight: '400',
    textAlign: 'center',
    width: convertWidth(250),
    marginTop: 10,
  },
});
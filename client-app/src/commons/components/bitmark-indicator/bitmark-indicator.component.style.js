import {
  StyleSheet, Platform
} from 'react-native';

import {
  ios,
  android //TODO
} from './../../../configs';
const constant = Platform.select({ ios: ios.constant, android: android.constant });

export default StyleSheet.create({
  content: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  indicatorImage: {
    zIndex: constant.zIndex.indicator,
    width: 90,
    height: 90,
    opacity: 1,
    marginTop: 5,
  },
  textArea: {
    marginBottom: 30,
  },
  indicatorTitle: {
    fontFamily: 'Arial',
    fontSize: 15.42,
    fontWeight: '700',
    textAlign: 'center',
    width: 232,
    lineHeight: 20,
    color: '#4A4A4A',
  },
  indicatorMessage: {
    fontFamily: 'Arial',
    fontSize: 15.42,
    fontWeight: '400',
    textAlign: 'center',
    width: 232,
    lineHeight: 20,
    color: '#4A4A4A',
    marginTop: 10,
  },
});
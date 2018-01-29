import {
  StyleSheet, Platform
} from 'react-native';

import {
  ios,
  // android //TODO
} from './../../../configs';

export default StyleSheet.create({
  indicatorImage: {
    zIndex: Platform.select({
      ios: ios.constant.zIndex.indicator,
      android: 0, // TODO
    }),
    width: 90,
    height: 90,
    opacity: 1,
    marginTop: 5,
  },
  indicatorMessage: {
    fontFamily: 'Arial',
    fontSize: 15.42,
    fontWeight: '700',
    textAlign: 'center',
    width: 232,
    lineHeight: 20,
    color: '#4A4A4A',
    marginBottom: 30,
  },
});
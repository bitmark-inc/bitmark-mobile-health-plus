import {
  StyleSheet, Platform
} from 'react-native';

import {
  ios,
  // android //TODO
} from './../../../configs';

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
    width: Platform.select({
      ios: ios.constant.defaultWindowSize.width,
      android: '100%' //TODO
    }),
    height: Platform.select({
      ios: ios.constant.defaultWindowSize.height,
      android: '100%' //TODO
    }),
    zIndex: 100,
  },
  dialogContent: {
    width: 270,
    minHeight: 100,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
});
import {
  StyleSheet, Platform
} from 'react-native';

import {
  ios,
  android //TODO
} from './../../../configs';
let constant = Platform.select({ ios: ios.constant, android: android.constant });

export default StyleSheet.create({
  body: {
    zIndex: constant.zIndex.internetOff,
    flex: 1,
    alignItems: 'center',
    alignContent: 'center',
    flexDirection: 'column',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    position: 'absolute',
    width: constant.defaultWindowSize.width,
    height: constant.defaultWindowSize.height,
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
    bottom: 0,
  },
  titleText: {
    fontFamily: 'Avenir black',
    fontSize: 18,
    fontWeight: '900',
    color: 'white',
    textAlign: 'center',
  },
});
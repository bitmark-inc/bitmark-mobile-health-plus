import {
  StyleSheet, Platform, Dimensions,
} from 'react-native';

const currentSize = Dimensions.get('window');

import {
  ios,
  android //TODO
} from './../../../configs';
let constant = Platform.select({ ios: ios.constant, android: android.constant });

export default StyleSheet.create({
  body: {
    zIndex: constant.zIndex.internetOff,
    alignItems: 'center',
    alignContent: 'center',
    flexDirection: 'column',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    position: 'absolute',
    width: '100%',
    height: currentSize.height - constant.headerSize.paddingTop,
    top: constant.headerSize.paddingTop,
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
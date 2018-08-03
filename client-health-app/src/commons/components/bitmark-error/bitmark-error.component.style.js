import {
  StyleSheet, Platform
} from 'react-native';
import { convertWidth } from '../../../utils';
import {
  ios,
  android //TODO
} from './../../../configs';
const constant = Platform.select({ ios: ios.constant, android: android.constant });

export default StyleSheet.create({
  dialog: {
    zIndex: constant.zIndex.error,
  },
  content: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
  },
  textArea: {
    marginBottom: 30,
  },
  title: {
    marginTop: 30,
    fontFamily: 'Arial',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    width: convertWidth(232),
    lineHeight: 20,
    color: '#FF003C',
  },
  message: {
    fontFamily: 'Arial',
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    width: convertWidth(232),
    lineHeight: 20,
    color: '#FF003C',
    marginTop: 10,
  },
  okButton: {
    borderTopWidth: 1,
    borderTopColor: '#C1C1C1',
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 30,
  },
  okButtonText: {
    fontFamily: 'Avenir Light',
    fontSize: 14,
    fontWeight: '800',
    color: '#0060F2',
  }
});
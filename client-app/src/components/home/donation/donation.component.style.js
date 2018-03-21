import { StyleSheet, Platform, Dimensions } from 'react-native';
import {
  ios,
  android // TODO
} from './../../../configs';
import { convertWidth } from '../../../utils';
const currentSize = Dimensions.get('window');
const constant = Platform.select({
  ios: ios.constant,
  android: android.constant
});

export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  inActiveContent: {
    height: currentSize.height - constant.bottomTabsHeight,
    width: convertWidth(375),
    flexDirection: 'column',
    backgroundColor: 'white',
  },

  activedContent: {
    paddingTop: constant.headerSize.paddingTop,
    height: currentSize.height - constant.bottomTabsHeight,
  },

  subTabArea: {
    width: '100%',
    height: 44,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  subTabButton: {
    width: '50%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subTabButtonText: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 18,
    textAlign: 'center',
    color: '#0060F2',
  },
  taskIndicator: {
    position: 'absolute',
    top: 5,
    left: 124,
    backgroundColor: '#FF003C',
    borderColor: '#FF003C',
    borderWidth: 1,
    borderRadius: 5,
    width: 10,
    height: 10,
  }
});
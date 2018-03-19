import { StyleSheet, Platform, Dimensions } from 'react-native';
import {
  ios,
  android // TODO
} from './../../../configs';
let constant = Platform.select({
  ios: ios.constant,
  android: android.constant
});
const deviceSize = Dimensions.get('window');

export default StyleSheet.create({
  body: {
    flexDirection: 'column',
    alignItems: 'center',
    height: deviceSize.height - (constant.bottomTabsHeight + constant.blankFooter),
    width: '100%',
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
  },

  activedContent: {
    paddingTop: constant.headerSize.paddingTop,
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
});
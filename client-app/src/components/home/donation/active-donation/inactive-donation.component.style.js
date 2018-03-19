import { StyleSheet, Platform, Dimensions } from 'react-native';
import { convertWidth } from '../../../../utils';
import {
  ios,
  android // TODO
} from './../../../../configs';
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
    width: '100%',
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
  },
  disableContent: {
    paddingLeft: convertWidth(50),
    paddingRight: convertWidth(50),
    flex: 1,
    flexDirection: 'column',
    width: '100%',
    backgroundColor: 'white',
  },
  enableTitle: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 17,
    color: '#0060F2',
    marginTop: 111,
    width: '100%',
  },
  enableMessage: {
    fontFamily: 'Avenir Light',
    fontWeight: '300',
    fontSize: 17,
    lineHeight: 19,
    marginTop: 82,
    width: '100%',
  },
  enableButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 45,
    marginTop: 215,
    backgroundColor: '#0060F2',
  },
  enableButtonText: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 14,
    lineHeight: 16,
    color: 'white',
  },

});
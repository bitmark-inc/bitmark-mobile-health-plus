import { StyleSheet, Platform, Dimensions } from 'react-native';
import {
  ios,
  android // TODO
} from './../../../configs';
import { convertWidth } from '../../../utils';

const deviceSize = Dimensions.get('window');

let constant = Platform.select({
  ios: ios.constant,
  android: android.constant
});

export default StyleSheet.create({
  body: {
    flexDirection: 'column',
    alignItems: 'center',
    height: deviceSize.height - (constant.bottomTabsHeight + constant.blankFooter),
    width: '100%',
    backgroundColor: 'white',
  },
  addPropertyIcon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
    marginRight: 17,
  },
  subTabArea: {
    width: '100%',
    height: 39,
    backgroundColor: 'white',
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
  subTabButtonArea: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  subTabButtonTextArea: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 35,
  },
  subTabButtonText: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 14,
    lineHeight: 16,
    textAlign: 'center',
  },
  activeSubTabBar: {
    height: 4,
    backgroundColor: '#0060F2'
  },
  scrollSubTabArea: {
    width: '100%',
    flexDirection: 'column',
    alignContent: 'center'
  },
  contentSubTab: {
    width: '100%',
    flexDirection: 'column',
  },

  signRequestRow: {
    width: '100%',
    marginTop: 18,
    minHeight: 107,
    flexDirection: 'column',
    paddingLeft: convertWidth(19),
    paddingRight: convertWidth(19),
    borderBottomColor: '#EFEFEF',
    borderBottomWidth: 1,
  },
  signRequestTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  signRequestTitleType: {
    fontFamily: 'Andale Mono',
    fontSize: 13,
    fontWeight: '700',
    color: '#0060F2',
    width: convertWidth(220),
  },
  signRequestTitleTime: {
    fontFamily: 'Andale Mono',
    fontSize: 13,
    fontWeight: '700',
    width: convertWidth(90),
    marginLeft: convertWidth(12),
  },
  signRequestTitleIcon: {
    width: 12,
    height: 12,
    resizeMode: 'contain',
    marginLeft: convertWidth(3),
  },
  signRequestContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  signRequestSenderFix: {
    fontFamily: 'Andale Mono',
    fontSize: 12,
    fontWeight: '700',
  },
  signRequestSenderName: {
    fontFamily: 'Andale Mono',
    fontSize: 13,
    fontWeight: '900',
  },
  signRequestAssetName: {
    fontFamily: 'Avenir black',
    fontSize: 13,
    fontWeight: '900',
    width: convertWidth(150),
  },

});
import { StyleSheet, Platform, Dimensions } from 'react-native';
import {
  ios,
  android // TODO
} from './../../../configs';
import { convertWidth } from './../../../utils'

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
  bitmarkAccountHelpIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
    marginRight: 7,
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
    alignContent: 'center',
    backgroundColor: 'white'
  },
  contentSubTab: {
    width: '100%',
    flexDirection: 'column',
    paddingLeft: convertWidth(19),
    paddingRight: convertWidth(19),
  },

  //settings
  settingLabel: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 16,
    marginTop: 38,
  },
  accountNumberLabel: {
    fontFamily: 'Avenir Light',
    fontSize: 14,
    marginTop: 14,
  },

  accountNumberArea: {
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#0060F2',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: convertWidth(337),
    height: 30,
  },
  accountNumberValue: {
    fontFamily: 'Andale Mono',
    fontWeight: '900',
    fontSize: 13,
    width: convertWidth(280),
    marginLeft: convertWidth(7),
  },
  accountNumberCopyButton: {
    marginRight: 7,
  },
  accountNumberCopyButtonText: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 13,
    color: '#0060F2',
  },
  accountMessage: {
    fontFamily: 'Avenir Light',
    fontWeight: '300',
    fontSize: 14,
    marginTop: 20,
    width: convertWidth(309),
  },
  accountWriteDownButton: {
    marginTop: 21,
    paddingTop: 4,
    paddingBottom: 4,
  },
  accountWriteDownButtonText: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 14,
    color: '#0060F2',
  },
  accountRemoveButton: {
    marginTop: 2,
    paddingTop: 4,
    paddingBottom: 4,
  },
  accountRemoveButtonText: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 14,
    color: '#0060F2',
  },

  accountDataSourceLabel: {
    marginTop: 17,
    fontFamily: 'Avenir black',
    fontSize: 16,
    fontWeight: '900',
  },
  dataSourcesArea: {
    marginTop: 17,
    width: '100%',
    flexDirection: 'column',
    marginBottom: 20,
  },
  dataSourcesMessage: {
    fontFamily: 'Avenir black',
    fontSize: 14,
    fontWeight: '300'
  },

  activeBitmarkHealthDataButton: {
    marginTop: 30,
    paddingTop: 4,
    paddingBottom: 4,
  },
  activeBitmarkHealthDataButtonText: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 14,
    color: '#0060F2',
  },

  dataSourcesList: {
    width: '100%',
    marginTop: 15,
  },
  dataSourceRow: {
    width: '100%',
    marginTop: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 21,
  },
  dataSourcesName: {
    fontFamily: 'Andale Mono',
    fontSize: 12,
    width: convertWidth(220),
    lineHeight: 14,
  },
  dataSourceActive: {
    color: '#0060F2',
    fontFamily: 'Andale Mono',
    fontSize: 12,
    lineHeight: 14,
    width: convertWidth(100),
    textAlign: 'left',
  },
  dataSourceInactive: {
    color: '#FF003C',
    fontFamily: 'Andale Mono',
    fontSize: 12,
    lineHeight: 14,
    textAlign: 'left',
    width: convertWidth(100),
  },

});
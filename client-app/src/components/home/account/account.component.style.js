import { StyleSheet, } from 'react-native';
import {
  ios,
} from './../../../configs';
import { convertWidth } from './../../../utils'

export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    height: ios.constant.headerSize.height - ios.constant.headerSize.paddingTop,
    width: '100%',
  },
  bitmarkAccountHelpIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    marginRight: 19,
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
    borderBottomColor: '#E5E5E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: convertWidth(337),
    paddingBottom: 10,
    minHeight: 30,
  },
  accountNumberValue: {
    fontFamily: 'Andale Mono',
    fontWeight: '900',
    fontSize: 16,
    lineHeight: 19,
    width: 245,
    marginLeft: convertWidth(7),
    color: '#0060F2',

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
    fontSize: 15,
    marginTop: 20,
    width: convertWidth(337),
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

  authorizedLabel: {
    marginTop: 27,
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 16,
  },
  noAuthorizedMessage: {
    fontFamily: 'Avenir Light',
    fontWeight: '300',
    fontSize: 15,
    marginTop: 16,
  },
  authorizedItem: {
    marginTop: 13,
    flexDirection: 'column',
  },
  authorizedItemTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#A4B5CD',
  },
  authorizedItemTitleText: {
    fontFamily: 'Avenir Light',
    fontSize: 14,
  },
  authorizedItemRemoveButton: {
    padding: 4,
  },
  authorizedItemRemoveButtonText: {
    fontFamily: 'Avenir Light',
    fontWeight: '900',
    fontSize: 14,
    color: '#0060F2',
  },
  authorizedItemDescription: {
    flexDirection: 'row',
    marginTop: 17,
  },
  authorizedItemDescriptionIcon: {
    width: 58,
    height: 58,
    resizeMode: 'contain',
  },
  authorizedItemDescriptionText: {
    marginLeft: convertWidth(22),
    width: convertWidth(257),
    fontFamily: 'Avenir Light',
    fontWeight: '300',
    fontSize: 15,
  },

});
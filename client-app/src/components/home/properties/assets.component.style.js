import { StyleSheet, Platform, Dimensions } from 'react-native';
import {
  ios,
  android,
  config
} from './../../../configs';
import { convertWidth } from '../../../utils/index';

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
    width: config.disabel_markets ? '50%' : '33.3%',
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
  messageNoAssetArea: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
  },
  messageNoAssetLabel: {
    marginTop: 46,
    width: convertWidth(337),
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 17,
    lineHeight: 19,
    color: '#0060F2'
  },
  messageNoAssetContent: {
    marginTop: 46,
    width: convertWidth(337),
    fontFamily: 'Avenir Light',
    fontWeight: '300',
    fontSize: 17,
    lineHeight: 19,
  },
  addFirstPropertyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: '#0060F2',
    marginTop: 30,
    width: convertWidth(337),
    height: 42,
  },
  addFirstPropertyButtonText: {
    fontFamily: 'Avenir black',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    color: 'white'
  },

  assetRowArea: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    borderBottomColor: '#EDF0F4',
    borderBottomWidth: 1,
    paddingLeft: convertWidth(20),
    paddingRight: convertWidth(20),
    paddingTop: 18,
    paddingBottom: 30,
  },
  assetImage: {
    width: 62,
    height: 62,
    resizeMode: 'contain',
  },
  assetInfoArea: {
    flexDirection: 'column',
    width: '100%',
  },
  assetName: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 14,
    lineHeight: 16,
    width: '100%',
  },
  assetCreatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  assetCreatorBound: {
    fontFamily: 'Avenir Light',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 16,
  },
  assetCreator: {
    fontFamily: 'Avenir Light',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 16,
    width: convertWidth(200),
  },
  assetBitmarkTitle: {
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'flex-end',
    width: '100%',
  },
  assetBitmarkPending: {
    fontFamily: 'Andale Mono',
    fontWeight: '500',
    fontSize: 13,
    color: '#999999',
  },
  assetBitmarksNumber: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 13,
    color: '#0060F2',
    marginRight: 5,
  },
  assetBitmarksDetail: {
    width: 6,
    height: 12,
    resizeMode: 'contain',
  },

  globalArea: {
    flexDirection: 'row',
    borderTopColor: '#C0CCDF',
    borderTopWidth: 1,
    height: deviceSize.height - constant.bottomTabsHeight - constant.headerSize.height - constant.blankFooter - constant.subTabSizeHeight,
    backgroundColor: 'white',
  },
});
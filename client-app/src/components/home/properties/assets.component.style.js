import { StyleSheet, Platform, Dimensions } from 'react-native';
import {
  ios,
  android
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
    width: 25,
    height: 25,
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
    width: '33.3%',
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
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
  },
  assetImage: {
    width: 62,
    height: 62,
    resizeMode: 'contain',
    marginLeft: 20,
  },
  assetInfoArea: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginLeft: 20,
    height: 62,
    width: 140,
  },
  assetCreatedDate: {
    fontFamily: 'Andale Mono',
    fontSize: 10,
    lineHeight: 12,
  },
  assetName: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 12,
    lineHeight: 14,
  },
  assetCreator: {
    fontFamily: 'Avenir Light',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 14,
    width: 140,
  },

  assetBitmark: {
    height: 62,
    width: 130,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  assetBitmarkPending: {
    fontFamily: 'Avenir Heavy',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 14,
    color: '#999999',
    marginRight: 10,
    fontStyle: 'italic'
  },
  assetBitmarkNormal: {
    width: 40,
    height: 62,
    flexDirection: 'row',
  },
  assetBitmarksNumber: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 12,
    lineHeight: 14,
    color: '#0060F2',
    marginRight: 5,
  },
  assetBitmarksDetail: {
    width: 7,
    height: 14,
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
import { StyleSheet } from 'react-native';
import {
  ios,
} from './../../../configs';
import { convertWidth } from '../../../utils/index';

export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'white',
    // borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    height: ios.constant.headerSize.height - ios.constant.headerSize.paddingTop,
    width: '100%',
    // borderWidth: 1,
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
    shadowColor: 'black',
    shadowOffset: { height: 0 },
    shadowRadius: 3,
    zIndex: 1,
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
    backgroundColor: 'white',
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
    minHeight: 42,
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
    paddingLeft: convertWidth(19),
    paddingRight: convertWidth(19),
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
    fontFamily: 'Andale Mono',
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
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingBottom: 2,
  },
});
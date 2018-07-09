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
    width: '33.3%',
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
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    height: 35,
  },
  subTabButtonText: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 14,
    lineHeight: 16,
    textAlign: 'center',
    flexDirection: 'row',
    alignItems: 'center',
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
    width: convertWidth(375),
    minHeight: 45,
    position: 'absolute',
    bottom: 0,
  },
  addFirstPropertyButtonText: {
    fontFamily: 'Avenir black',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    color: 'white'
  },
  newItem: {
    backgroundColor: '#0060F2',
    width: 10, height: 10,
    position: 'absolute', left: convertWidth(6), top: 10,
    borderWidth: 1, borderRadius: 5, borderColor: '#0060F2'
  },

  assetRowArea: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    borderBottomColor: '#EDF0F4',
    borderBottomWidth: 1,
    paddingLeft: convertWidth(28),
    paddingRight: convertWidth(19),
    paddingTop: 18,
    paddingBottom: 18,
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
  assetCreatedAt: {
    fontFamily: 'Andale Mono',
    fontSize: 13,
    lineHeight: 16,
    width: '100%',
  },
  assetName: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 14,
    lineHeight: 16,
    width: '100%',
    marginTop: 10,
  },
  assetCreatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  assetQuantityArea: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'space-between',
    width: convertWidth(329),
  },
  assetQuantity: {
    fontFamily: 'Andale Mono',
    fontSize: 13,
    color: '#0060F2'
  },
  assetQuantityPending: {
    fontFamily: 'Andale Mono',
    fontSize: 13,
    color: '#999999'
  },
  assetQuantityPendingIcon: {
    width: 13,
    height: 17,
    resizeMode: 'contain',
    marginRight: 3,
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


  trackingRow: {
    width: '100%',
    flexDirection: 'column',
    borderBottomColor: '#EDF0F4',
    borderBottomWidth: 1,
    paddingLeft: convertWidth(28),
    paddingRight: convertWidth(19),
    paddingTop: 22,
    paddingBottom: 22,
  },
  trackingRowAssetName: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 14,
    lineHeight: 16,
    width: '100%',
  },
  trackingRowUpdated: {
    marginTop: 10,
    fontFamily: 'Andale Mono',
    fontSize: 14,
    lineHeight: 16,
    color: '#0060F2',
    width: '100%',
  },
  trackingRowCurrentOwner: {
    marginTop: 12,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'space-between',
  },
  trackingRowCurrentOwnerText: {
    fontFamily: 'Andale Mono',
    fontSize: 14,
    lineHeight: 16,
    color: '#0060F2',
  },

  globalArea: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingBottom: 2,
  },
});
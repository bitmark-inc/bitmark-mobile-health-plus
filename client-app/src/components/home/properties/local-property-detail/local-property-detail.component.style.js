import { StyleSheet, Platform } from 'react-native';
import { convertWidth } from './../../../../utils';
import {
  ios,
  android // TODO
} from './../../../../configs';
let constant = Platform.select({
  ios: ios.constant,
  android: android.constant
});

export default StyleSheet.create({
  body: {
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    backgroundColor: 'white',
  },
  threeDotIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    marginRight: 15,
  },
  content: {
    flexDirection: 'column',
  },
  topArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 147,
    width: convertWidth(375),
  },
  assetImage: {
    height: 130,
    width: convertWidth(130),
    resizeMode: 'contain',
    marginLeft: convertWidth(20),
    marginTop: 17,
  },
  topButtonsArea: {
    position: 'absolute',
    top: constant.headerSize.height,
    right: 0,
    zIndex: 10,
    width: convertWidth(198),
    height: 135,
    backgroundColor: '#F5F5F5',
  },
  downloadAssetButton: {
    width: '100%',
    height: 45,
    flexDirection: 'column',
    paddingLeft: convertWidth(19),
    paddingRight: convertWidth(19),
    paddingTop: 12,
    paddingBottom: 12,
  },
  downloadAssetButtonText: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 16,
    lineHeight: 19,
    // color: '#A4B5CD',
    textAlign: 'right',
  },
  topButton: {
    width: '100%',
    height: 45,
    flexDirection: 'column',
    paddingLeft: convertWidth(19),
    paddingRight: convertWidth(19),
    paddingTop: 12,
    paddingBottom: 12,
  },
  topButtonText: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 16,
    lineHeight: 19,
    color: '#0060F2',
    textAlign: 'right',
  },
  copiedAssetIddButtonText: {
    fontFamily: 'Avenir Black',
    fontWeight: '400',
    fontSize: 8,
    lineHeight: 9,
    color: '#0060F2',
    marginTop: 5,
    fontStyle: 'italic',
    textAlign: 'right',
  },
  bottomImageBar: {
    borderWidth: 2,
    width: convertWidth(130),
    marginLeft: convertWidth(20),
  },
  assetName: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 18,
    lineHeight: 21,
    marginLeft: convertWidth(20),
    marginTop: 34,
  },
  assetCreateAt: {
    fontFamily: 'Andale Mono',
    fontSize: 13,
    lineHeight: 16,
    marginLeft: convertWidth(20),
    height: 29,
    width: convertWidth(337),
  },
  bottomAssetNameBar: {
    borderWidth: 1,
    width: convertWidth(130),
    marginLeft: convertWidth(20),
  },

  provenanceLabel: {
    fontFamily: 'Avenir Black',
    fontSize: 14,
    lineHeight: 16,
    fontWeight: '900',
    marginLeft: convertWidth(20),
    marginTop: 25,
    height: 25,
  },
  provenancesArea: {
  },
  provenancesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    width: convertWidth(337),
    height: 18,
    marginLeft: convertWidth(20),
    marginTop: 18,
  },
  provenancesHeaderLabelTimestamp: {
    fontFamily: 'Andale Mono',
    fontSize: 13,
    lineHeight: 14,
    width: convertWidth(176),
  },
  provenancesHeaderLabelOwner: {
    fontFamily: 'Andale Mono',
    fontSize: 13,
    lineHeight: 14,
    width: convertWidth(161),
  },
  provenanceListArea: {
    flexDirection: 'row',
  },
  provenancesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: convertWidth(340),
    marginLeft: convertWidth(20),
    height: 36,
    marginTop: 9,
  },
  provenancesRowTimestamp: {
    fontFamily: 'Andale Mono',
    fontSize: 13,
    lineHeight: 14,
    width: convertWidth(176),
  },
  provenancesRowOwnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  provenancesRowOwnerBound: {
    fontFamily: 'Andale Mono',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 16,
  },
  provenancesRowOwner: {
    fontFamily: 'Andale Mono',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 16,
    width: convertWidth(118),
  },
  listingButtonArea: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 37,
  },
  listingButton: {
    width: convertWidth(337),
    backgroundColor: '#0060F2',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
  },
  listingButtonText: {
    fontFamily: 'Avenir Light',
    fontWeight: '900',
    fontSize: 14,
    lineHeight: 16,
    color: 'white',
  },
});
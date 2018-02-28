import { StyleSheet } from 'react-native';
import { convertWidth } from './../../../../utils';


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
    top: 0,
    right: 0,
    zIndex: 10,
    width: convertWidth(160),
    height: 50,
    backgroundColor: '#F5F5F5',
  },
  copyBitmarkIddButton: {
    width: '100%',
    height: 31,
    flexDirection: 'column',
  },
  copyBitmarkIddButtonText: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 14,
    lineHeight: 16,
    marginLeft: convertWidth(20),
    marginTop: 13,
    color: '#0060F2',
  },
  copiedAssetIddButtonText: {
    fontFamily: 'Avenir Black',
    fontWeight: '400',
    fontSize: 8,
    lineHeight: 9,
    color: '#0060F2',
    marginLeft: convertWidth(20),
    marginTop: 5,
    fontStyle: 'italic'
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
    height: 29,
  },
  assetCreateAt: {
    fontFamily: 'Avenir Light',
    fontWeight: '400',
    fontSize: 14,
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
    marginTop: 29,
    height: 25,
  },
  provenancesArea: {
  },
  provenancesHeader: {
    flexDirection: 'row',
    width: convertWidth(337),
    marginLeft: convertWidth(20),
    height: 25,
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
    width: convertWidth(340),
    marginLeft: convertWidth(20),
    height: 25,
  },
  provenancesRowTimestamp: {
    fontFamily: 'Andale Mono',
    fontSize: 13,
    lineHeight: 14,
    width: convertWidth(157),
  },
  provenancesRowOwner: {
    fontFamily: 'Andale Mono',
    fontSize: 13,
    lineHeight: 14,
    marginLeft: convertWidth(19),
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
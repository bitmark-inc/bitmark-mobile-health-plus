import { StyleSheet } from 'react-native';
import { convertWidth } from './../../../../utils';


export default StyleSheet.create({
  body: {
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    backgroundColor: 'white',
  },
  threeDotIcon: {
    width: 20,
    height: 5,
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
    width: 130,
    resizeMode: 'contain',
    marginLeft: 19,
    marginTop: 17,
  },
  topButtonsArea: {
    height: 56,
    width: convertWidth(160),
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
    marginLeft: 23,
    marginTop: 13,
  },
  copiedAssetIddButtonText: {
    fontFamily: 'Avenir Black',
    fontWeight: '400',
    fontSize: 8,
    lineHeight: 9,
    color: '#0060F2',
    marginLeft: 23,
    marginTop: 5,
    fontStyle: 'italic'
  },
  bottomImageBar: {
    borderWidth: 2,
    width: 130,
    marginLeft: 19,
    marginTop: 26,
  },
  assetName: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 18,
    lineHeight: 21,
    marginLeft: 19,
    marginTop: 7,
    height: 29,
  },
  assetCreateAt: {
    fontFamily: 'Avenir Light',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 16,
    marginLeft: 19,
    height: 29,
  },
  bottomAssetNameBar: {
    borderWidth: 1,
    width: 130,
    marginLeft: 19,
  },

  provenanceLabel: {
    fontFamily: 'Avenir Black',
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '900',
    marginLeft: 19,
    marginTop: 29,
    height: 25,
  },
  provenancesArea: {
  },
  provenancesHeader: {
    flexDirection: 'row',
    width: convertWidth(340),
    marginLeft: 19,
    height: 25,
  },
  provenancesHeaderLabel: {
    fontFamily: 'Andale Mono',
    fontSize: 10,
    lineHeight: 12,
    minWidth: 170,
  },
  provenanceListArea: {
    flexDirection: 'row',
  },
  provenancesRow: {
    flexDirection: 'row',
    width: convertWidth(340),
    marginLeft: 19,
    height: 25,
  },
  provenancesRowLabel: {
    fontFamily: 'Andale Mono',
    fontSize: 12,
    lineHeight: 14,
    minWidth: 70,
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
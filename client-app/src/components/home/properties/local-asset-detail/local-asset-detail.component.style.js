import { StyleSheet, } from 'react-native';

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
    height: 90,
    width: convertWidth(160),
    backgroundColor: '#F5F5F5',
  },
  downloadAssetButton: {
    width: '100%',
    height: 31,
    marginTop: 13,
    flexDirection: 'column',
  },
  downloadAssetButtonText: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 14,
    lineHeight: 16,
    marginLeft: 23,
  },
  copyAssetIddButton: {
    width: '100%',
    height: 31,
    flexDirection: 'column',
  },
  copyAssetIddButtonText: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 14,
    lineHeight: 16,
    marginLeft: 23,
  },
  copiedAssetIddButtonText: {
    fontFamily: 'Avenir Black',
    fontWeight: '500',
    fontSize: 8,
    lineHeight: 9,
    fontStyle: 'italic',
    color: '#0060F2',
    marginLeft: 23,
    marginTop: 5,
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
  metadataArea: {
    marginTop: 26,
    flexDirection: 'row',
  },
  metadataItem: {
    width: convertWidth(340),
    flexDirection: 'column',
    marginLeft: 19,
  },
  metadataItemLabel: {
    fontFamily: 'Avenir Black',
    fontSize: 14,
    lineHeight: 16,
    fontWeight: '900',
    height: 25,
  },
  metadataItemValue: {
    fontFamily: 'Avenir Black',
    fontSize: 14,
    lineHeight: 16,
    fontWeight: '400',
    height: 25,
  },

  bitmarkLabel: {
    fontFamily: 'Avenir Black',
    fontSize: 14,
    lineHeight: 16,
    fontWeight: '900',
    marginLeft: 19,
    marginTop: 29,
    height: 25,
  },
  bitmarksArea: {

  },
  bitmarksHeader: {
    flexDirection: 'row',
    width: convertWidth(340),
    marginLeft: 19,
    height: 25,
  },
  bitmarksHeaderLabel: {
    fontFamily: 'Andale Mono',
    fontSize: 10,
    lineHeight: 12,
    minWidth: convertWidth(70),
  },
  bitmarkListArea: {
    flexDirection: 'row',
  },
  bitmarksRow: {
    flexDirection: 'row',
    width: convertWidth(340),
    marginLeft: 19,
    height: 25,
  },
  bitmarksRowNo: {
    fontFamily: 'Andale Mono',
    fontSize: 10,
    lineHeight: 12,
    minWidth: convertWidth(70),
  },
  bitmarksRowNoPending: {
    fontFamily: 'Andale Mono',
    fontSize: 10,
    lineHeight: 12,
    minWidth: convertWidth(70),
    color: '#CCCCCC',
  },
  bitmarksRowListingButton: {
    height: 25,
  },
  bitmarksRowListingButtonText: {
    fontFamily: 'Avenir Black',
    fontSize: 14,
    lineHeight: 16,
    fontWeight: '900',
    color: '#0060F2'
  },
  bitmarkPending: {
    fontFamily: 'Avenir Black',
    fontSize: 14,
    lineHeight: 16,
    fontWeight: '900',
    color: '#CCCCCC',
    fontStyle: 'italic'
  }

});
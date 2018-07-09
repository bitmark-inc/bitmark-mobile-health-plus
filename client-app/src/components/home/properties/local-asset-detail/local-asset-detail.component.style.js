import { StyleSheet, } from 'react-native';
import { convertWidth } from './../../../../utils';

export default StyleSheet.create({
  body: {
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    backgroundColor: 'white',
    zIndex: 1,
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
  topButtonsArea: {
    position: 'absolute',
    top: 2,
    right: 0,
    zIndex: 10,
    width: 198,
    backgroundColor: '#F5F5F5',
  },
  downloadAssetButton: {
    width: '100%',
    minHeight: 45,
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
    textAlign: 'right',
  },
  copyAssetIddButton: {
    width: '100%',
    minHeight: 45,
    flexDirection: 'column',
    paddingLeft: convertWidth(19),
    paddingRight: convertWidth(19),
    paddingTop: 12,
    paddingBottom: 12,
  },
  copyAssetIddButtonText: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 16,
    lineHeight: 19,
    color: '#0060F2',
    textAlign: 'right',
  },
  copiedAssetIddButtonText: {
    fontFamily: 'Avenir Black',
    fontWeight: '600',
    fontSize: 8,
    lineHeight: 9,
    fontStyle: 'italic',
    color: '#0060F2',
    textAlign: 'right',
  },
  bottomImageBar: {
    borderWidth: 2,
    width: convertWidth(126),
    marginLeft: convertWidth(19),
  },
  assetName: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 18,
    lineHeight: 21,
    marginLeft: convertWidth(19),
    marginTop: 34,
    width: convertWidth(337),
  },
  assetCreatorRow: {
    flexDirection: 'column',
    marginBottom: 10,
    marginLeft: convertWidth(19),
    width: convertWidth(336),
    height: 29,
  },
  assetCreatorBound: {
    fontFamily: 'Andale Mono',
    fontWeight: '500',
    fontSize: 13,
    lineHeight: 16,
  },
  assetCreateAt: {
    fontFamily: 'Andale Mono',
    fontWeight: '400',
    fontSize: 13,
    lineHeight: 16,
    width: convertWidth(240),
  },
  bottomAssetNameBar: {
    borderWidth: 1,
    width: convertWidth(126),
    marginLeft: convertWidth(19),
  },
  metadataArea: {
    marginTop: 26,
    flexDirection: 'row',
  },
  metadataItem: {
    width: convertWidth(340),
    flexDirection: 'row',
    marginLeft: convertWidth(19),
  },
  metadataItemLabel: {
    fontFamily: 'Andale Mono',
    fontSize: 13,
    color: 'black',
    width: convertWidth(117),
    marginTop: 1,
  },
  metadataItemValue: {
    fontFamily: 'Avenir Black',
    fontSize: 14,
    fontWeight: '400',
    width: convertWidth(196),
    marginLeft: convertWidth(22),
  },

  bitmarkLabel: {
    fontFamily: 'Avenir Black',
    fontSize: 14,
    lineHeight: 16,
    fontWeight: '900',
    marginLeft: convertWidth(19),
    marginTop: 27,
  },
  bitmarksArea: {

  },
  bitmarksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: convertWidth(337),
    marginLeft: convertWidth(19),
    marginTop: 18,
    marginBottom: 9,
  },
  bitmarksHeaderLabel: {
    fontFamily: 'Andale Mono',
    fontSize: 13,
    lineHeight: 15,
    width: convertWidth(117),
    backgroundColor: '#F5F5F5',
    marginLeft: 2,
    paddingLeft: convertWidth(4),
  },
  bitmarkListArea: {
    flexDirection: 'row',
  },
  bitmarksRow: {
    flexDirection: 'row',
    width: convertWidth(340),
    paddingLeft: convertWidth(21),
    height: 36,
    paddingTop: 10,
    paddingBottom: 10,
  },
  bitmarkNotView: {
    backgroundColor: '#0060F2',
    width: 10, height: 10,
    position: 'absolute', left: convertWidth(9), top: 12,
    borderWidth: 1, borderRadius: 5, borderColor: '#0060F2'
  },
  bitmarksRowNo: {
    fontFamily: 'Andale Mono',
    fontSize: 13,
    width: convertWidth(117),
    paddingLeft: convertWidth(4),
    paddingRight: convertWidth(19),
  },
  bitmarksRowNoPending: {
    fontFamily: 'Andale Mono',
    fontSize: 13,
    width: convertWidth(94),
    color: '#CCCCCC',
    paddingLeft: convertWidth(4),
  },
  bitmarkViewButton: {
    width: convertWidth(102),
    marginLeft: convertWidth(2),
    paddingLeft: convertWidth(4),
  },
  bitmarkViewButtonText: {
    fontFamily: 'Andale Mono',
    fontSize: 13,
    color: '#0060F2',
  },
  bitmarkTransferButton: {
    height: 25,
    marginLeft: convertWidth(27),
  },
  bitmarkTransferButtonText: {
    fontFamily: 'Andale Mono',
    fontSize: 13,
    lineHeight: 16,
    color: '#0060F2'
  },

  assetPreview: {
    marginLeft: convertWidth(19),
    marginRight: convertWidth(19),
    height: 125
  }
});
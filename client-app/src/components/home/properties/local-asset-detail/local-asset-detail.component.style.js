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
    top: 0,
    right: 0,
    zIndex: 10,
    width: convertWidth(198),
    height: 90,
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
    textAlign: 'right',
  },
  copyAssetIddButton: {
    width: '100%',
    height: 45,
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
  assetCreatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginLeft: convertWidth(20),
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
    marginLeft: convertWidth(20),
  },
  metadataArea: {
    marginTop: 26,
    flexDirection: 'row',
  },
  metadataItem: {
    width: convertWidth(340),
    flexDirection: 'row',
    marginLeft: convertWidth(20),
  },
  metadataItemLabel: {
    fontFamily: 'Andale Mono',
    fontSize: 13,
    fontWeight: '900',
    color: '#0060F2',
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
    marginLeft: convertWidth(20),
    marginTop: 27,
    height: 25,
  },
  bitmarksArea: {

  },
  bitmarksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: convertWidth(340),
    marginLeft: convertWidth(20),
    height: 18,
    backgroundColor: '#F5F5F5',
    marginTop: 18,
  },
  bitmarksHeaderLabel: {
    fontFamily: 'Andale Mono',
    fontSize: 13,
    lineHeight: 15,
    minWidth: convertWidth(59),
  },
  bitmarkListArea: {
    flexDirection: 'row',
  },
  bitmarksRow: {
    flexDirection: 'row',
    width: convertWidth(340),
    marginLeft: convertWidth(20),
    height: 36,
    paddingTop: 10,
    paddingBottom: 10,
  },
  bitmarksRowNo: {
    fontFamily: 'Andale Mono',
    fontSize: 13,
    minWidth: convertWidth(59),
  },
  bitmarksRowNoPending: {
    fontFamily: 'Andale Mono',
    fontSize: 13,
    minWidth: convertWidth(59),
    color: '#CCCCCC',
  },
  bitmarkViewButton: {
    height: 36,
    width: convertWidth(120),
  },
  bitmarkViewButtonText: {
    fontFamily: 'Andale Mono',
    fontSize: 13,
    color: '#0060F2',
  },
  bitmarkTransferButton: {
    height: 25,
    marginLeft: convertWidth(15),
  },
  bitmarkTransferButtonText: {
    fontFamily: 'Andale Mono',
    fontSize: 13,
    lineHeight: 16,
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
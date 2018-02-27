import { StyleSheet, } from 'react-native';

import { convertWidth } from './../../../../utils';

export default StyleSheet.create({
  scroll: {
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    backgroundColor: 'white',
  },
  body: {
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    backgroundColor: 'white',
  },

  addFileArea: {
    flexDirection: 'column',
    width: '100%',
  },
  addFileLabel: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 16,
    lineHeight: 19,
    marginLeft: convertWidth(20),
    marginTop: 40,
    height: 28,
  },
  fileInputError: {
    fontFamily: 'Avenir Black',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 19,
    marginLeft: convertWidth(20),
    color: '#FF003C',
    marginTop: 10,
    width: convertWidth(340),
  },
  addFileButton: {
    marginLeft: convertWidth(20),
    padding: 5,
    borderBottomColor: '#0060F2',
    borderBottomWidth: 1,
    width: convertWidth(330),
  },
  addFileButtonText: {
    fontFamily: 'Avenir Black',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 16,
    color: '#C2C2C2',
  },

  infoArea: {
    flexDirection: 'column',
  },
  fingerprintLabel: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 16,
    lineHeight: 19,
    marginLeft: convertWidth(20),
    marginTop: 28,
    height: 28,
  },
  fingerprintValue: {
    fontFamily: 'Andale Mono',
    fontWeight: '300',
    fontSize: 14,
    lineHeight: 16,
    color: '#0060F2',
    marginLeft: convertWidth(20),
    width: convertWidth(330),
  },
  fingerprintInfoArea: {
    flexDirection: 'row',
    height: 24,
    marginTop: 10,
  },
  fingerprintInfoMessage: {
    fontFamily: 'Avenir Black',
    fontWeight: '300',
    fontSize: 12,
    lineHeight: 14,
    marginLeft: convertWidth(20),
  },
  fingerprintInfoFilename: {
    fontFamily: 'Avenir Black',
    fontWeight: '800',
    fontSize: 12,
    lineHeight: 14,
    maxWidth: convertWidth(180),
  },
  fingerprintInfoFileFormat: {
    fontFamily: 'Avenir Black',
    fontWeight: '800',
    fontSize: 12,
    lineHeight: 14,
  },
  assetInfoLabel: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 16,
    lineHeight: 19,
    marginLeft: convertWidth(20),
    marginTop: 18,
    height: 28,
  },
  assetNameLabel: {
    fontFamily: 'Avenir Light',
    fontWeight: '300',
    fontSize: 14,
    lineHeight: 16,
    marginLeft: convertWidth(20),
    marginTop: 5,
  },
  assetNameInput: {
    marginTop: 12,
    marginLeft: convertWidth(20),
    width: convertWidth(330),
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    height: 25,
    fontFamily: 'Andale Mono',
    fontWeight: '300',
    fontSize: 14,
    lineHeight: 16,
  },
  assetNameInputError: {
    fontFamily: 'Avenir Black',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 19,
    marginLeft: convertWidth(20),
    color: '#FF003C',
    marginTop: 10,
    width: convertWidth(330),
  },
  metadataLabel: {
    fontFamily: 'Avenir Light',
    fontWeight: '300',
    fontSize: 14,
    lineHeight: 16,
    marginLeft: convertWidth(20),
    marginTop: 21,
  },
  metadataArea: {
    flexDirection: 'row',
  },
  metadataList: {
  },
  metadataField: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  metadataFieldButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 6,
    marginLeft: convertWidth(20),
    borderBottomWidth: 1,
    height: '100%',
  },
  metadataFieldLabel: {
    width: convertWidth(100),
    fontFamily: 'Andale Mono',
    fontWeight: '300',
    fontSize: 14,
    lineHeight: 16,
  },
  metadataFieldValue: {
    width: convertWidth(170),
    fontFamily: 'Andale Mono',
    fontWeight: '300',
    fontSize: 14,
    lineHeight: 16,
  },
  metadataFieldRemove: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
  addMetadataButton: {
    padding: 5,
    marginLeft: convertWidth(20),
    width: convertWidth(330),
    marginTop: 18,
  },
  addMetadataButtonText: {
    fontFamily: 'Avenir Black',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 16,
    color: '#C2C2C2',
  },
  metadataInputError: {
    fontFamily: 'Avenir Black',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 19,
    marginLeft: convertWidth(20),
    color: '#FF003C',
    marginTop: 10,
    width: convertWidth(330),
  },
  quantityLabel: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 16,
    lineHeight: 19,
    marginLeft: convertWidth(20),
    marginTop: 18,
    height: 28,
  },
  quantityInput: {
    marginTop: 12,
    marginLeft: convertWidth(20),
    width: convertWidth(330),
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    height: 25,
    fontFamily: 'Andale Mono',
    fontWeight: '300',
    fontSize: 14,
    lineHeight: 16,
  },
  quantityInputError: {
    fontFamily: 'Avenir Black',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 19,
    marginLeft: convertWidth(20),
    color: '#FF003C',
    marginTop: 10,
    width: convertWidth(347),
  },
  ownershipClaimLabel: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 16,
    lineHeight: 19,
    marginLeft: convertWidth(20),
    marginTop: 40,
    height: 28,
  },
  ownershipClaimMessage: {
    fontFamily: 'Avenir Light',
    fontWeight: '300',
    fontSize: 14,
    lineHeight: 16,
    color: '#C1C1C1',
    marginLeft: convertWidth(20),
    width: convertWidth(332),
    marginTop: 12,
  },

  issueError: {
    fontFamily: 'Avenir Black',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 19,
    marginLeft: convertWidth(20),
    color: '#FF003C',
    marginTop: 10,
    width: convertWidth(347),
  },

  issueButton: {
    marginLeft: convertWidth(20),
    width: convertWidth(330),
    height: 42,
    borderTopWidth: 2,
    backgroundColor: '#F5F5F5',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  issueButtonText: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 17,
    lineHeight: 20,
    color: '#0060F2',
  },
});
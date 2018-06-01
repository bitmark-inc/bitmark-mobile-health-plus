import { StyleSheet } from 'react-native';

import { convertWidth } from './../../../../../utils';
import { iosConstant } from '../../../../../configs/ios/ios.config';

export default StyleSheet.create({
  scroll: {
    flexDirection: 'column',
    width: '100%',
    backgroundColor: 'white',
  },
  body: {
    flex: 1,
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    backgroundColor: 'white',
  },

  infoArea: {
    flexDirection: 'column',
  },
  fingerprintLabel: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 16,
    lineHeight: 19,
    marginLeft: convertWidth(19),
    marginTop: 28,
    height: 28,
  },
  fingerprintValue: {
    fontFamily: 'Andale Mono',
    fontWeight: '300',
    fontSize: 14,
    lineHeight: 16,
    color: '#0060F2',
    marginLeft: convertWidth(19),
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
    marginLeft: convertWidth(19),
  },
  fingerprintInfoFilename: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 12,
    lineHeight: 14,
    maxWidth: convertWidth(180),
  },
  fingerprintInfoFileFormat: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 12,
    lineHeight: 14,
  },

  assetTypeLabel: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 16,
    lineHeight: 19,
    marginLeft: convertWidth(19),
    marginTop: 20,
    height: 28,
  },

  assetTypeTypeInfoContainer: {
    marginLeft: convertWidth(19)
  },

  assetTypeTypeInfo: {
    fontFamily: 'Avenir Light',
    fontWeight: '300',
    fontSize: 17
  },

  assetTypeChooser: {
    flex: 1,
    flexDirection: 'row',
    marginLeft: convertWidth(19),
    marginRight: convertWidth(19),
    borderColor: '#0060F2',
    borderWidth: 1
  },

  assetTypeActiveButton: {
    backgroundColor: '#0060F2',
    width: '50%',
    height: 29,
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center'
  },

  assetTypeActiveButtonText: {
    fontFamily: 'Avenir Light',
    color: '#FFFFFF',
    fontSize: 17
  },

  assetTypeInActiveButton: {
    backgroundColor: '#FFFFFF',
    width: '50%',
    height: 29,
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center'
  },

  assetTypeInActiveButtonText: {
    fontFamily: 'Avenir Light',
    color: 'rgba(0, 96, 242, 0.6)',
    fontSize: 17
  },

  assetTypeHelper: {
    flex: 1,
    marginTop: 10,
    marginLeft: convertWidth(19),
    marginRight: convertWidth(19)
  },

  assetTypeHelperLinkText: {
    fontFamily: 'Avenir Black',
    fontSize: 12,
    color: '#0060F2'
  },

  assetNameLabel: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 16,
    lineHeight: 19,
    marginLeft: convertWidth(19),
    marginTop: 30,
    height: 28,
  },
  existAssetName: {
    marginTop: 12,
    marginLeft: convertWidth(19),
    width: convertWidth(330),
    borderBottomWidth: 1,
    borderBottomColor: '#C2C2C2',
    minHeight: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },
  existAssetNameText: {
    borderBottomWidth: 1,
    borderBottomColor: '#C2C2C2',
    fontFamily: 'Avenir Light',
    fontWeight: '900',
    color: '#C2C2C2',
  },
  assetNameInput: {
    marginTop: 5,
    marginLeft: convertWidth(19),
    width: convertWidth(330),
    borderBottomWidth: 1,
    height: 25,
    fontFamily: 'Andale Mono',
    fontSize: 13,
  },
  assetNameInputError: {
    fontFamily: 'Avenir Black',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 19,
    marginLeft: convertWidth(19),
    color: '#FF003C',
    marginTop: 10,
    width: convertWidth(330),
  },

  metadataLabel: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 16,
    lineHeight: 19,
    marginLeft: convertWidth(19),
    marginTop: 29,
  },
  metadataDescription: {
    fontFamily: 'Avenir Light',
    fontWeight: '300',
    fontSize: 14,
    lineHeight: 16,
    marginLeft: convertWidth(19),
    marginTop: 5,
  },
  metadataArea: {
    flexDirection: 'row',
  },
  metadataList: {
  },
  metadataField: {
    flexDirection: 'row',
    width: '100%',
    paddingLeft: convertWidth(19),
    paddingRight: convertWidth(19),
    marginBottom: 15,
  },
  metadataFieldKeyRemoveButton: {
    flexDirection: 'row',
    height: '100%',
    marginTop: 11,
    width: convertWidth(15),
  },
  metadataFieldKeyRemoveIcon: {
    width: 10,
    height: 10,
    resizeMode: 'contain',
  },
  metadataFieldInfo: {
    flexDirection: 'column',
  },
  metadataFieldKeyArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#0060F2',
    height: 36,
    width: '100%',
  },
  metadataFieldKeyText: {
    fontFamily: 'Andale Mono',
    fontWeight: '300',
    fontSize: 14,
    marginLeft: 7,
    height: 19,
  },
  metadataFieldKeyEditIcon: {
    width: 10,
    height: 10,
    resizeMode: 'contain',
  },
  metadataFieldValue: {
    width: '100%',
    fontFamily: 'Andale Mono',
    fontWeight: '300',
    fontSize: 14,
    minHeight: 25,
    marginLeft: 7,
    marginTop: 8,
    marginBottom: 8,
  },
  metadataFieldValueBar: {
    borderBottomColor: '#0060F2',
    borderBottomWidth: 1,
  },

  metadataFieldButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: convertWidth(19),
    paddingRight: convertWidth(19),
  },
  addMetadataButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 5,
    paddingBottom: 5,
    paddingRight: 5,
    height: 36,
  },
  addMetadataButtonIcon: {
    width: 10,
    height: 10,
    resizeMode: 'contain',
  },
  addMetadataButtonText: {
    fontFamily: 'Andale Mono',
    fontSize: 14,
    color: '#C2C2C2',
  },
  metadataInputError: {
    fontFamily: 'Avenir Black',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 19,
    marginLeft: convertWidth(19),
    color: '#FF003C',
    marginTop: 10,
    width: convertWidth(330),
  },
  quantityLabel: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 16,
    lineHeight: 19,
    marginLeft: convertWidth(19),
    marginTop: 18,
    height: 28,
  },
  quantityInput: {
    marginTop: 12,
    marginLeft: convertWidth(19),
    width: convertWidth(330),
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
    marginLeft: convertWidth(19),
    color: '#FF003C',
    marginTop: 10,
    width: convertWidth(347),
  },
  ownershipClaimLabel: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 16,
    lineHeight: 19,
    marginLeft: convertWidth(19),
    marginTop: 40,
    height: 28,
  },
  ownershipClaimMessage: {
    fontFamily: 'Avenir Light',
    fontWeight: '300',
    fontSize: 14,
    lineHeight: 16,
    marginLeft: convertWidth(19),
    width: convertWidth(332),
    marginTop: 12,
    marginBottom: 20,
  },

  issueError: {
    fontFamily: 'Avenir Black',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 19,
    marginLeft: convertWidth(19),
    color: '#FF003C',
    marginTop: 10,
    width: convertWidth(347),
  },

  issueButton: {
    width: convertWidth(375),
    minHeight: 45 + iosConstant.blankFooter,
    borderTopWidth: 2,
    backgroundColor: '#F5F5F5',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    paddingBottom: Math.max(10, iosConstant.blankFooter),
  },
  issueButtonText: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 17,
    lineHeight: 19,
    color: '#0060F2',
  },
});
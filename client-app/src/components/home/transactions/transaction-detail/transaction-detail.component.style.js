import { StyleSheet, } from 'react-native';
import { convertWidth } from './../../../../utils'

export default StyleSheet.create({
  body: {
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    backgroundColor: 'white',
  },
  contentScroll: {
    flexDirection: 'column',
    width: '100%',
  },
  content: {
    flex: 1,
    flexDirection: 'column',
    paddingLeft: convertWidth(19),
    paddingRight: convertWidth(19),
  },
  assetName: {
    fontFamily: 'Avenir black',
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '900',
    marginTop: 38,
  },
  transferOfferContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
  },
  transferOfferSenderFix: {
    fontFamily: 'Avenir black',
    fontSize: 12,
    fontWeight: '700',
  },
  transferOfferSenderName: {
    fontFamily: 'Avenir black',
    fontSize: 13,
  },
  transferOfferAssetName: {
    fontFamily: 'Avenir black',
    fontSize: 13,
    fontWeight: '900',
    width: convertWidth(150),
  },
  externalArea: {
    marginTop: 44,
  },
  externalAreaRow: {
    flexDirection: 'row',
    marginTop: 9,
  },

  externalAreaRowLabel: {
    fontFamily: 'Andale Mono',
    fontSize: 13,
    color: '#0060F2',
    width: convertWidth(117),
  },
  externalAreaRowValue: {
    fontFamily: 'Andale Mono',
    fontSize: 13,
    width: convertWidth(198),
    color: '#0060F2',
    flexDirection: 'row',
    alignItems: 'center'
  },
  externalAreaRowValueIssuerView: {
    width: convertWidth(198),
    flexDirection: 'row',
    alignItems: 'center'
  },
  externalAreaRowValueIssuer_: {
    fontFamily: 'Andale Mono',
    color: '#0060F2',
    fontSize: 13,
  },
  externalAreaRowValueIssuer: {
    fontFamily: 'Andale Mono',
    fontSize: 13,
    width: convertWidth(190),
    color: '#0060F2',
  },
  metadataArea: {
    marginTop: 20,
  },
  metadataRowValue: {
    fontFamily: 'Avenir black',
    fontSize: 13,
    width: convertWidth(198),
    marginBottom: 5,
  },
  buttonsArea: {
    flexDirection: 'row',
    alignItems: 'center',
    width: convertWidth(338),
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: '#F5F5F5',
  },
  rejectButton: {
    borderTopWidth: 3,
    borderTopColor: '#A4B5CD',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 12.5,
    paddingBottom: 12.5,
    width: convertWidth(169),
    minHeight: 45,
  },
  rejectButtonText: {
    fontFamily: 'Avenir black',
    fontSize: 16,
    fontWeight: '900',
    color: '#A4B5CD',
  },
  acceptButton: {
    borderTopWidth: 3,
    borderTopColor: '#0060F2',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 12.5,
    paddingBottom: 12.5,
    width: convertWidth(169),
    minHeight: 45,
  },
  acceptButtonText: {
    fontFamily: 'Avenir black',
    fontSize: 16,
    fontWeight: '900',
    color: '#0060F2',
  }
});
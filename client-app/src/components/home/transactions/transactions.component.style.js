import { StyleSheet, Platform, Dimensions } from 'react-native';
import {
  ios,
  android // TODO
} from './../../../configs';
import { convertWidth } from '../../../utils';

const deviceSize = Dimensions.get('window');

let constant = Platform.select({
  ios: ios.constant,
  android: android.constant
});

export default StyleSheet.create({
  body: {
    flexDirection: 'column',
    alignItems: 'center',
    height: deviceSize.height - (constant.bottomTabsHeight + constant.blankFooter),
    width: '100%',
    backgroundColor: 'white',
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
    width: '50%',
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
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 35,
  },
  subTabButtonText: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 14,
    lineHeight: 16,
    textAlign: 'center',
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

  transferOfferRow: {
    width: '100%',
    flexDirection: 'column',
    paddingLeft: convertWidth(19),
    paddingRight: convertWidth(19),
    paddingBottom: 18,
    paddingTop: 18,
    borderBottomColor: '#EFEFEF',
    borderBottomWidth: 1,
  },
  transferOfferTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  transferOfferTitleType: {
    fontFamily: 'Andale Mono',
    fontSize: 13,
    fontWeight: '700',
    color: '#0060F2',
    width: convertWidth(220),
  },
  transferOfferTitleTime: {
    fontFamily: 'Andale Mono',
    fontSize: 13,
    fontWeight: '700',
    width: convertWidth(90),
    marginLeft: convertWidth(12),
  },
  transferOfferTitleIcon: {
    width: 12,
    height: 12,
    resizeMode: 'contain',
    marginLeft: convertWidth(3),
  },
  transferOfferContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  transferOfferSenderFix: {
    fontFamily: 'Andale Mono',
    fontSize: 12,
    fontWeight: '700',
  },
  transferOfferSenderName: {
    fontFamily: 'Andale Mono',
    fontSize: 13,
    fontWeight: '900',
  },
  transferOfferAssetName: {
    fontFamily: 'Avenir black',
    fontSize: 13,
    fontWeight: '900',
    width: convertWidth(150),
  },

  completedTransfer: {
    paddingLeft: convertWidth(19),
    paddingRight: convertWidth(19),
    paddingTop: 18,
    paddingBottom: 10,
    flexDirection: 'column',
    width: '100%',
  },
  completedTransferHeader: {
    flexDirection: 'row',
    height: 20,
  },
  completedTransferHeaderTitle: {
    fontFamily: 'Andale Mono',
    fontSize: 13,
    color: '#0060F2',
    width: convertWidth(102),
  },
  completedTransferHeaderValue: {
    width: convertWidth(220),
    marginLeft: convertWidth(15),
    fontFamily: 'Andale Mono',
    fontSize: 13,
    color: '#0060F2',
  },
  completedTransferContent: {
    marginTop: 9,
    flexDirection: 'column',
  },
  completedTransferContentRow: {
    flexDirection: 'row',
    height: 20,
  },
  completedTransferContentRowLabel: {
    fontFamily: 'Andale Mono',
    fontSize: 13,
    width: convertWidth(102),
  },
  completedTransferContentRowPropertyName: {
    width: convertWidth(220),
    marginLeft: convertWidth(15),
    fontFamily: 'Avenir Light',
    fontSize: 14,
    fontWeight: '900',
  },
  completedTransferContentRowValue: {
    width: convertWidth(220),
    marginLeft: convertWidth(15),
    fontFamily: 'Andale Mono',
    fontSize: 13,
  }

});
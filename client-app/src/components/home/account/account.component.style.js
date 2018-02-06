import { StyleSheet, Platform, Dimensions } from 'react-native';
import {
  ios,
  android // TODO
} from './../../../configs';
import { convertWidth } from './../../../utils'

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
    alignContent: 'center'
  },
  contentSubTab: {
    width: '100%',
    flexDirection: 'column',
  },

  //settings 
  accountNumberLabel: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 15,
    lineHeight: 18,
    marginLeft: 19,
    marginTop: 23,
  },
  accountNumberArea: {
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#C0CCDF',
    borderTopWidth: 1,
    borderTopColor: '#C0CCDF',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 48,
  },
  accountNumberValue: {
    fontFamily: 'Andale Mono',
    fontWeight: '900',
    fontSize: 15,
    lineHeight: 18,
    marginLeft: 19,
    width: '70%',
  },
  accountNumberCopyButton: {
    marginLeft: 5,
  },
  accountNumberCopyButtonText: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 12,
    color: '#0060F2',
  },
  accountMessage: {
    fontFamily: 'Avenir Black',
    fontWeight: '300',
    fontSize: 14,
    marginLeft: 16,
    marginTop: 21,
    width: 337,
  },
  accountWriteDownButton: {
    marginTop: 21,
    padding: 4,
  },
  accountWriteDownButtonText: {
    marginLeft: 19,
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 12,
    color: '#0060F2',
  },
  accountRemoveButton: {
    marginTop: 10,
    padding: 4,
  },
  accountRemoveButtonText: {
    marginLeft: 19,
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 12,
    color: '#0060F2',
  },

  marketCardTitleIcon: {
    width: 133,
    height: 30,
    resizeMode: 'contain',
    marginLeft: 19,
    marginTop: 23,
  },
  marketBalance: {
    marginTop: 16,
    marginLeft: 19,
    backgroundColor: 'white',
    height: 43,
    width: convertWidth(337),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  marketBalanceLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  marketBalanceIcon: {
    width: 12.5,
    height: 22,
    resizeMode: 'contain',
    marginLeft: 16,
  },
  marketBalanceName: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 16,
    marginLeft: 12.5,
  },
  marketBalanceNameFull: {
    fontFamily: 'Avenir Black',
    fontWeight: '500',
    fontSize: 12,
    marginLeft: 5,
  },
  marketBalanceValue: {
    marginRight: 21
  },
  marketBalanceButtonArea: {
    marginTop: 16,
    marginLeft: 19,
    width: convertWidth(337),
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  marketBalanceButton: {
    backgroundColor: '#0060F2',
    width: convertWidth(165),
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  marketBalanceButtonText: {
    color: 'white',
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 14,
    lineHeight: 16,
  },
  marketBalanceHistory: {
    marginTop: 16,
    flexDirection: 'column',
  },
  marketBalanceHistoryLabel: {
    marginLeft: 19,
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 14,
    lineHeight: 16,
  },
  marketBalanceHistoryItem: {
    marginLeft: 19,
    width: convertWidth(338),
    height: 49,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#919191',
    flexDirection: 'row',
    alignItems: 'center'
  },
  marketBalanceHistoryItemAction: {
    fontFamily: 'Avenir Heavy',
    fontWeight: '900',
    fontSize: 8,
    lineHeight: 9,
    marginLeft: 19,
  },
  marketBalanceHistoryItemAmount: {
    fontFamily: 'Avenir Heavy',
    fontWeight: '900',
    fontSize: 8,
    lineHeight: 9,
    marginLeft: 19,
    minWidth: 70,
  },
  marketBalanceHistoryItemCreatedAt: {
    fontFamily: 'Andale Mono',
    fontWeight: '900',
    fontSize: 8,
    lineHeight: 9,
    marginLeft: 19,
  },
  marketBalanceHistoryItemStatus: {
    fontFamily: 'Avenir Medium',
    fontWeight: '700',
    fontSize: 8,
    lineHeight: 9,
    marginLeft: 19,
  },

});
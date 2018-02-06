import { StyleSheet, Platform, Dimensions } from 'react-native';
import { convertWidth } from './../../../utils';
import {
  ios,
  android // TODO
} from './../../../configs';

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
    backgroundColor: '#E5E5E5'
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
    alignItems: 'center',
  },

  marketCardArea: {
    marginTop: 15,
    flexDirection: 'column',
    alignItems: 'center',
    width: convertWidth(347),
    borderWidth: 1,
    borderColor: '#A4B5CD',
    borderRadius: 10
  },
  marketCardTitleArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    minHeight: 64,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    backgroundColor: '#EDF0F4',
  },
  marketCardTitleIcon: {
    width: convertWidth(102),
    height: convertWidth(102) * 25 / 102,
    resizeMode: 'contain',
    marginLeft: 20,
  },
  marketCardTitleMaketInfo: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginRight: 15,
  },
  marketCardTitleMaketFeature: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 10,
    lineHeight: 12,
    textAlign: 'right',
  },
  marketCardTitleMaketLink: {
    fontFamily: 'Andale Mono',
    fontSize: 10,
    lineHeight: 12,
  },
  marketCardMessage: {
    fontFamily: 'Avenir Black',
    fontSize: 14,
    lineHeight: 16,
    width: convertWidth(324),
    marginTop: 5,
    marginBottom: 14,
  },
  marketCardButtonArea: {
    backgroundColor: '#0060F2',
    width: '100%',
    borderBottomLeftRadius: 9,
    borderBottomRightRadius: 9,
    minHeight: 69,
  },
  marketCardButtonItem: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    minHeight: 40,
    borderTopColor: '#A4B5CD',
    borderTopWidth: 1,
  },
  marketCardButtonItemIcon: {
    marginLeft: 18,
    width: 17,
    height: 17,
    resizeMode: 'contain'
  },
  marketCardButtonItemText: {
    fontFamily: 'Avenir Black',
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 16,
    width: convertWidth(324),
    marginLeft: 14,
    color: 'white',
  },

  pairedInfoArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  pairedAccountInfoArea: {
    flexDirection: 'column',
  },
  pairedIconArea: {
    flexDirection: 'column',
    alignItems: 'center',
    marginRight: 20,
  },
  pairedIcon: {
    width: 23,
    height: 23,
    resizeMode: 'contain',
  },

  pairedLabel: {
    fontFamily: 'Avenir Black',
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 16,
    color: 'white',
    marginLeft: 21,
    marginTop: 16,
  },

  pairedEmail: {
    fontFamily: 'Avenir Black',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 16,
    color: 'white',
    marginLeft: 21,
    marginTop: 5,
  },
});
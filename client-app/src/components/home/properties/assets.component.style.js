import { StyleSheet, Platform, Dimensions } from 'react-native';
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
    width: '33.3%',
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
  contentSubTab: {
    width: '100%',
    flexDirection: 'column',
  },

  assetRowArea: {
    width: '100%',
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
  },
  assetImage: {
    width: 62,
    height: 62,
    resizeMode: 'contain',
    marginLeft: 20,
  },
  assetInfoArea: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginLeft: 20,
    height: 62,
    width: 140,
  },
  assetCreatedDate: {
    fontFamily: 'Andale Mono',
    fontSize: 10,
    lineHeight: 12,
  },
  assetName: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 12,
    lineHeight: 14,
  },
  assetCreator: {
    fontFamily: 'Avenir Light',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 14,
    width: 140,
  },

  assetBitmark: {
    height: 62,
    width: 130,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  assetBitmarkPending: {
    fontFamily: 'Avenir Heavy',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 14,
    color: '#999999',
    marginRight: 10,
    fontStyle: 'italic'
  },
  assetBitmarkNormal: {
    width: 40,
    height: 62,
    flexDirection: 'row',
  },
  assetBitamrksNumber: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 12,
    lineHeight: 14,
    color: '#0060F2',
    marginRight: 5,
  },
  assetBitamrksDetail: {
    width: 7,
    height: 14,
    resizeMode: 'contain',
  }
});
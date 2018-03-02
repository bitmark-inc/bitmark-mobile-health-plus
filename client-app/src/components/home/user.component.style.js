import { StyleSheet, Platform } from 'react-native';
import {
  ios,
  android, // TODO
} from './../../configs';
import { convertWidth } from '../../utils';

let constant = Platform.select({
  ios: ios.constant,
  android: android.constant
});

export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'white',
  },

  bottomTabArea: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: constant.bottomTabsHeight + constant.blankFooter,
    width: '100%',
    paddingLeft: 5,
    borderTopColor: '#CDD3DC',
    borderTopWidth: 1,
    paddingRight: 5,
    paddingBottom: constant.blankFooter,
    backgroundColor: '#F5F5F5',
  },

  bottomTabButton: {
    width: convertWidth(75),
    height: '100%',
    flexDirection: 'column',
    alignItems: "center",
    justifyContent: 'center',
  },
  bottomTabButtonIcon: {
    width: 75,
    height: 28,
    resizeMode: 'contain'
  },
  bottomTabButtonText: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 10,
    lineHeight: 12,
    marginTop: 1,
    height: 14,
    color: '#0060F2'
  },

  transactionNumber: {
    backgroundColor: '#FF003C',
    position: 'absolute',
    borderRadius: 7,
    borderColor: '#FF003C',
    borderWidth: 1,
    top: 5,
    left: 49,
    width: 14,
    height: 14,
    flexDirection: 'column',
    alignItems: "center",
    justifyContent: 'center',
  },
  transactionNumberText: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 8,
    lineHeight: 9,
    color: '#FFFFFF',
    textAlign: 'center',
  }
});
import { StyleSheet, Platform } from 'react-native';
import {
  ios,
  android, // TODO
} from './../../../configs';
import { convertWidth } from '../../../utils';

let constant = Platform.select({
  ios: ios.constant,
  android: android.constant
});

export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#EDF0F4',
  },

  bottomTabArea: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: constant.bottomTabsHeight + constant.blankFooter,
    width: '100%',
    paddingLeft: 5,
    paddingRight: 5,
    paddingBottom: constant.blankFooter,
    backgroundColor: '#EDF0F4',
    shadowColor: 'black',
    shadowOffset: { width: 4, height: 0 },
    shadowRadius: 3,
    shadowOpacity: 0.2,
  },

  bottomTabButton: {
    width: convertWidth(75),
    height: '100%',
    flexDirection: 'column',
    alignItems: "center",
    justifyContent: 'center',
    paddingTop: 5,
  },
  bottomTabButtonIcon: {
    width: 23,
    height: 19,
    resizeMode: 'contain'
  },
  bottomTabButtonText: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 10,
    lineHeight: 12,
    height: 14,
    color: '#0060F2',
    marginTop: 3,
  },

  haveNewBitmark: {
    backgroundColor: '#FF003C',
    position: 'absolute',
    borderRadius: 4,
    borderColor: '#FF003C',
    borderWidth: 1,
    top: 6,
    left: 49,
    width: 8,
    height: 8,
    flexDirection: 'column',
    alignItems: "center",
    alignContent: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },

  totalTasksIndicator: {
    backgroundColor: '#FF003C',
    position: 'absolute',
    borderRadius: 7,
    borderColor: '#FF003C',
    borderWidth: 1,
    top: 4,
    left: 49,
    width: 14,
    height: 14,
    flexDirection: 'column',
    alignItems: "center",
    alignContent: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  totalTasksIndicatorText: {
    fontFamily: 'Avenir Black',
    fontSize: 10,
    color: '#FFFFFF',
    textAlign: 'center',
    width: '100%',
  },

  donationNumber: {
    backgroundColor: '#FF003C',
    position: 'absolute',
    borderRadius: 7,
    borderColor: '#FF003C',
    borderWidth: 1,
    top: 5,
    right: 16,
    width: 14,
    height: 14,
    flexDirection: 'column',
    alignItems: "center",
    alignContent: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  donationNumberText: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 8,
    lineHeight: 9,
    color: '#FFFFFF',
    textAlign: 'center',
    width: '100%',
  },
});
import { StyleSheet, Platform } from 'react-native';
import {
  ios,
  android // TODO
} from './../../configs';

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
    width: 84,
    flexDirection: 'column',
    alignItems: "center",
  },
  bottomTabButtonIcon: {
    width: 25,
    height: 25,
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
});
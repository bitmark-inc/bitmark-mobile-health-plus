import {
  StyleSheet, Platform
} from 'react-native';

import {
  ios,
  // android //TODO
} from './../../../configs';
let constant = Platform.select({
  ios: ios.constant,
  android: 42, //TODO
})

export default StyleSheet.create({
  topKeyboard: {
    position: 'absolute',
    width: '100%',
    height: constant.autoCompleteHeight,
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#8C8E93',
    backgroundColor: '#E4E6E8',
    // backgroundColor: 'gray',
    zIndex: 1,
    borderWidth: 1
  },
  previousButton: {
    marginLeft: 10,
    paddingLeft: 4,
    paddingRight: 4,
  },
  previousButtonIcon: {
    width: 20,
    height: 10,

    resizeMode: "contain"
  },
  nextButton: {
    marginLeft: 10,
    paddingLeft: 4,
    paddingRight: 4,
  },
  nextButtonIcon: {
    width: 20,
    height: 10,
    resizeMode: "contain"
  },
  doneInputButton: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 17,
    height: '100%',
  },
  doneInputButtonText: {
    fontFamily: 'Avenir Black',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    color: '#0060F2',
  },
  listAutoCompleted: {
    width: 210,
    overflow: 'hidden',
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 10,
    paddingRight: 10,
  }
});
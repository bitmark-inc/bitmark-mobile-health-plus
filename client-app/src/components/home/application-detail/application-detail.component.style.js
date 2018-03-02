import {
  StyleSheet,
  //  Platform,
} from 'react-native'
// import {
//   ios,
//   android //TODO
// } from './../../../configs';
// let constant = Platform.select({ ios: ios.constant, android: android.constant });

export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
  },
  bodyContent: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#EDF0F4',
    width: '100%',
    height: 600,
  },

  rowSetting: {
    backgroundColor: 'white',
    width: '100%',
    minHeight: 48,
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lineSetting: {
    width: '100%',
    borderWidth: 0.25,
    borderColor: '#C0CCDF',
  },

  itemSettingText: {
    marginLeft: 14,
    fontSize: 16,
    fontFamily: 'Avenir Black',
    color: '#0060F2',
    fontWeight: '800',
  },

  topArea: {
    width: '100%',
  },
  bottomArea: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
  },

  donorInfo: {
    flexDirection: 'column',
    marginTop: 17,
  },

  version: {
    marginLeft: 14,
    fontSize: 15,
    color: '#838383',
    fontFamily: 'Avenir Black'
  },

  sendFeedbackPopupTitle: {
    fontFamily: 'Arial',
    fontSize: 15.42,
    textAlign: 'center',
    fontWeight: '800',
    width: 248,
    marginTop: 26,
  },
  sendFeedbackPopupDescription: {
    fontFamily: 'Arial',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '300',
    color: '#4A4A4A',
    width: 223,
    marginTop: 10,
    marginBottom: 25,
  },
  sendFeedbackPopupButtonArea: {
    borderTopColor: '#919191',
    borderTopWidth: 1,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignContent: 'center',
    height: 46,
  },
  sendFeedbackPopupButtonSeparate: {
    borderLeftWidth: 1,
    borderLeftColor: '#919191',
    height: '100%'
  },
  sendFeedbackPopupButton: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    width: 132,
  },
  sendFeedbackPopupButtonText: {
    fontFamily: 'Arial',
    fontSize: 15.42,
    textAlign: 'center',
    fontWeight: '800',
    color: '#0060F2',
  },
});
import { StyleSheet } from 'react-native'
export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
    paddingLeft: 51,
    paddingRight: 51,
  },

  // notification
  notificationTitle: {
    fontFamily: 'Avenir black',
    color: '#0060F2',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 103,
  },

  notificationImage: {
    marginTop: 63,
    width: 275,
    height: 215,
    resizeMode: 'contain',
  },

  notificationDescription: {
    marginTop: 37,
    width: 275,
    fontFamily: 'Avenir light',
    fontWeight: '300',
    fontSize: 17,
  },

  enableButtonArea: {
    marginTop: 40,
    flexDirection: 'column',
    width: '100%',
  },
  enableButton: {
    minHeight: 42,
    width: 275,
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: '#0060F2',
  },
  enableButtonText: {
    fontFamily: 'Avenir black',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    color: 'white'
  },
});
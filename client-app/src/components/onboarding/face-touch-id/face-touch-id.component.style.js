import { StyleSheet } from 'react-native'
export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'white',
  },

  // notification
  faceTouchIdTitle: {
    fontFamily: 'Avenir black',
    color: '#0060F2',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 123,
  },

  passcodeRemindImages: {
    marginTop: 73,
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  touchIdImage: {
    width: 69,
    height: 69,
    resizeMode: 'contain',
  },
  faceIdImage: {
    marginLeft: 30,
    width: 69,
    height: 69,
    resizeMode: 'contain',
  },

  faceTouchIdDescription: {
    marginTop: 80,
    width: 280,
    fontFamily: 'Avenir light',
    fontWeight: '300',
    fontSize: 17,
    lineHeight: 20,
  },

  enableButtonArea: {
    marginTop: 80,
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  enableButton: {
    minHeight: 42,
    width: 309,
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
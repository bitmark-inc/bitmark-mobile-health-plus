import { StyleSheet } from 'react-native'

export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    alignContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  main: {
    flex: 1,
  },
  swipePage: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
  },

  bitmarkTitle: {
    fontFamily: 'Avenir Black',
    fontSize: 17,
    textAlign: 'center',
    color: '#0060F2',
    fontWeight: '900',
    width: 277,
    position: 'absolute',
    top: 39,
  },

  bitmarkDescription: {
    fontFamily: 'Avenir Black',
    fontSize: 17,
    fontWeight: '300',
    width: 275,
    position: 'absolute',
    top: 386,
  },

  passcodeRemindImages: {
    position: 'absolute',
    top: 198,
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
  }
});
import { StyleSheet } from 'react-native'

export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  welcomeBackground: {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
  },
  welcomeLogo: {
    width: 309,
    height: 113,
    resizeMode: 'contain',
  },
  welcomeButtonArea: {
    marginTop: 33,
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
  },
  welcomeButton: {
    marginTop: 10,
    minHeight: 42,
    width: 309,
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: '#0060F2',
  },
  welcomeButtonText: {
    fontFamily: 'Avenir black',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    color: 'white'
  },
});
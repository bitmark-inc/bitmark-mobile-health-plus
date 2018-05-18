import {
  StyleSheet,
} from 'react-native'

export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    position: 'absolute',
    top: 0,
    zIndex: 1000
  },

  content: {
    flex: 1,
    alignItems: 'center'
  },

  bitmarkIcon: {
    marginTop: -24,
    width: 285,
    height: 48,
    resizeMode: 'contain'
  },

  statusContainer: {
    position: 'absolute',
    bottom: 50,
  },

  updatingStatus: {
    fontSize: 16,
    fontWeight: '900',
    fontFamily: 'Avenir Black',
    color: '#A4B5CD'
  },

  completedStatus: {
    fontSize: 16,
    fontWeight: '900',
    fontFamily: 'Avenir Black',
    color: '#0060F2'
  },

  progressBar: {
    position: 'absolute',
    width: '100%',
    height: 5,
    bottom: 0
  }
});
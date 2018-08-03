import {
  StyleSheet,
} from 'react-native';
export default StyleSheet.create({
  body: {
    flex: 1,
    alignItems: 'center',
    alignContent: 'center',
    flexDirection: 'column',
    backgroundColor: 'white',
  },
  loading: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    backgroundColor: 'white',
    width: '100%',
    height: '100%'
  },
  loadingLogo: {
    width: 285,
    height: 48,
    resizeMode: 'contain',
    position: 'absolute',
  },
});
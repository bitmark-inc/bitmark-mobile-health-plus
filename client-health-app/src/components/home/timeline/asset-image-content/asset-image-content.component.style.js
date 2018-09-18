import { StyleSheet, } from 'react-native';

export default StyleSheet.create({
  body: {
    flexDirection: 'column',
    height: '100%',
    width: '100%',
  },

  bodyContent: {
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center'
  },
  imageContent: {
    height: '100%',
    resizeMode: 'contain'
  },
  headerRight: {
    width: 100
  }
});
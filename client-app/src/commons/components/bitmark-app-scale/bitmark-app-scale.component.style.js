import { StyleSheet, Platform } from 'react-native';
export default Platform.select({
  ios: StyleSheet.create({
    body: {
      flex: 1,
      flexDirection: 'column',
      backgroundColor: 'white',
    },
  }),
  android: StyleSheet.create({

  })
}); 
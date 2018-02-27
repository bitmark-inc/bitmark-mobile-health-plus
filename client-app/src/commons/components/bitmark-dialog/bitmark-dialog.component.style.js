import {
  StyleSheet
} from 'react-native';

export default StyleSheet.create({
  body: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    alignContent: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    zIndex: 100,
  },
  dialogBody: {
    flex: 1,
    alignItems: 'center',
    alignContent: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    position: 'absolute',
    top: 0,
    width: '100%',
    height: '100%',
    zIndex: 100,
  },
  dialogContent: {
    width: 270,
    minHeight: 100,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
});
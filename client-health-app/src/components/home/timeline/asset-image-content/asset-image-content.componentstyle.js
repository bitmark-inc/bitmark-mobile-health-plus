import { StyleSheet, } from 'react-native';
import { convertWidth } from '../../../../utils';

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
    height: '60%'
  },
  downloadButton: {
    width: convertWidth(375),
    height: 45,
    backgroundColor: '#0060F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadText: {
    fontSize: 16,
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    color: '#FFFFFF'
  }
});
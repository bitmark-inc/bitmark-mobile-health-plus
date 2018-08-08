import { StyleSheet } from 'react-native';
import {convertWidth} from "../../../../utils";

export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column'
  },

  previewContainer: {
    flex: 1
  },

  previewImage: {
    height: '100%'
  },

  bottomButton: {
    width: convertWidth(375),
    height: 45,
    backgroundColor: '#0060F2',
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center'
  },

  buttonText: {
    color: '#FFFFFF',
    fontFamily: 'Avenir Medium'
  }
});
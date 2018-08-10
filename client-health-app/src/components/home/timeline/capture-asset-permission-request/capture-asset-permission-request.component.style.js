import { StyleSheet } from 'react-native';
import {convertWidth} from "../../../../utils";

export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    paddingTop: 40,
    backgroundColor: '#EFEFF4'
  },

  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },

  title: {
    fontSize: 18,
    fontFamily: 'Avenir Medium',
    fontWeight: 'bold'
  },

  text_1: {
    fontSize: 16,
    fontFamily: 'Avenir Medium',
    marginTop: 20,
    paddingLeft: convertWidth(70),
    paddingRight: convertWidth(70),
  },

  text_2: {
    fontSize: 16,
    fontFamily: 'Avenir Medium',
    marginTop: 20,
    paddingLeft: convertWidth(37),
    paddingRight: convertWidth(37),
  },

  link: {
    color: '#0060F2',
    fontSize: 16,
    fontFamily: 'Avenir Medium',
    marginTop: 56,
  }
});
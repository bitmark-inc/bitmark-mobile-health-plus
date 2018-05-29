import {StyleSheet} from "react-native";
import {convertWidth} from "../../../../../../../utils";

export default StyleSheet.create({
  content: {
    flex: 1,
    marginTop: 55,
    paddingLeft: convertWidth(50), 
    paddingRight: convertWidth(50) 
  },
  
  title: {
    fontFamily: 'Avenir Black',
    fontSize: 17,
    fontWeight: '900',
    color: '#0060F2'
  },
  
  text: {
    marginTop: 54,
    fontFamily: 'Avenir Black',
    fontSize: 17,
    width: convertWidth(275)
  },
  
  textBold: {
    fontFamily: 'Avenir Black',
    fontWeight: 'bold',
    fontSize: 17
  },

  learnMore: {
    marginTop: 97
  },

  learnMoreText: {
    color: '#0060F2',
    fontWeight: 'bold',
    fontSize: 14
  }
});
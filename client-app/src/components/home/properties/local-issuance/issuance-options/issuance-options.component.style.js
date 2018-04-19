import { StyleSheet, } from 'react-native';

import { convertWidth } from './../../../../../utils';
import { ios } from '../../../../../configs';

export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    height: ios.constant.headerSize.height - ios.constant.headerSize.paddingTop,
    width: '100%',
    // borderWidth: 1,
  },

  content: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
  },

  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 45,
    width: '100%',
    marginTop: 10,
    paddingLeft: convertWidth(19),
    paddingRight: convertWidth(19),
    backgroundColor: '#F5F5F5',
  },
  optionButtonText: {
    fontFamily: 'Avenir black',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    color: '#0060F2',
  },
  optionButtonNextIcon: {
    width: 15,
    height: 15,
    resizeMode: 'contain',
  },
  optionButtonStatus: {
    fontFamily: 'Avenir Light',
    fontSize: 16,
    fontWeight: '300',
    textAlign: 'center',
    color: '#0060F2',
    marginLeft: convertWidth(19),
  },
  message: {
    fontFamily: 'Avenir Light',
    fontSize: 17,
    fontWeight: '300',
    color: 'black',
    width: convertWidth(337),
    marginLeft: convertWidth(19),
    marginTop: 23,
  }
});
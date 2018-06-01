import { StyleSheet, } from 'react-native'
import { convertWidth } from '../../../../../utils';

import { iosConstant } from '../../../../../configs/ios/ios.config';



export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    alignContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
    paddingLeft: convertWidth(19),
    paddingRight: convertWidth(19),
  },
  bitmarkTitle: {
    fontFamily: 'Avenir Black',
    fontSize: 17,
    textAlign: 'center',
    color: '#0060F2',
    fontWeight: '900',
    marginTop: 53,
  },
  passcodeRemindImages: {
    marginTop: 150,
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  touchIdImage: {
    width: 69,
    height: 69,
    resizeMode: 'contain',
  },
  faceIdImage: {
    marginLeft: 30,
    width: 69,
    height: 69,
    resizeMode: 'contain',
  },

  bitmarkDescription: {
    fontFamily: 'Avenir Black',
    fontSize: 17,
    fontWeight: '300',
    width: convertWidth(337),
    marginTop: 80,
  },
  bitmarkButton: {
    position: 'absolute',
    bottom: 0,
    minHeight: 45 + iosConstant.blankFooter / 2,
    paddingTop: 10,
    paddingBottom: Math.max(10, iosConstant.blankFooter),
    width: convertWidth(375),
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    borderTopColor: '#0060F2',
    borderTopWidth: 3,
    backgroundColor: '#F5F5F5'
  },
  bitmarkButtonText: {
    fontFamily: 'Avenir black',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    color: '#0060F2'
  }
});
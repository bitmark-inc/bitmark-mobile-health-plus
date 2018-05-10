import {
  StyleSheet,
} from 'react-native'
import { convertWidth } from '../../../../../utils';
import { ios } from '../../../../../configs';


export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    height: '100%',
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
  },

  bodyContent: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    height: 600,
    backgroundColor: 'white',
  },

  scanMessage: {
    fontFamily: 'Avenir Black',
    fontSize: 17,
    fontWeight: '300',
    width: convertWidth(337),
    marginTop: 40,
  },
  scanCamera: {
    marginTop: 20,
    width: convertWidth(375),
    height: convertWidth(375),
  },

});
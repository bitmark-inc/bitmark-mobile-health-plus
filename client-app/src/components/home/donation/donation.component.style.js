import { StyleSheet } from 'react-native';

import { convertWidth } from '../../../utils';
import { ios } from '../../../configs';


export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  inActiveContent: {
    flex: 1,
    width: convertWidth(375),
    flexDirection: 'column',
    backgroundColor: 'white',
  },

  activedContent: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
  },

  subTabArea: {
    width: '100%',
    height: ios.constant.headerSize.height - ios.constant.headerSize.paddingTop,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  subTabButton: {
    width: '50%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subTabButtonText: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 18,
    textAlign: 'center',
    color: '#0060F2',
  },
  taskIndicator: {
    position: 'absolute',
    top: 5,
    left: 124,
    backgroundColor: '#FF003C',
    borderColor: '#FF003C',
    borderWidth: 1,
    borderRadius: 5,
    width: 10,
    height: 10,
  }
});
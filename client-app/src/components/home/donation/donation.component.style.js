import { StyleSheet, Dimensions } from 'react-native';

import { ios } from '../../../configs';
import { convertWidth } from '../../../utils';
let currentSize = Dimensions.get('window');
let scale = currentSize.width / 375;

export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
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
  subTabArea: {
    width: '100%',
    height: 39,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  subTabButton: {
    width: '50%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'black',
    shadowOffset: { height: 0 },
    shadowRadius: 3,
    zIndex: 1,
  },
  subTabButtonArea: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  subTabButtonTextArea: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 35,
  },
  subTabButtonText: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 14,
    lineHeight: 16,
    textAlign: 'center',
  },
  activeSubTabBar: {
    height: 4,
    backgroundColor: '#0060F2'
  },

  contentScroll: {
    width: '100%',
    flexDirection: 'column',
    alignContent: 'center',
    backgroundColor: 'white',
  },
  content: {
    marginTop: 9,
    flex: 1,
    flexDirection: 'column',
  },
  studyCard: {
    marginBottom: 10,
    backgroundColor: 'rgba(0,0,0,0)',
    shadowOffset: { height: 2, },
    shadowOpacity: 0.2,
    paddingBottom: 2,
  },
  noCardTitle: {
    marginTop: 39,
    marginLeft: 19,
    fontFamily: 'Avenir Black',
    fontSize: 17,
    fontWeight: '900',
    color: '#0060F2',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 130,
    height: 28 * scale,
    paddingTop: 5,
  },
  contactButtonText: {
    fontFamily: 'Avenir Light',
    fontSize: 16 * scale,
    textAlign: 'left',
    color: '#0060F2',
    marginTop: 2,
  },
  noCardMessage: {
    fontFamily: 'Avenir Light',
    fontSize: 17 * scale,
    textAlign: 'left',
    fontWeight: '300',
    color: '#828282',
    width: convertWidth(337),
    marginLeft: 19,
    marginTop: 21,
  },




});
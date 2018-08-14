import { StyleSheet, } from 'react-native';
import {
  ios,
} from './../../../configs';
import { convertWidth } from './../../../utils'

export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#EFEFF4',
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
  cameraIcon: {
    width: 21,
    height: 20,
    resizeMode: 'contain',
    marginLeft: convertWidth(19),
  },
  bitmarkAccountHelpIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    marginRight: 19,
  },
  subTabArea: {
    width: '100%',
    height: 39,
    backgroundColor: '#EFEFF4',
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
  scrollSubTabArea: {
    width: '100%',
    flexDirection: 'column',
    alignContent: 'center',
    backgroundColor: '#EFEFF4'
  },
  contentSubTab: {
    width: '100%',
    flexDirection: 'column',
  },

  accountNumberValue: {
    fontFamily: 'Andale Mono',
    fontWeight: '900',
    fontSize: convertWidth(11),
    width: convertWidth(337),
    color: '#0060F2',
  },
  accountNumberCopyButtonText: {
    fontFamily: 'Avenir',
    fontWeight: '700',
    fontStyle: 'italic',
    fontSize: 8,
    color: '#0060F2',
    textAlign: 'right'
  },
  accountMessage: {
    fontFamily: 'Avenir Light',
    fontWeight: '300',
    fontSize: 15,
    marginTop: 5,
    marginBottom: 10,
    width: convertWidth(337),
    paddingLeft: convertWidth(19),
    paddingRight: convertWidth(19)
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  lastItemContainer: {
    marginBottom: 35
  },
  itemAlignRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1
  }
});
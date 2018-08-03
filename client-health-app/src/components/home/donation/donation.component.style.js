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
    width: convertWidth(339),
    height: 29,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 5,
    borderColor: '#0060F2',
    marginTop: 26,
  },
  subTabButton: {
    width: '33.33%',
    // width: convertWidth(113),
    // height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

  },
  subTabButtonArea: {
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
    backgroundColor: '#EDF0F4',
  },
  content: {
    marginTop: 13,
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },

  donationTaskItem: {
    width: convertWidth(336),
    height: 118,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: 'white',
    backgroundColor: 'white',
    flexDirection: 'row',
    marginBottom: 10,
  },

  donationTaskItemLeftArea: {
    flexDirection: 'column',
    paddingLeft: 12,
    paddingRight: 14,
  },
  researcherImage: {
    width: 29,
    height: 29,
    resizeMode: 'contain',
    marginTop: 11,
  },

  donationTaskItemRightArea: {
    flexDirection: 'column',
    paddingTop: 15,
    paddingBottom: 19,
  },

  donationTaskItemType: {
    fontFamily: 'Avenir Medium',
    fontSize: 13,
    color: '#0060F2',
  },

  donationTaskItemTitle: {
    marginTop: 7,
    fontFamily: 'Avenir Light',
    fontSize: 13,
    fontWeight: '800',
  },
  donationTaskItemDescription: {
    fontFamily: 'Avenir Black',
    fontSize: 13,
    fontWeight: '300',
  },
  donationTaskItemTime: {
    marginTop: 3,
    fontFamily: 'Avenir Medium',
    fontSize: 13,
    color: '#999999',
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
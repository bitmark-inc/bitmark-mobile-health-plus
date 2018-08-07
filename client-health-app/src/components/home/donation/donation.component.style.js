import { StyleSheet } from 'react-native';

import { ios } from '../../../configs';
import { convertWidth } from '../../../utils';

export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#EDF0F4',
  },

  header: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EDF0F4',
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
  todoHightLight: {
    position: 'absolute',
    top: 1,
    right: 1,
    zIndex: 1,
    width: 8,
    height: 8,
    borderWidth: 1,
    borderColor: 'red',
    borderRadius: 4,
    backgroundColor: 'red',
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
    color: 'white',
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
  todoEmptyTitle: {
    width: convertWidth(337),
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 17,
    color: '#0060F2',
  },
  todoEmptyDescription: {
    marginTop: 30,
    width: convertWidth(337),
    fontFamily: 'Avenir Black',
    fontWeight: '300',
    fontSize: 17,
    color: '#0060F2',
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

  newRecord: {
    flexDirection: 'row',
  },

  newRecordImageArea: {
    paddingLeft: convertWidth(19),
  },
  newRecordImageIcon: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },

  newRecordContentArea: {
    marginLeft: convertWidth(12),
  },
  newTitle: {
    width: convertWidth(248),
    fontFamily: 'Avenir Black',
    fontSize: 14,
    fontWeight: '900',
  },
  newDescription: {
    marginTop: 5,
    width: convertWidth(248),
    fontFamily: 'Avenir Light',
    fontSize: 13,
    fontWeight: '300',
  },
  newFooter: {
    flexDirection: 'row',
    width: convertWidth(343),
    marginTop: 14,
  },
  newOwner: {
    fontFamily: 'Avenir Heavy',
    fontSize: 9,
    fontWeight: '900',
    width: convertWidth(157),
  },
  newCreatedAt: {
    fontFamily: 'Avenir Medium',
    fontSize: 9,
    fontWeight: '300',
    color: '#999999',
    width: convertWidth(52),
  },

});
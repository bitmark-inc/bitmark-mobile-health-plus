import { StyleSheet } from 'react-native';

import { convertWidth } from '../../../utils';

export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#EDF0F4',
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
    marginBottom: 13,
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
    backgroundColor: 'white',
    flex: 1,
  },
  content: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },
  contentSubTab: {
    width: '100%',
    flexDirection: 'column',
  },
  welcomeIcon: {
    marginTop: 81,
    width: 219,
    height: 219,
    resizeMode: 'contain',
  },
  todoEmptyTitle: {
    width: convertWidth(375),
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 17,
    color: '#0060F2',
    textAlign: 'center',
    marginTop: 32,
  },
  todoEmptyDescription: {
    marginTop: 30,
    width: convertWidth(375),
    fontFamily: 'Avenir Black',
    fontWeight: '300',
    fontSize: 17,
    textAlign: 'center',
  },
  donationTaskItem: {
    width: convertWidth(375),
    height: 118,
    borderBottomWidth: 1,
    borderBottomColor: '#C1C1C1',
    backgroundColor: 'white',
    flexDirection: 'row',
    marginBottom: 10,
  },

  donationTaskItemLeftArea: {
    flexDirection: 'column',
    paddingLeft: convertWidth(18),
    paddingRight: convertWidth(17),
  },
  researcherImage: {
    width: 55,
    height: 55,
    resizeMode: 'contain',
    marginTop: 11,
  },

  donationTaskItemRightArea: {
    flexDirection: 'column',
    paddingTop: 15,
    paddingBottom: 19,
    width: convertWidth(265),
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
    width: convertWidth(265),
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
    width: convertWidth(375),
    marginTop: 18,
    paddingBottom: 19,
    borderBottomWidth: 1,
    borderBottomColor: '#C1C1C1',
  },

  newRecordImageArea: {
    paddingLeft: convertWidth(19),
    width: convertWidth(19) + 32,
  },
  newRecordImageIcon: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'white'
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
    width: convertWidth(290),
    fontFamily: 'Avenir Light',
    fontSize: 13,
    fontWeight: '300',
  },
  newFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: convertWidth(278),
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
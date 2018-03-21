import { StyleSheet } from 'react-native';
import { convertWidth } from '../../../../utils';

export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
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
    marginBottom: 5,
  },
  noCardTitle: {
    marginTop: 39,
    marginLeft: 19,
    fontFamily: 'Avenir Black',
    fontSize: 17,
    fontWeight: '900',
    color: '#0060F2',
  },
  noCardMessageArea: {
    flexDirection: 'column',
    width: convertWidth(337),
    height: 72,
    marginLeft: 19,
    marginTop: 21,
  },
  contactMessageFirstLine: {
    flexDirection: 'row',
  },
  contactButtonText: {
    fontFamily: 'Avenir Light',
    fontSize: 16,
    textAlign: 'left',
    color: '#0060F2',
  },
  noCardMessage: {
    fontFamily: 'Avenir Light',
    fontSize: 17,
    textAlign: 'left',
    fontWeight: '300',
    color: '#828282',
  },


});
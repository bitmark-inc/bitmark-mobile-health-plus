import { StyleSheet } from 'react-native';
// import { convertWidth } from '../../../../utils';

export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
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

  contentArea: {
    width: '100%',
    flexDirection: 'column',
    alignContent: 'center',
    backgroundColor: 'white',
  },
  taskRow: {
    minHeight: 69,
    width: '100%',
    backgroundColor: 'white',
    borderBottomColor: '#C0CCDF',
    borderBottomWidth: 1,
    borderLeftColor: '#0060F2',
    borderLeftWidth: 4,
    paddingTop: 10,
    paddingBottom: 10,
  },
  taskRowLeft: {

  },
  taskTitle: {
    marginLeft: 15,
    fontFamily: 'Avenir heavy',
    fontSize: 15,
    fontWeight: '900',
  },
  taskRowDescription: {
    marginTop: 5,
    marginLeft: 15,
    fontFamily: 'Avenir light',
    fontSize: 15,
    fontWeight: '300',
  },

  notTaskArea: {
    marginTop: 69,
    width: '100%'
  },
  noTaskMessage: {
    marginLeft: 39,
    fontFamily: 'Avenir black',
    fontSize: 20,
    fontWeight: '900',
    color: '#0060F2',
  },
  notTaskDescription: {
    marginTop: 25,
    marginLeft: 39,
    width: 296,
    fontFamily: 'Avenir light',
    fontSize: 17,
    fontWeight: '300',
    color: '#828282'
  },
});
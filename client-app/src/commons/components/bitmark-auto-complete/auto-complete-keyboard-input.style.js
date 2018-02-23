import {
  StyleSheet,
} from 'react-native';


export default StyleSheet.create({
  extArea: {
    flexDirection: 'column',
    alignItems: 'center',
    alignContent: 'center',
    position: 'absolute',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    backgroundColor: '#D1D5Db',
  },

  inputArea: {
    width: '100%',
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    height: 30,
  },
  textInputStyle: {
    height: 20,
    fontSize: 18,
    backgroundColor: 'white',
    minWidth: '40%',
    borderRadius: 10,
    paddingLeft: 10,
    paddingRight: 10,
  },
  controlArea: {
    marginLeft: 20,
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  selectionArea: {
    width: '100%',
    marginTop: 4,
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 30,
    paddingLeft: 8,
    paddingRight: 8,
  },
  prevButton: {
    padding: 4,
  },
  prevButtonText: {
    fontSize: 18,
    color: 'blue'
  },
  nextButton: {
    padding: 4,
  },
  nextButtonText: {
    fontSize: 18,
    color: 'blue'
  },
  selectionList: {
    width: '70%',
    height: 30,
    marginLeft: 10,
    marginRight: 10,
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionItem: {
    marginLeft: 4,
    padding: 4,
  },
  selectionItemText: {
    color: 'blue'
  }
});
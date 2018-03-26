import {
  StyleSheet,
} from 'react-native';
import { convertWidth } from '../../../utils';


export default StyleSheet.create({
  extArea: {
    flexDirection: 'row',
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
    height: 30,
    paddingLeft: 8,
    paddingRight: 8,
  },
  prevButton: {
    marginLeft: 10,
  },
  prevButtonImage: {
    width: 16,
    height: 16,
    resizeMode: 'contain'
  },
  nextButton: {
    marginLeft: 5,
  },
  nextButtonImage: {
    width: 16,
    height: 16,
    resizeMode: 'contain'
  },
  doneButton: {
    position: 'absolute',
    right: 10,
  },
  doneButtonText: {
    fontSize: 16,
    color: '#0060F2',
    fontWeight: '600',
  },
  selectionList: {
    width: convertWidth(200),
    height: 30,
    marginLeft: 20,
    marginRight: 20,
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
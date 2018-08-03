import {
  StyleSheet,
} from 'react-native';
import { convertWidth } from '../../../utils';


export default StyleSheet.create({
  main: {
  },
  selectionArea: {
    flex: 1,
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    paddingLeft: 8,
    paddingRight: 8,
    backgroundColor: '#EEEFF1',
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
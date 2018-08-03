import { Dimensions } from 'react-native';


const currentSize = Dimensions.get('window');
const androidConstant = {
  subTabSizeHeight: 39,
  bottomTabsHeight: 56,
  blankFooter: 0,
  autoCompleteHeight: 42,
  defaultWindowSize: {
    width: 375,
    height: currentSize.height,
  },
  headerSize: {
    width: '100%',
    height: 71,
    paddingTop: 20,
  },
  zIndex: {
    internetOff: 1000,
    error: 300,
    indicator: 200,
    dialog: 100,
  },
};
const androidConfig = {};

export {
  androidConstant,
  androidConfig,
};
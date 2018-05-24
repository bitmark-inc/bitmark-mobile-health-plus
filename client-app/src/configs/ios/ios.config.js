import { Dimensions } from 'react-native';

const currentSize = Dimensions.get('window');
const isIPhoneX = (currentSize.height === 812);
const windowHeight = isIPhoneX ? 812 : 667;
const blankFooter = isIPhoneX ? 20 : 0;
const headerHeight = isIPhoneX ? 80 : 71;
const headerPaddingTop = isIPhoneX ? 35 : 20;

let iosConstant = {
  subTabSizeHeight: 39,
  bottomTabsHeight: 56,
  blankFooter,
  autoCompleteHeight: 45,
  defaultWindowSize: {
    width: 375,
    height: windowHeight,
  },
  headerSize: {
    width: '100%',
    height: headerHeight,
    paddingTop: headerPaddingTop,
  },
  zIndex: {
    internetOff: 1000,
    error: 300,
    indicator: 200,
    dialog: 100,
  },
};

let iosConfig = {
  isIPhoneX,
  appLink: '',
};

export {
  iosConstant,
  iosConfig,
};
import { Dimensions } from 'react-native';

const currentSize = Dimensions.get('window');
const isIPhoneX = (currentSize.height === 812);
const isIPhoneSE = (currentSize.height === 568);
const windowHeight = isIPhoneX ? 812 : 667;
const blankFooter = isIPhoneX ? 34 : 0;
const headerHeight = isIPhoneX ? 80 : 71;
const headerPaddingTop = isIPhoneX ? 35 : 20;
const bottomBottomHeight = (isIPhoneX ? 50 : 45) + blankFooter / 2;
const bottomTabsHeight = isIPhoneX ? 49 : 56;

let iosConstant = {
  subTabSizeHeight: 39,
  bottomTabsHeight,
  blankFooter,
  autoCompleteHeight: 45,
  bottomBottomHeight,
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
  isIPhoneSE,
  appLink: '',
};

export {
  iosConstant,
  iosConfig,
};
import { Dimensions } from 'react-native';
// import DeviceInfo from 'react-native-device-info';

const currentSize = Dimensions.get('window');
console.log('currentSize: ', currentSize);
const isIPhoneX = (currentSize.height === 812);
const windowWidth = 375;
const windowHeight = isIPhoneX ? 812 : 667;
const blankFooter = isIPhoneX ? 20 : 0;
const headerHeight = isIPhoneX ? 80 : 71;
const headerPaddingTop = isIPhoneX ? 35 : 20;

const bottomTabsHeight = 56;
const buttonHeight = 42;
const autoCompleteHeight = 42;

let iosConstant = {
  bottomTabsHeight,
  blankFooter,
  buttonHeight,
  autoCompleteHeight,
  defaultWindowSize: {
    width: windowWidth,
    height: windowHeight,
  },
  headerSize: {
    width: '100%',
    height: headerHeight,
    paddingTop: headerPaddingTop,
  },
  zIndex: {
    internetOff: 1000,
    versionUpdate: 900,
    indicator: 100,
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
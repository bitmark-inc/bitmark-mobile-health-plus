import { Dimensions } from 'react-native';
import DeviceInfo from 'react-native-device-info';

const currentSize = Dimensions.get('window');
const isIPhoneX = (currentSize.height === 812 && DeviceInfo.getModel() === 'iPhone');
const windowWidth = 375;
const windowHeight = isIPhoneX ? 812 : 667;
const blankFooter = isIPhoneX ? 20 : 0;
const headerHeight = isIPhoneX ? 80 : 71;
const headerPaddingTop = isIPhoneX ? 35 : 20;

const studyCardWidth = windowWidth;
const studyCardHeight = 220;
const bottomTabsHeight = 55;
const buttonHeight = 42;
const autoCompleteHeight = 42;

let iosConstant = {
  bottomTabsHeight: bottomTabsHeight,
  blankFooter: blankFooter,
  buttonHeight: buttonHeight,
  autoCompleteHeight: autoCompleteHeight,
  defaultWindowSize: {
    width: windowWidth,
    height: windowHeight,
  },
  defaultKeyboardSize: {
    width: 375,
    height: 216,
  },
  headerSize: {
    width: windowWidth,
    height: headerHeight,
    paddingTop: headerPaddingTop,
  },
  studyCardSize: {
    width: studyCardWidth,
    height: studyCardHeight,
    backgroundColor: '#0C3E79',
  },
  donation_time: {
    livenet: {
      study1: 24 * 60 * 60 * 1000,
      study2: 7 * 24 * 60 * 60 * 1000,
    },
    testnet: {
      study1: 24 * 60 * 60 * 1000,
      study2: 7 * 24 * 60 * 60 * 1000,
    },
    devnet: {
      study1: 10 * 60 * 1000,
      study2: 7 * 10 * 60 * 1000,
    }
  },

  animations: {
    move_duration: 300,
    fade_duration: 1000,
  },

  studyPreviewScreen: {
    minHeight: studyCardHeight,
    maxHeight: 647,
  },
  zIndex: {
    internetOff: 1000,
    versionUpdate: 900,
    indicator: 100,
  },

  taskTypes: {
    bitmarkHealthData: 'bitmark-health-data',
    dataSourceInactive: 'data-source-inactive',
    studyCommon: {
      donations: 'donations',
      intake_survey: 'intake_survey',
    },
    study1: {
      donations: 'donations',
      intake_survey: 'intake_survey',
    },
    study2: {
      donations: 'donations',
      intake_survey: 'intake_survey',
      task1: 'task1',
      task2: 'task2',
      task3: 'task3',
      task4: 'task4',
    }
  }
};

let iosConfig = {
  isIPhoneX,
  appLink: '',
};

export {
  iosConstant,
  iosConfig,
};
// import { MainComponent } from './src';

// export default MainComponent;

import { Text } from 'react-native';
Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;

import {
  // MainComponent,
  CodePushMainAppComponent
} from './src';

export default CodePushMainAppComponent;
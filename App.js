// import { MainComponent } from './src';

// export default MainComponent;

import { Text } from 'react-native';
import codePush from "react-native-code-push";
import DeviceInfo from 'react-native-device-info';
import i18n from 'i18n-js';
import { Buffer } from 'safe-buffer';
import {
  // MainComponent,
  CodePushComponent
} from './src';
import { BitmarkSDK } from 'src/processors';
import { config } from 'src/configs';
import { Sentry } from 'react-native-sentry';

// if (!__DEV__) {
Sentry.config('https://be60f83dc4944cef8069256e4b8c0a6b@sentry.io/1339711').install();
Sentry.setTagsContext({
  "environment": DeviceInfo.getBundleId(),
  "react": true,
});
// }

BitmarkSDK.sdkInit(config.network);
console.disableYellowBox = true;

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;

i18n.locale = config.localization;

i18n.fallbacks = true;
i18n.translations = require('./assets/localizations.json');
global.i18n = i18n;
global.Buffer = global.Buffer || Buffer;

let CodePushMainAppComponent = codePush({
  updateDialog: {
    title: i18n.t('CodePushComponent_title'),
    optionalUpdateMessage: i18n.t('CodePushComponent_optionalUpdateMessage'),
    mandatoryUpdateMessage: i18n.t('CodePushComponent_mandatoryUpdateMessage'),
    optionalInstallButtonLabel: i18n.t('CodePushComponent_optionalInstallButtonLabel'),
    mandatoryContinueButtonLabel: i18n.t('CodePushComponent_mandatoryContinueButtonLabel'),
    optionalIgnoreButtonLabel: null
  },
  checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
  installMode: codePush.InstallMode.IMMEDIATE
})(CodePushComponent);

export default CodePushMainAppComponent;
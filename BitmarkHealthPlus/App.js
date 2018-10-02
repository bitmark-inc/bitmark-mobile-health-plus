// import { MainComponent } from './src';

// export default MainComponent;

import { Text } from 'react-native';
import codePush from "react-native-code-push";
import DeviceInfo from 'react-native-device-info';
import i18n from 'i18n-js';
import {
  // MainComponent,
  CodePushComponent
} from './src';

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;

i18n.locale = DeviceInfo.getDeviceLocale();
i18n.locale = 'en';
i18n.fallbacks = true;
i18n.translations = require('./assets/localizations.json');
global.i18n = i18n;

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
/** @format */
import DeviceInfo from 'react-native-device-info';
import i18n from 'i18n-js';
i18n.locale = DeviceInfo.getDeviceLocale();
i18n.locale = 'en';
i18n.fallbacks = true;
i18n.translations = require('./assets/localizations.json');
global.i18n = i18n;

import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import App from './App';
console.log('i18n.translations :', i18n.locale, i18n.translations);



AppRegistry.registerComponent(appName, () => App);

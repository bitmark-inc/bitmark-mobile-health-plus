/** @format */
import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import { TestCharacterFlapperComponent } from 'src/views/commons/index.js';
// import App from './App';
// console.log('i18n.translations :', i18n.locale, i18n.translations);

AppRegistry.registerComponent(appName, () => TestCharacterFlapperComponent);

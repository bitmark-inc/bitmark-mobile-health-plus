import codePush from "react-native-code-push";
import { AppRegistry } from 'react-native';
import App from './App';

let codePushOptions = { checkFrequency: codePush.CheckFrequency.ON_APP_RESUME };

AppRegistry.registerComponent('Bitmark', () => codePush(codePushOptions)(App));

import codePush from "react-native-code-push";
import { AppRegistry } from 'react-native';
import App from './App';

let codePushOptions = {
  // updateDialog: true,
  updateDialog: {
    title: 'Bitmark” Needs to Be Updated',
    mandatoryUpdateMessage: 'This app needs to be updated to ensure its reliability and security.',
    mandatoryContinueButtonLabel: "Update"
  },
  installMode: codePush.InstallMode.IMMEDIATE
};

AppRegistry.registerComponent('Bitmark', () => codePush(codePushOptions)(App));

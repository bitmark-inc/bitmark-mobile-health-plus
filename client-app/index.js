import codePush from "react-native-code-push";
import { AppRegistry } from 'react-native';
import App from './App';

let codePushOptions = {
  updateDialog: true,
  // updateDialog: {
  //   title: 'New version is avaiable',
  //   mandatoryUpdateMessage: 'You have to install new version to use app!',
  //   mandatoryContinueButtonLabel: "Install"
  // },
  installMode: codePush.InstallMode.IMMEDIATE
};

AppRegistry.registerComponent('Bitmark', () => codePush(codePushOptions)(App));

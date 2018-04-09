// import codePush from "react-native-code-push";
import { AppRegistry } from 'react-native';
import App from './App';


// codePush.checkForUpdate('H0VznPOIIkUc31GdXzWi5vSAifvk5247aad0', (updateInfo) => {
//   console.log('updateInfo :', updateInfo);
// }).then(result => console.log(' check result :', result)).catch(error => console.log('error :', error));

// console.log(' check =================================');

// let codePushOptions = {
//   // updateDialog: true,
//   updateDialog: {
//     title: 'Bitmark” Needs to Be Updated',
//     mandatoryUpdateMessage: 'This app needs to be updated to ensure its reliability and security.',
//     mandatoryContinueButtonLabel: "Update"
//   },
//   installMode: codePush.InstallMode.IMMEDIATE
// };

// AppRegistry.registerComponent('Bitmark', () => codePush(codePushOptions)(App));
AppRegistry.registerComponent('Bitmark', () => App);

import React from 'react';
import { View, Text } from 'react-native';

import codePush from "react-native-code-push";
import { BitmarkAppComponent } from './components';
import { convertWidth } from './utils';

export class MainAppComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      status: null,
      progress: null,
    };

    codePush.getCurrentPackage().then(updateInfo => {
      console.log('current package :', updateInfo);
    });
  }

  codePushStatusDidChange(status) {
    switch (status) {
      case codePush.SyncStatus.CHECKING_FOR_UPDATE:
        this.setState({ status: 'checking' });
        console.log("Checking for updates.");
        break;
      case codePush.SyncStatus.DOWNLOADING_PACKAGE:
        this.setState({ status: 'downloading' });
        console.log("Downloading package.");
        break;
      case codePush.SyncStatus.INSTALLING_UPDATE:
        this.setState({ status: 'installing' });
        console.log("Installing update.");
        break;
      case codePush.SyncStatus.UP_TO_DATE:
        this.setState({ status: 'updated' });
        console.log("Up-to-date.");
        break;
      case codePush.SyncStatus.UPDATE_INSTALLED:
        this.setState({ status: 'updated' });
        console.log("Update installed.");
        break;
    }
  }

  codePushDownloadDidProgress(progress) {
    this.setState({ progress: Math.floor(progress.receivedBytes * 100 / progress.totalBytes) + " %." });
    console.log(Math.floor(progress.receivedBytes * 100 / progress.totalBytes));
  }

  render() {
    console.log('this.state:', this.state);
    return (
      <View style={{ flex: 1 }}>
        {this.state.status && this.state.status !== 'updated' && <View style={{
          position: 'absolute', top: 0, width: '100%', height: '100%', zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.5)',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <View style={{
            width: convertWidth(300), height: 100,
            borderRadius: 10,
            backgroundColor: 'white',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Text>{this.state.status}</Text>
            <Text>{this.state.progress || 0}</Text>
          </View>
        </View>}
        <BitmarkAppComponent />
      </View >
    );
  }
}

let codePushOptions = {
  // updateDialog: true,
  updateDialog: {
    title: 'Bitmark” Needs to Be Updated',
    mandatoryUpdateMessage: 'This app needs to be updated to ensure its reliability and security.',
    mandatoryContinueButtonLabel: "Update",
    optionalIgnoreButtonLabel: null,
  },
  installMode: codePush.InstallMode.IMMEDIATE
};

let CodePushMainAppComponent = codePush(codePushOptions)(MainAppComponent);

export { BitmarkAppComponent, CodePushMainAppComponent };
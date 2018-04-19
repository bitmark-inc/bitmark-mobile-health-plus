import React from 'react';
import { View, ActivityIndicator } from 'react-native';

import codePush from "react-native-code-push";
import { BitmarkAppComponent } from './components';

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
        break;
      case codePush.SyncStatus.DOWNLOADING_PACKAGE:
        this.setState({ status: 'downloading' });
        break;
      case codePush.SyncStatus.INSTALLING_UPDATE:
        this.setState({ status: 'installing' });
        break;
      case codePush.SyncStatus.UP_TO_DATE:
        this.setState({ status: 'updated' });
        break;
      case codePush.SyncStatus.UPDATE_INSTALLED:
        this.setState({ status: 'updated' });
        break;
    }
  }

  codePushDownloadDidProgress(progress) {
    this.setState({ progress: Math.floor(progress.receivedBytes * 100 / progress.totalBytes) + " %." });
    console.log(Math.floor(progress.receivedBytes * 100 / progress.totalBytes));
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        {this.state.status && this.state.status === 'downloading' && this.state.status === 'installing' && <View style={{
          position: 'absolute', top: 0, width: '100%', height: '100%', zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.5)',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <ActivityIndicator size="large" />
        </View>}
        <BitmarkAppComponent />
      </View >
    );
  }
}

let codePushOptions = {
  updateDialog: {
    title: '"Bitmark"\nNeeds to Be Updated',
    mandatoryUpdateMessage: 'This app needs to be updated to ensure its reliability and security.',
    mandatoryContinueButtonLabel: "UPDATE",
    optionalIgnoreButtonLabel: null,
  },
  installMode: codePush.InstallMode.IMMEDIATE
};

let CodePushMainAppComponent = codePush(codePushOptions)(MainAppComponent);

export { BitmarkAppComponent, CodePushMainAppComponent };
import React from 'react';
import { View } from 'react-native';

import codePush from "react-native-code-push";
import { BitmarkAppComponent, CodePushUpdateComponent } from './components';

export class MainAppComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      status: null,
      progress: 0,
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
    this.setState({ progress: Math.floor(progress.receivedBytes * 100 / progress.totalBytes) });
    console.log(Math.floor(progress.receivedBytes * 100 / progress.totalBytes));
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <CodePushUpdateComponent shouldRender={this.state.status && (this.state.status === 'downloading' || this.state.status === 'installing')}
          status={this.state.status} progress={this.state.progress} />
        <BitmarkAppComponent />
      </View>
    );
  }
}

let codePushOptions = {
  updateDialog: {
    title: '"Bitmark"\nNeeds to Be Updated',
    optionalUpdateMessage: 'The developer of this app needs to update it to improve its compatibility. This will be quick and will not affect any of your data.',
    mandatoryUpdateMessage: 'The developer of this app needs to update it to improve its compatibility. This will be quick and will not affect any of your data.',
    optionalInstallButtonLabel: 'Update',
    mandatoryContinueButtonLabel: 'Update',
    optionalIgnoreButtonLabel: null
  },
  checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
  installMode: codePush.InstallMode.IMMEDIATE
};

let CodePushMainAppComponent = codePush(codePushOptions)(MainAppComponent);

export { BitmarkAppComponent, CodePushMainAppComponent };
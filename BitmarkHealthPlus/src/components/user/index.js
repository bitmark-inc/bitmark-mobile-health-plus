
import React, { Component } from 'react';
import { Router, Scene, Stack, Actions, } from 'react-native-router-flux';
import { UserComponent } from './user.component';
import { AccountComponent } from './account.component';
import { AccountPhraseComponent } from './account-phrases.component';
import { SupportComponent } from './support.component';
import { BitmarkHealthDataComponent } from './bitmark-health-data.component';
import { CaptureAssetComponent } from './capture-asset.component';

import { BitmarkLegalComponent } from './../../commons';


// bitmarkHealthData


export class UserRouterComponent extends Component {
  componentDidMount() {
    Actions.refresh();
  }
  render() {
    return (
      <Router sceneStyle={{ shadowOpacity: 0, flex: 1 }}  >
        <Stack hideNavBar={true} >
          <Scene key="user" component={UserComponent} initial={true} />
          <Scene key="account" component={AccountComponent} />
          <Scene key="accountPhrase" component={AccountPhraseComponent} />
          <Scene key="support" component={SupportComponent} />
          <Scene key="legal" component={BitmarkLegalComponent} />
          <Scene key="bitmarkHealthData" component={BitmarkHealthDataComponent} panHandlers={null} />
          <Scene key="captureAsset" component={CaptureAssetComponent} />

        </Stack>
      </Router>
    );
  }
}

export * from './user.component';

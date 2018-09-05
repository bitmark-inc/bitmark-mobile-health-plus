
import React, { Component } from 'react';
import { Router, Scene, Stack, Actions, } from 'react-native-router-flux';
import { UserComponent } from './user.component';
import { AccountComponent } from './account.component';
import { AccountPhraseComponent } from './account-phrases.component';
import { SupportComponent } from './support.component';
import { BitmarkHealthDataComponent } from './bitmark-health-data.component';
import { CaptureAssetComponent } from './capture-asset.component';
import { BitmarkListComponent } from './bitmark-list.component';

import { BitmarkLegalComponent } from './../../commons';
import { BitmarkDetailComponent } from './bitmark-detail.component';
import { DeletingAccountComponent } from './deleting-account.component';


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
          <Scene key="bitmarkHealthData" component={BitmarkHealthDataComponent} panHandlers={null} />
          <Scene key="account" component={AccountComponent} />
          <Scene key="accountPhrase" component={AccountPhraseComponent} />
          <Scene key="support" component={SupportComponent} />
          <Scene key="legal" component={BitmarkLegalComponent} />
          <Scene key="captureAsset" component={CaptureAssetComponent} />
          <Scene key="bitmarkList" component={BitmarkListComponent} />
          <Scene key="bitmarkDetail" component={BitmarkDetailComponent} />
          <Scene key="deletingAccount" component={DeletingAccountComponent} />

        </Stack>
      </Router>
    );
  }
}

export * from './user.component';

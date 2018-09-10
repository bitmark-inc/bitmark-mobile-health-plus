
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
import { GrantingAccessComponent } from './granting-access.component';
import { OtherAccountsComponent } from './other-account.component';
import { ScanAccessQRCodeComponent } from './scan-access-qr-code.component';
import { ConfirmAccessComponent } from './confirm-access.component';
import { RevokeAccessComponent } from './revoke-access.component';
import { FullViewCaptureAssetComponent } from './full-view-capture-asset.component';


// bitmarkHealthData


export class UserRouterComponent extends Component {
  componentDidMount() {
    Actions.refresh();
  }
  render() {
    return (
      <Router sceneStyle={{ shadowOpacity: 0, flex: 1 }}  >
        <Stack hideNavBar={true} >
          <Scene key="user" component={UserComponent} initial={true} panHandlers={null} />
          <Scene key="bitmarkHealthData" component={BitmarkHealthDataComponent} panHandlers={null} />
          <Scene key="account" component={AccountComponent} />
          <Scene key="accountPhrase" component={AccountPhraseComponent} />
          <Scene key="support" component={SupportComponent} />
          <Scene key="legal" component={BitmarkLegalComponent} />
          <Scene key="captureAsset" component={CaptureAssetComponent} />
          <Scene key="bitmarkList" component={BitmarkListComponent} />
          <Scene key="bitmarkDetail" component={BitmarkDetailComponent} />
          <Scene key="deletingAccount" component={DeletingAccountComponent} />
          <Scene key="grantingAccess" component={GrantingAccessComponent} />
          <Scene key="otherAccounts" component={OtherAccountsComponent} />
          <Scene key="scanAccessQRCode" component={ScanAccessQRCodeComponent} />
          <Scene key="confirmAccess" component={ConfirmAccessComponent} />
          <Scene key="revokeAccess" component={RevokeAccessComponent} />
          <Scene key="fullViewCaptureAsset" component={FullViewCaptureAssetComponent} />
        </Stack>
      </Router>
    );
  }
}

export * from './user.component';

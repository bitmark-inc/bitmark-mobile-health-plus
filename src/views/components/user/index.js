
import React, { Component } from 'react';
import { Router, Scene, Stack, Actions, } from 'react-native-router-flux';

import { UserComponent } from './user.component';
import { AccountComponent } from './account.component';
import { AccountPhraseComponent } from './account-phrases.component';
import { SupportComponent } from './support.component';
import { BitmarkHealthDataComponent } from './bitmark-health-data.component';
import { CaptureAssetComponent } from './capture-asset.component';
import { BitmarkListComponent } from './bitmark-list.component';

import { BitmarkDetailComponent } from './bitmark-detail.component';
import { FullViewCaptureAssetComponent } from './full-view-capture-asset.component';
import { EmailRecordComponent } from './email-record.component';
import { AssetNameInform } from "./asset-name-inform.component";
import { GetStartComponent } from './get-start.component';
import { AddRecordComponent } from './add-record.component';
import { AccountNumberComponent } from './account-number.component';
import { CaptureMultipleImagesComponent } from './capture-multiple-image.component';
import { OrderCombineImagesComponent } from './order-combine-images.component';
import { TaggingComponent } from "./tagging.component";
import { DataProcessor } from 'src/processors';
import { BitmarkLegalComponent, WhatNewComponent } from 'src/views/commons';
import { MMRInformationComponent } from './mmr';

export class UserRouterComponent extends Component {
  componentDidMount() {
    Actions.refresh();
    DataProcessor.setMountedRouter();
  }
  render() {
    return (
      <Router sceneStyle={{ shadowOpacity: 0, flex: 1 }}  >
        <Stack hideNavBar={true} >
          <Scene key="user" component={UserComponent} initial={true} panHandlers={null} />
          <Scene key="bitmarkHealthData" component={BitmarkHealthDataComponent} panHandlers={null} />
          <Scene key="emailRecords" component={EmailRecordComponent} panHandlers={null} />
          <Scene key="account" component={AccountComponent} />
          <Scene key="accountPhrase" component={AccountPhraseComponent} />
          <Scene key="support" component={SupportComponent} />
          <Scene key="legal" component={BitmarkLegalComponent} />
          <Scene key="captureAsset" component={CaptureAssetComponent} />
          <Scene key="bitmarkList" component={BitmarkListComponent} />
          <Scene key="bitmarkDetail" component={BitmarkDetailComponent} />
          <Scene key="fullViewCaptureAsset" component={FullViewCaptureAssetComponent} />
          <Scene key="assetNameInform" component={AssetNameInform} />
          <Scene key="getStart" component={GetStartComponent} />
          <Scene key="addRecord" component={AddRecordComponent} />
          <Scene key="accountNumber" component={AccountNumberComponent} />
          <Scene key="captureMultipleImages" component={CaptureMultipleImagesComponent} />
          <Scene key="orderCombineImages" component={OrderCombineImagesComponent} />
          <Scene key="whatNew" component={WhatNewComponent} panHandlers={null} />
          <Scene key="tagging" component={TaggingComponent} />
          <Scene key="mmrInformation" component={MMRInformationComponent} panHandlers={null} />
        </Stack>
      </Router>
    );
  }
}

export * from './user.component';

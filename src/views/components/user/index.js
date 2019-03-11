
import React, { Component } from 'react';
import { Router, Scene, Stack, Actions, } from 'react-native-router-flux';

import { UserComponent } from './user.component';
import { AccountComponent } from './account.component';
import { AccountPhraseComponent } from './account-phrases.component';
import { SupportComponent } from './support.component';

import { BitmarkDetailComponent } from './bitmark-detail.component';
import { FullViewCaptureAssetComponent } from './full-view-capture-asset.component';
import { EmailRecordComponent } from './email-record.component';
import { AddRecordComponent } from './add-record.component';
import { AccountNumberComponent } from './account-number.component';
import { CaptureMultipleImagesComponent } from './capture-multiple-image.component';
import { EditIssueComponent } from './edit-issue.component';
import { TaggingComponent } from "./tagging.component";
import { DataProcessor } from 'src/processors';
import { BitmarkLegalComponent, WhatNewComponent } from 'src/views/commons';
import { EMRInformationComponent } from './emr';
import { EditBitmarkComponent } from "./edit-bitmark.component";
import { HealthDataGetStartComponent } from "./health-data-get-start.component";
import { DailyHealthDataFullCardComponent } from "./card/daily-health-data-full-card.component";
import { VerifyPhraseWordsComponent } from "../home/verify-phrase-words.component";
import { ArrangePhotosComponent } from "./arrange-photos.component";

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
          <Scene key="emailRecords" component={EmailRecordComponent} panHandlers={null} />
          <Scene key="account" component={AccountComponent} panHandlers={null} />
          <Scene key="accountPhrase" component={AccountPhraseComponent} panHandlers={null} />
          <Scene key="support" component={SupportComponent} panHandlers={null} />
          <Scene key="legal" component={BitmarkLegalComponent} panHandlers={null} />
          <Scene key="bitmarkDetail" component={BitmarkDetailComponent} panHandlers={null} />
          <Scene key="fullViewCaptureAsset" component={FullViewCaptureAssetComponent} />
          <Scene key="healthDataGetStart" component={HealthDataGetStartComponent} panHandlers={null} />
          <Scene key="addRecord" component={AddRecordComponent} panHandlers={null} />
          <Scene key="accountNumber" component={AccountNumberComponent} panHandlers={null} />
          <Scene key="captureMultipleImages" component={CaptureMultipleImagesComponent} panHandlers={null} />
          <Scene key="editIssue" component={EditIssueComponent} panHandlers={null} />
          <Scene key="arrangePhotos" component={ArrangePhotosComponent} panHandlers={null} />
          <Scene key="editBitmark" component={EditBitmarkComponent} panHandlers={null} />
          <Scene key="whatNew" component={WhatNewComponent} panHandlers={null} />
          <Scene key="tagging" component={TaggingComponent} panHandlers={null} />
          <Scene key="emrInformation" component={EMRInformationComponent} panHandlers={null} />
          <Scene key="dailyHealthDataFullCard" component={DailyHealthDataFullCardComponent} panHandlers={null} />
          <Scene key="verifyPhraseWords" component={VerifyPhraseWordsComponent} panHandlers={null} />
        </Stack>
      </Router>
    );
  }
}

export * from './user.component';

import { HomeComponent } from './home.component';
import { VerifyPhraseWordsComponent } from './verify-phrase-words.component';

import React, { Component } from 'react';
import { Router, Scene, Stack, } from 'react-native-router-flux';
import { TouchFaceIdComponent } from './touch-face-id.component';
import { DataProcessor } from 'src/processors';
import { BitmarkLegalComponent, WhatNewComponent } from 'src/views/commons';
import { GenerateHealthCodeComponent } from "./generate-health-code.component";

export class HomeRouterComponent extends Component {
  componentDidMount() {
    DataProcessor.setMountedRouter();
  }
  render() {
    return (
      <Router sceneStyle={{
        shadowOpacity: 0,
      }} >
        <Stack hideNavBar={true} >
          <Scene key="home" component={HomeComponent} initial={true} />
          <Scene key="verifyPhraseWords" component={VerifyPhraseWordsComponent} />
          <Scene key="touchFaceId" component={TouchFaceIdComponent} />
          <Scene key="legal" component={BitmarkLegalComponent} />
          <Scene key="generateHealthCode" component={GenerateHealthCodeComponent} />
          <Scene key="whatNew" component={WhatNewComponent} panHandlers={null} />
        </Stack>
      </Router>
    );
  }
}


export * from "./home.component";
export * from "./verify-phrase-words.component";

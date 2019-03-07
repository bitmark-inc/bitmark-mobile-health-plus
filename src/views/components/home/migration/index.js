import React, { Component } from 'react';
import { Router, Scene, Stack, } from 'react-native-router-flux';
import { DataProcessor } from 'src/processors';
import { GenerateHealthCodeComponent } from "../generate-health-code.component";
import { MigrationHomeComponent } from './migration-home.component';
import { UpgradeComponent } from "./upgrade.component";
import { WhatNextComponent } from "./what-next.component";
import { LoginComponent } from "../login.component";

export class MigrationRouterComponent extends Component {
  componentDidMount() {
    DataProcessor.setMountedRouter();
  }
  render() {
    return (
      <Router sceneStyle={{
        shadowOpacity: 0,
      }} >
        <Stack hideNavBar={true} >
          <Scene key="migrationHome" component={MigrationHomeComponent} initial={true} />
          <Scene key="generateHealthCode" component={GenerateHealthCodeComponent} panHandlers={null} />
          <Scene key="login" component={LoginComponent} panHandlers={null} />
          <Scene key="whatNext" component={WhatNextComponent} panHandlers={null}/>
          <Scene key="upgrade" component={UpgradeComponent} panHandlers={null}/>
        </Stack>
      </Router>
    );
  }
}

export * from "./migration-home.component";

import { HomeComponent } from './home.component';
import { LoginComponent } from './login.component';

import React, { Component } from 'react';
import { Router, Scene, Stack, } from 'react-native-router-flux';
import { TouchFaceIdComponent } from './touch-face-id.component';


export class HomeRouterComponent extends Component {
  render() {
    return (
      <Router sceneStyle={{
        shadowOpacity: 0,
      }} >
        <Stack hideNavBar={true} >
          <Scene key="home" component={HomeComponent} initial={true} />
          <Scene key="login" component={LoginComponent} />
          <Scene key="touchFaceId" component={TouchFaceIdComponent} />
        </Stack>
      </Router>
    );
  }
}


export * from "./home.component";
export * from "./login.component";

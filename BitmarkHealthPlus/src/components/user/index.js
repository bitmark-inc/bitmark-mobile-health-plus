
import React, { Component } from 'react';
import { Router, Scene, Stack, } from 'react-native-router-flux';
import { UserComponent } from './user.component';


export class UserRouterComponent extends Component {
  render() {
    return (
      <Router sceneStyle={{ shadowOpacity: 0, flex: 1 }}  >
        <Stack hideNavBar={true} >
          <Scene key="user" component={UserComponent} initial={true} />
        </Stack>
      </Router>
    );
  }
}

export * from './user.component';


import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { View, StatusBar } from 'react-native';


import {
  LoadingComponent,
} from '../commons'
import { HomeRouterComponent } from './home';
import { } from './user';

export class MainComponent extends Component {
  static propTypes = {
    message: PropTypes.string,
  };

  doOpenApp() {

  }
  doLoad() {

  }

  render() {
    let DisplayComponent = LoadingComponent;
    DisplayComponent = HomeRouterComponent;
    return (
      <View style={{ flex: 1 }}>
        <StatusBar hidden={true} />
        <DisplayComponent />
      </View>
    );
  }
}


import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { View, StatusBar } from 'react-native';


import {
  LoadingComponent,
} from '../commons'
import { HomeComponent } from './home';
import { UserComponent } from './user';

export class MainComponent extends Component {
  static propTypes = {
    message: PropTypes.string,
  };
  render() {

    let DisplayComponent = LoadingComponent;
    DisplayComponent = HomeComponent;
    DisplayComponent = UserComponent;
    return (
      <View style={{ flex: 1 }}>
        <StatusBar hidden={true} />
        <DisplayComponent />
      </View>
    );
  }
}

import React from 'react';
import PropTypes from 'prop-types';
import {
  Text, ActivityIndicator,
} from 'react-native';

import { BitmarkDialogComponent } from './../bitmark-dialog';
import dialogStyles from './bitmark-indicator.component.style';

export class BitmarkIndicatorComponent extends React.Component {
  constructor(props) {
    super(props);
    let indicator = this.props.indicator === false ? false : true;
    this.state = { indicator: indicator }
  }
  render() {
    return (
      <BitmarkDialogComponent>
        {this.state.indicator && <ActivityIndicator size="large" style={dialogStyles.indicatorImage} />}
        {this.props.message && <Text style={dialogStyles.indicatorMessage}>{this.props.message}</Text>}
      </BitmarkDialogComponent>
    );
  }
}
BitmarkIndicatorComponent.propTypes = {
  indicator: PropTypes.bool,
  message: PropTypes.string,
}

export class DefaultIndicatorComponent extends React.Component {
  render() {
    return (
      <BitmarkDialogComponent dialogStyle={{ backgroundColor: 'rgba(0, 0, 0, 0)', }}>
        <ActivityIndicator size="large" style={dialogStyles.indicatorImage} />
      </BitmarkDialogComponent>
    );
  }
}
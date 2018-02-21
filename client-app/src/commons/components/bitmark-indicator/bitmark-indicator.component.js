import React from 'react';
import PropTypes from 'prop-types';
import {
  Text, ActivityIndicator, View,
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
        <View style={dialogStyles.content}>
          {this.state.indicator && <ActivityIndicator size="large" style={dialogStyles.indicatorImage} />}
          <View style={dialogStyles.textArea}>
            {!!this.props.title && <Text style={dialogStyles.indicatorTitle}>{this.props.title}</Text>}
            {!!this.props.message && <Text style={dialogStyles.indicatorMessage}>{this.props.message}</Text>}
          </View>
        </View>
      </BitmarkDialogComponent>
    );
  }
}
BitmarkIndicatorComponent.propTypes = {
  indicator: PropTypes.bool,
  message: PropTypes.string,
  title: PropTypes.string,
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
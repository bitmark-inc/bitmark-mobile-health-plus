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
    this.state = {
      indicator: this.props.indicator,
      message: this.props.message,
      title: this.props.title,
    };
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      indicator: nextProps.indicator,
      message: nextProps.message,
      title: nextProps.title,
    });
  }

  render() {
    return (
      <BitmarkDialogComponent style={dialogStyles.dialog}>
        <View style={dialogStyles.content}>
          {!!this.state.indicator && <ActivityIndicator size="large" style={dialogStyles.indicatorImage} />}
          <View style={dialogStyles.textArea}>
            {!!this.state.title && <Text style={[dialogStyles.indicatorTitle, {
              marginTop: this.state.indicator ? 0 : 23,
            }]}>{this.state.title}</Text>}
            {!!this.state.message && <Text style={dialogStyles.indicatorMessage}>{this.state.message}</Text>}
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
      <BitmarkDialogComponent style={dialogStyles.dialog} dialogStyle={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}>
        <ActivityIndicator size="large" style={dialogStyles.indicatorImage} />
      </BitmarkDialogComponent>
    );
  }
}
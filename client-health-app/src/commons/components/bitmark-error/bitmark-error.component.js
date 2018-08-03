import React from 'react';
import PropTypes from 'prop-types';
import {
  Text, View, TouchableOpacity,
} from 'react-native';

import { BitmarkDialogComponent } from './../bitmark-dialog';
import dialogStyles from './bitmark-error.component.style';

export class BitmarkErrorComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      message: this.props.message,
      title: this.props.title,
    };
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      message: nextProps.message,
      title: nextProps.title,
    });
  }

  render() {
    return (
      <BitmarkDialogComponent style={dialogStyles.dialog} close={this.props.close}>
        <View style={dialogStyles.content}>
          <View style={dialogStyles.textArea}>
            {!!this.state.title && <Text style={dialogStyles.title}>{this.state.title}</Text>}
            {!!this.state.message && <Text style={dialogStyles.message}>{this.state.message}</Text>}
          </View>
          <TouchableOpacity style={dialogStyles.okButton} onPress={this.props.close}>
            <Text style={dialogStyles.okButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </BitmarkDialogComponent>
    );
  }
}
BitmarkErrorComponent.propTypes = {
  close: PropTypes.func.isRequired,
  message: PropTypes.string,
  title: PropTypes.string,
}
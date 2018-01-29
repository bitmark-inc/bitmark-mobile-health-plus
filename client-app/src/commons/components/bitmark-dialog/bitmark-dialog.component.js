import React from 'react';
import PropTypes from 'prop-types';
import {
  View,
} from 'react-native';

import dialogStyles from './bitmark-dialog.component.style';


export class BitmarkDialogComponent extends React.Component {
  render() {
    return (
      <View style={[dialogStyles.dialogBody, this.props.style]}>
        <View style={[dialogStyles.dialogContent, this.props.dialogStyle]}>
          {this.props.children}
        </View>
      </View>
    );
  }
}

BitmarkDialogComponent.propTypes = {
  style: PropTypes.object,
  dialogStyle: PropTypes.object,
  children: PropTypes.object,
};
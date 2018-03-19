import React from 'react';
import PropTypes from 'prop-types';
import {
  View, TouchableWithoutFeedback,
  ViewPropTypes,
} from 'react-native';

import dialogStyles from './bitmark-dialog.component.style';


export class BitmarkDialogComponent extends React.Component {
  render() {
    return (
      <View style={[dialogStyles.dialogBody, this.props.style]}>
        <TouchableWithoutFeedback onPress={() => {
          if (this.props.close) { this.props.close(); }
        }}>
          <View style={[dialogStyles.dialogBodyContent]}>
            <TouchableWithoutFeedback onPress={(event) => event.stopPropagation()}>
              <View style={[dialogStyles.dialogContent, this.props.dialogStyle]}>
                {this.props.children}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </View>
    );
  }
}

BitmarkDialogComponent.propTypes = {
  close: PropTypes.func,
  style: ViewPropTypes.style,
  dialogStyle: PropTypes.object,
  children: PropTypes.object,
};
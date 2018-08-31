import React from 'react';
import PropTypes from 'prop-types';
import {
  View, TouchableWithoutFeedback,
  ViewPropTypes,
  StyleSheet,
} from 'react-native';

import { constants } from '../../constants';
import { convertWidth } from '../../utils';

export class BitmarkDialogComponent extends React.Component {
  static propTypes = {
    close: PropTypes.func,
    style: ViewPropTypes.style,
    dialogStyle: PropTypes.any,
    children: PropTypes.object,
  }

  render() {
    return (
      <View style={[styles.dialogBody, this.props.style]}>
        <TouchableWithoutFeedback onPress={() => {
          if (this.props.close) { this.props.close(); }
        }}>
          <View style={[styles.dialogBodyContent]}>
            <TouchableWithoutFeedback onPress={(event) => event.stopPropagation()}>
              <View style={[styles.dialogContent, this.props.dialogStyle]}>
                {this.props.children}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  dialogBody: {
    flex: 1,
    alignItems: 'center',
    alignContent: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    position: 'absolute',
    top: 0,
    width: '100%',
    height: '100%',
    zIndex: constants.zIndex.dialog,
  },
  dialogBodyContent: {
    alignItems: 'center',
    alignContent: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  dialogContent: {
    width: convertWidth(245),
    minHeight: 125,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
});
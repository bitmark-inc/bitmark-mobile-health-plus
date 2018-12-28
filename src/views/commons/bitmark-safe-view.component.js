import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View
} from 'react-native';
import { config } from 'src/configs';

export class BitmarkSafeViewComponent extends Component {
  static propTypes = {
    children: PropTypes.any,
  }
  render() {
    return (
      <View style={styles.body}>
        {this.props.children}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    width: '100%',
    height: '100%',
    paddingTop: config.isIPhoneX ? 44 : 0,
    paddingBottom: config.isIPhoneX ? 44 : 0,
  },
});

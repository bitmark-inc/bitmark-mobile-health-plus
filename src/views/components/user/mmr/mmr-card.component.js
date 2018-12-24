import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import {
  StyleSheet,
  View,
} from 'react-native';
import { convertWidth } from 'src/utils';


export class MMRCardComponent extends Component {
  static propTypes = {

  };
  render() {
    return (
      <View style={styles.body}>
        <View style={styles.bodyContent}>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  body: {
    padding: convertWidth(16),
    paddingTop: convertWidth(16),
    flex: 1,
  },
  bodyContent: {
    flex: 1,
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: '#FF4444',
    width: "100%",
  },
});

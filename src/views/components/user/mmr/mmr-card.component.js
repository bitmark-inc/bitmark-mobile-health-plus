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
    width: convertWidth(344), minHeight: 224,
    shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.2, shadowColor: '#000000', shadowRadius: 5,
    borderWidth: 1, borderRadius: 4, borderColor: '#F4F2EE',
  },
  bodyContent: {
    flex: 1,
    flexDirection: 'column',
    width: "100%",
    backgroundColor: 'white',
    padding: convertWidth(16), paddingBottom: convertWidth(20),
  },
});

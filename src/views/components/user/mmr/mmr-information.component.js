import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import {
  StyleSheet,
  Linking,
  Alert,
  Image, View, TouchableOpacity, Text, SafeAreaView, ScrollView,
} from 'react-native';
import { convertWidth } from 'src/utils';


export class MMRInformationComponent extends Component {
  static propTypes = {

  };


  render() {
    return (
      <SafeAreaView style={styles.bodySafeView}>
        <View style={styles.body}>
          <View style={styles.bodyContent}>

          </View>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  bodySafeView: {
    flex: 1,
    backgroundColor: 'white',
  },
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

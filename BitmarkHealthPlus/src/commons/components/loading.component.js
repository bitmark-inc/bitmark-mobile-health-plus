import React, { Component } from 'react';
import {
  StyleSheet,
  Image, View, SafeAreaView
} from 'react-native';

import { convertWidth } from './../../utils';


export class LoadingComponent extends Component {
  render() {
    return (
      <View style={styles.body}>
        <View style={styles.bodyContent}>
          <Image style={styles.loadingLogo} source={require('./../../../assets/imgs/loading.png')} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  bodyContent: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingLogo: {
    width: convertWidth(191),
    height: 49 * convertWidth(191) / 191,
    resizeMode: 'contain',
  },
});

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  Image, View, SafeAreaView, TouchableOpacity, Text,
} from 'react-native';

import { convertWidth, } from '../../utils';
import { config } from '../../configs';
import { constants } from '../../constants';
import { Actions } from 'react-native-router-flux';

export class FullViewCaptureAssetComponent extends Component {
  static propTypes = {
    filePath: PropTypes.string,
    title: PropTypes.string,
  };
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <SafeAreaView style={[styles.bodySafeView]}>
        <View style={styles.body}>
          <View style={styles.bodyContent}>
            <View style={styles.titleRow}>
              <Text style={styles.titleText}>{this.props.title}</Text>
              <TouchableOpacity onPress={Actions.pop}>
                <Image style={styles.closeIcon} source={require('./../../../assets/imgs/close_icon_white.png')} />
              </TouchableOpacity>
            </View>
            <View style={styles.content}>
              <Image style={styles.bitmarkImage} source={{ uri: this.props.filePath }} />
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  bodySafeView: {
    flex: 1,
    backgroundColor: 'black',
  },
  body: {
    padding: convertWidth(16),
    paddingTop: convertWidth(16) + (config.isIPhoneX ? constants.iPhoneXStatusBarHeight : 0),
    flex: 1,
  },
  bodyContent: {
    flex: 1,
    flexDirection: 'column',
    width: "100%",
    padding: convertWidth(20),
  },

  titleRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  titleText: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 18,
    color: 'white',
    paddingRight: 15,
  },
  closeIcon: {
    width: convertWidth(21),
    height: convertWidth(21),
    resizeMode: 'contain',
    marginTop: 3,
  },

  content: {
    flex: 1,
    paddingTop: 40,
  },

  bitmarkImage: {
    height: '100%',
    resizeMode: 'contain',
  },
});
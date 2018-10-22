import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from "moment";
import ImageZoom from 'react-native-image-pan-zoom';

import {
  StyleSheet, Dimensions,
  Image, View, TouchableOpacity, Text,
} from 'react-native';

import { convertWidth, } from '../../utils';
import { config } from '../../configs';
import { Actions } from 'react-native-router-flux';

export class FullViewCaptureAssetComponent extends Component {
  static propTypes = {
    filePath: PropTypes.string,
    bitmark: PropTypes.any,
  };
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={[styles.bodySafeView]}>
        <View style={styles.bodyContent}>
          <View style={styles.titleRow}>
            <Text style={styles.titleText}>{moment(this.props.bitmark.asset.created_at).format('YYYY MMM DD').toUpperCase()}</Text>
            <TouchableOpacity onPress={Actions.pop}>
              <Image style={styles.closeIcon} source={require('./../../../assets/imgs/close_icon_white.png')} />
            </TouchableOpacity>
          </View>
          <View style={styles.content}>
            <ImageZoom
              cropWidth={Dimensions.get('window').width}
              cropHeight={Dimensions.get('window').height}
              imageWidth={Dimensions.get('window').width}
              imageHeight={Dimensions.get('window').height}>
              <Image style={{ width: Dimensions.get('window').width, height: Dimensions.get('window').height, resizeMode: 'contain' }} source={{ uri: this.props.filePath }} />
            </ImageZoom>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  bodySafeView: {
    flex: 1,
    backgroundColor: 'black',
  },

  bodyContent: {
    flex: 1,
    flexDirection: 'column',
    width: convertWidth(375),
  },

  titleRow: {
    paddingTop: (config.isIPhoneX ? 44 : 0),
    paddingLeft: convertWidth(20), paddingRight: convertWidth(20),
    position: 'absolute', top: 0, width: convertWidth(375),
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    height: 44 + (config.isIPhoneX ? 44 : 0),
    zIndex: 1,
    backgroundColor: 'black',
  },
  titleText: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 24,
    color: 'white',
    flex: 1,
  },
  closeIcon: {
    width: convertWidth(21),
    height: convertWidth(21),
    resizeMode: 'contain',
  },

  content: {
    flex: 1,
    paddingTop: 40,
  },
});
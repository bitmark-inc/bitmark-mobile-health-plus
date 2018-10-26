import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import { RNCamera } from 'react-native-camera';

import {
  StyleSheet,
  View, TouchableOpacity, Text, Image,
} from 'react-native';
import { convertWidth } from '../../utils';
import { config } from '../../configs';
import { constants } from '../../constants';

export class CaptureMultipleImagesComponent extends Component {
  static propTypes = {

  };
  constructor(props) {
    super(props);
    this.state = {
      isCapturing: true,
      images: [],
      selectedIndex: 0,
    };
  }

  render() {
    return (
      <View style={styles.body}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.button} disabled={!this.state.isCapturing}>
            {this.state.isCapturing && <Text style={styles.buttonText}>Cancel</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} disabled={this.state.images.length === 0}>
            {this.state.images.length > 0 && <Text style={styles.buttonText}>Save</Text>}
          </TouchableOpacity>
        </View>
        <RNCamera
          ref={(ref) => this.cameraRef = ref}
          style={styles.camera}
          type={RNCamera.Constants.Type.back}
        />
        {!this.state.isCapturing && <View style={styles.footer}>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Kepp Retake</Text>
          </TouchableOpacity>
        </View>}

        {!!this.state.isCapturing && <View style={styles.footer}>
          <TouchableOpacity style={[styles.button, { width: '33%', }]}>
            {this.state.images.length > 0 && <Image style={styles.captureIcon} source={{ uri: this.state.images[this.state.images.length - 1] }} />}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, { width: '33%', alignItems: 'center', justifyContent: 'center' }]}>
            <Image style={styles.captureIcon} source={require('./.././../../assets/imgs/capture-image-icon.png')} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, { width: '33%', justifyContent: 'flex-end' }]}>
            <Text style={styles.buttonText}>Done</Text>
          </TouchableOpacity>
        </View>}

      </View>
    );
  }
}

const styles = StyleSheet.create({
  body: {
    flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'black',

  },
  header: {
    padding: 20, paddingTop: 20 + (config.isIPhoneX ? 44 : 22),
    width: '100%',
    flexDirection: 'row', justifyContent: 'space-between',
  },
  camera: {
    borderWidth: 1, borderColor: 'red',
    flex: 1,
    width: '100%',
  },
  footer: {
    padding: 20, paddingTop: 40, paddingBottom: 40,
    width: '100%',
    flexDirection: 'row', justifyContent: 'space-between',
  },
  button: {
    flexDirection: 'row', alignItems: 'center',
    padding: 4,
  },
  buttonText: {
    fontSize: 18, fontWeight: '900', fontFamily: 'Avenir Black', color: 'white',
  },
  captureIcon: {
    width: convertWidth(68),
    height: convertWidth(68),
    resizeMode: 'contain',
  },

});
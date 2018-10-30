import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImageZoom from 'react-native-image-pan-zoom';
import PDFView from 'react-native-view-pdf';

import {
  StyleSheet, Dimensions,
  Image, View, TouchableOpacity, Text, ActivityIndicator,
} from 'react-native';

import { convertWidth, runPromiseWithoutError, FileUtil, } from '../../utils';
import { Actions } from 'react-native-router-flux';
import { config } from '../../configs';
import { EventEmitterService } from '../../services';

export class FullViewCaptureAssetComponent extends Component {
  static propTypes = {
    filePath: PropTypes.string,
    title: PropTypes.string,
  };
  constructor(props) {
    super(props);
    const pdfExtensions = ['PDF'];
    let loading = false;
    let type = 'image';
    if (pdfExtensions.includes(this.props.filePath.substring(this.props.filePath.lastIndexOf('.') + 1).toUpperCase())) {
      loading = true;
      type = 'pdf';
      runPromiseWithoutError(FileUtil.readFile(this.props.filePath, 'base64')).then(result => {
        if (result && result.error) {
          console.log('error:', result.error);
          EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error: result.error, onClose: Actions.pop });
          return;
        }
        this.setState({ content: result });
      })
    }
    this.state = { type, loading, content: null };
  }

  render() {
    console.log('this.state :', this.state, this.props)
    return (
      <View style={[styles.bodySafeView]}>
        <View style={styles.bodyContent}>
          <View style={styles.titleRow}>
            <Text style={styles.titleText}>{this.props.title.toUpperCase()}</Text>
            <TouchableOpacity onPress={Actions.pop}>
              <Image style={styles.closeIcon} source={require('./../../../assets/imgs/close_icon_white.png')} />
            </TouchableOpacity>
          </View>
          <View style={styles.content}>
            {this.state.type === 'image' && <ImageZoom
              cropWidth={Dimensions.get('window').width}
              cropHeight={Dimensions.get('window').height}
              imageWidth={Dimensions.get('window').width * 0.8}
              imageHeight={Dimensions.get('window').height * 0.8}>
              <Image style={{ width: Dimensions.get('window').width * 0.8, height: Dimensions.get('window').height * 0.8, resizeMode: 'contain' }} source={{ uri: this.props.filePath }} />
            </ImageZoom>}

            {this.state.type === 'pdf' && this.state.loading && <ActivityIndicator size='large' />}
            {this.state.type === 'pdf' && !!this.state.content && <PDFView
              fadeInDuration={250.0}
              style={{ flex: 1, borderWidth: 1, width: '100%', }}
              resource={this.state.content}
              resourceType='base64'
              onLoad={() => this.setState({ loading: false })}
              onError={(error) => console.log('Cannot render PDF', error)}
            />}
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
    width: convertWidth(375)
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
    paddingTop: 44 + (config.isIPhoneX ? 44 : 0),
    flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  },
});
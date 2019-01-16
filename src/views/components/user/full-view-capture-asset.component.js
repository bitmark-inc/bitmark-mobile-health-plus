import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImageZoom from 'react-native-image-pan-zoom';
// import PDFView from 'react-native-view-pdf';
import Pdf from 'react-native-pdf';

import {
  StyleSheet, Dimensions,
  Image, View, TouchableOpacity, Text, ActivityIndicator,
} from 'react-native';

import { Actions } from 'react-native-router-flux';
import { convertWidth } from 'src/utils';
import { config } from 'src/configs';
import { CacheData } from 'src/processors';

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
    if (this.props.filePath) {
      if (pdfExtensions.includes(this.props.filePath.substring(this.props.filePath.lastIndexOf('.') + 1).toUpperCase())) {
        loading = true;
        type = 'pdf';
      }
      this.state = { type, loading };
    }
  }

  componentDidMount() {
    if (!this.props.filePath) {
      Actions.pop();
    }
  }

  render() {
    return (
      <View style={styles.bodyContent}>
        {/*TOP BAR*/}
        <View style={styles.topBar}>
          {/*Back Icon*/}
          <TouchableOpacity style={styles.closeButton} onPress={Actions.pop}>
            <Image style={styles.closeIcon} source={require('assets/imgs/back-icon-black.png')} />
          </TouchableOpacity>
          {/*EMR Icon*/}
          <TouchableOpacity style={{ paddingRight: convertWidth(16), }} onPress={() => { Actions.emrInformation() }}>
            <Image style={styles.profileIcon} source={(CacheData.userInformation.currentEMRData && CacheData.userInformation.currentEMRData.avatar) ? {
              uri: CacheData.userInformation.currentEMRData.avatar
            } : require('assets/imgs/profile-icon.png')} />
          </TouchableOpacity>
        </View>

        {/*CONTENT*/}
        <View style={[styles.content, this.state.type === 'image' ? { alignItems: 'center', justifyContent: 'center', paddingBottom: config.isIPhoneX ? 44 : 20 } : {}]}>
          {this.state.type === 'image' && <ImageZoom
            cropWidth={Dimensions.get('window').width}
            cropHeight={(Dimensions.get('window').height - 56)}
            imageWidth={Dimensions.get('window').width * 0.8}
            imageHeight={(Dimensions.get('window').height) * 0.8}>
            <Image style={{ width: Dimensions.get('window').width * 0.8, height: (Dimensions.get('window').height) * 0.8, resizeMode: 'contain' }} source={{ uri: this.props.filePath }} />
          </ImageZoom>}

          {this.state.type === 'pdf' && this.state.loading && <ActivityIndicator size='large' />}
          {this.state.type === 'pdf' &&
            <View style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
              <Pdf
                source={{ uri: `file://${this.props.filePath}` }}
                scale={0.5}
                minScale={0.2}
                horizontal={false}
                onLoadComplete={() => {
                  this.setState({ loading: false });
                }}
                onPageChanged={(page, numberOfPages) => {
                  console.log(`current page: ${page}`);
                  this.setState({ pagination: `< ${page} / ${numberOfPages} >` })
                }}
                onError={(error) => {
                  console.log('load pdf error :', error);
                }}
                style={{ flex: 1, width: '100%' }} />

              {/*Pagination*/}
              <View style={styles.pagination}>
                <Text style={[styles.paginationText]}>{this.state.pagination}</Text>
              </View>
            </View>
          }
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({

  bodyContent: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
    paddingTop: config.isIPhoneX ? 44 : 20,
  },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    height: 56,
    width: '100%',
  },
  closeButton: {
    height: '100%',
    paddingLeft: convertWidth(16),
    alignItems: 'center', justifyContent: 'center',
  },
  closeIcon: {
    width: convertWidth(16),
    height: convertWidth(16),
    resizeMode: 'contain',
  },
  profileIcon: {
    width: 32,
    height: 32,
    resizeMode: 'cover',
    borderWidth: 0.1, borderRadius: 16, borderColor: 'white',
  },
  content: {
    backgroundColor: 'black',
    flex: 1,
    paddingTop: 56 + (config.isIPhoneX ? 44 : 0),
    flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  },
  pagination: {
    height: 44,
    width: '100%',
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center'
  },
  paginationText: {
    fontFamily: 'AvenirNextW1G-Bold',
    fontSize: 10,
    color: '#FFFFFF',
  }
});
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { RNCamera } from 'react-native-camera';
import Swiper from 'react-native-swiper';
import moment from 'moment';
import {
  StyleSheet,
  Alert,
  View, TouchableOpacity, Text, Image,
} from 'react-native';
import { convertWidth, } from '../../utils';
import { config } from '../../configs';
import { Actions } from 'react-native-router-flux';


export class CaptureMultipleImagesComponent extends Component {
  static propTypes = {
    doIssueImage: PropTypes.func,
  };
  static STEP = {
    capture: 'capture',
    detail: 'detail',
    list: 'list',
  }
  constructor(props) {
    super(props);

    this.state = {
      step: CaptureMultipleImagesComponent.STEP.capture,
      images: [],
      selectedIndex: -1,
    };
  }

  async captureImage() {
    if (this.cameraRef) {
      if (this.state.images.length >= 10) {
        Alert.alert(i18n.t('CaptureMultipleImagesComponent_titleLimitModal'), i18n.t('CaptureMultipleImagesComponent_messageLimitModal', { maximum: 10 }));
        return;
      }
      const options = { quality: 1 };
      const data = await this.cameraRef.takePictureAsync(options);
      let images = this.state.images;
      let selectedIndex = this.state.selectedIndex < 0 ? images.length : this.state.selectedIndex;


      if (this.state.selectedIndex < 0 || this.state.selectedIndex === images.length) {
        images.push({ uri: data.uri, createdAt: moment().toDate().toISOString() });
      } else {
        images.splice(selectedIndex, 0, { uri: data.uri, createdAt: moment().toDate().toISOString() });
      }
      this.setState({
        images,
        selectedIndex,
        step: CaptureMultipleImagesComponent.STEP.detail
      });
    }
  }

  saveImages() {
    if (this.state.images.length > 1) {
      // Actions.recordImages({ images: this.state.images, doIssueImage: this.props.doIssueImage });
      Actions.orderCombineImages({ images: this.state.images, doIssueImage: this.props.doIssueImage });
    } else {
      this.props.doIssueImage(this.state.images);
    }
  }

  retakeImage() {
    let images = this.state.images;
    images.splice(this.state.selectedIndex, 1);
    this.setState({
      images,
      step: CaptureMultipleImagesComponent.STEP.capture,
    });
  }

  keepImage() {
    this.setState({
      selectedIndex: - 1,
      step: CaptureMultipleImagesComponent.STEP.capture,
    });
  }
  viewImages() {
    this.setState({
      step: CaptureMultipleImagesComponent.STEP.list,
    });
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        {this.state.step === CaptureMultipleImagesComponent.STEP.capture && <View style={styles.body}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.button} onPress={Actions.pop}>
              <Text style={styles.buttonText}>{i18n.t('CaptureMultipleImagesComponent_buttonText1')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} disabled={this.state.images.length === 0} onPress={this.saveImages.bind(this)}>
              {this.state.images.length > 0 && <Text style={styles.buttonText}>{i18n.t('CaptureMultipleImagesComponent_buttonText2')}({this.state.images.length})</Text>}
            </TouchableOpacity>
          </View>
          <RNCamera
            ref={(ref) => this.cameraRef = ref}
            style={styles.camera}
            type={RNCamera.Constants.Type.back}
          />
          <View style={styles.footer}>
            <TouchableOpacity style={[styles.button, { width: '33%', }]} disabled={this.state.images.length === 0} onPress={this.viewImages.bind(this)}>
              {this.state.images.length > 0 && <Image style={styles.captureIcon} source={{ uri: this.state.images[this.state.images.length - 1].uri }} />}
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, { width: '33%', alignItems: 'center', justifyContent: 'center' }]} onPress={this.captureImage.bind(this)}>
              <Image style={styles.captureIcon} source={require('./.././../../assets/imgs/capture-image-icon.png')} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, { width: '33%', justifyContent: 'flex-end' }]}>
            </TouchableOpacity>
          </View>
        </View>}



        {this.state.step === CaptureMultipleImagesComponent.STEP.detail && <View style={styles.body}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.button} disabled={true}>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} disabled={this.state.images.length === 0} onPress={this.saveImages.bind(this)}>
              {this.state.images.length > 0 && <Text style={styles.buttonText}>{i18n.t('CaptureMultipleImagesComponent_buttonText2')}({this.state.images.length})</Text>}
            </TouchableOpacity>
          </View>
          <View style={styles.imageArea}>
            <Image style={styles.imageDetail} source={{ uri: this.state.images[this.state.selectedIndex].uri }} />
          </View>
          <View style={styles.footer}>
            <TouchableOpacity style={styles.button} onPress={this.retakeImage.bind(this)}>
              <Text style={styles.buttonText}>{i18n.t('CaptureMultipleImagesComponent_buttonText3')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={this.keepImage.bind(this)}>
              <Text style={styles.buttonText}>{i18n.t('CaptureMultipleImagesComponent_buttonText4')}</Text>
            </TouchableOpacity>
          </View>
        </View>}

        {this.state.step === CaptureMultipleImagesComponent.STEP.list && <View style={styles.body}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.button} disabled={true}>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} disabled={this.state.images.length === 0} onPress={this.saveImages.bind(this)}>
              {this.state.images.length > 0 && <Text style={styles.buttonText}>{i18n.t('CaptureMultipleImagesComponent_buttonText2')}({this.state.images.length})</Text>}
            </TouchableOpacity>
          </View>
          <Swiper
            loop={false}
            scrollEnabled={true}
            renderPagination={(index, total) => {
              return (<View style={styles.pagination}>
                <Text style={styles.paginationText}>{index + 1}/{total}</Text>
              </View>)
            }}
            onIndexChanged={(selectedIndex) => this.setState({ selectedIndex })
            }
          >
            {this.state.images.map((item, index) => {
              return (<View style={styles.imageArea} key={index}>
                <Image style={styles.imageDetail} source={item} />
              </View>)
            })}
          </Swiper>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.button} onPress={this.retakeImage.bind(this)}>
              <Text style={styles.buttonText}>{i18n.t('CaptureMultipleImagesComponent_buttonText3')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={this.keepImage.bind(this)}>
              <Text style={styles.buttonText}>{i18n.t('CaptureMultipleImagesComponent_buttonText4')}</Text>
            </TouchableOpacity>
          </View>
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
  imageArea: {
    flex: 1,
    width: '100%',
  },
  imageDetail: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  pagination: {
    position: 'absolute', top: -10,
    justifyContent: 'center', alignItems: 'center',
    width: '100%',
  },
  paginationText: {
    fontSize: 18, fontWeight: '900', fontFamily: config.localization.startsWith('vi') ? 'Avenir Next W1G' : 'Avenir Black', color: 'white',
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
    fontSize: 18, fontWeight: '900', fontFamily: config.localization.startsWith('vi') ? 'Avenir Next W1G' : 'Avenir Black', color: 'white',
  },
  captureIcon: {
    width: convertWidth(68),
    height: convertWidth(68),
    resizeMode: 'contain',
  },

});
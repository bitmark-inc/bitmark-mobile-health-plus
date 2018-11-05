import React from 'react';
import PropTypes from 'prop-types';

import {
  Text, View, TouchableOpacity, Image, SafeAreaView,
  StyleSheet,
  Alert,
} from 'react-native';
import { RNCamera } from 'react-native-camera';
import { convertWidth } from '../../utils';
import { config } from '../../configs';
import { constants } from '../../constants';
import { Actions } from 'react-native-router-flux';
import { AppProcessor } from './../../processors';
import { EventEmitterService } from '../../services';

export class ScanAccessQRCodeComponent extends React.Component {
  static propTypes = {
    token: PropTypes.string,
  };
  constructor(props) {
    super(props);
    this.doReceivedAccessQRCode = this.doReceivedAccessQRCode.bind(this);
    this.scanned = false;
    this.state = {
      step: 'scanning',
      grantor: '',
    }

    if (this.props.token) {
      this.doReceivedAccessQRCode(this.props.token);
    }
  }

  onBarCodeRead(scanData) {
    this.cameraRef.stopRecording();
    if (this.scanned) {
      return;
    }
    this.scanned = true;
    let token = scanData.data;
    this.doReceivedAccessQRCode(token);
  }

  doReceivedAccessQRCode(token) {
    AppProcessor.doReceivedAccessQRCode(token).then(result => {
      if (result) {
        if (result.error) {
          Alert.alert(i18n.t('ScanAccessQRCodeComponent_alertMessage'), '', [{
            text: i18n.t('ScanAccessQRCodeComponent_alertButton'), style: 'cancel', onPress: Actions.pop,
          }]);
        } else {
          this.setState({ step: 'done', grantor: result.sender });
        }
      } else {
        Actions.pop();
      }
    }).catch(error => {
      console.log('error :', error);
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error, onClose: Actions.pop });
    });
  }

  render() {
    return (<SafeAreaView style={styles.bodySafeView}>
      <View style={styles.body}>
        {this.state.step === 'scanning' && <View style={styles.bodyContent}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{i18n.t('ScanAccessQRCodeComponent_title1')}</Text>
            <TouchableOpacity onPress={Actions.pop}>
              <Image style={styles.closeIcon} source={require('./../../../assets/imgs/close_icon_red.png')} />
            </TouchableOpacity>
          </View>
          <View style={[styles.content]}>
            {!this.props.token && <RNCamera
              ref={(ref) => this.cameraRef = ref}
              style={styles.scanCamera}
              type={RNCamera.Constants.Type.back}
              onBarCodeRead={this.onBarCodeRead.bind(this)}
            />}
            {!this.props.token && <Text style={styles.authorizedMessage}>
              {i18n.t('ScanAccessQRCodeComponent_authorizedMessage1')}
            </Text>}
          </View>
        </View>}
        {this.state.step !== 'scanning' && <View style={[styles.bodyContent, { backgroundColor: '#FF4444' }]}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: 'white' }]}>{i18n.t('ScanAccessQRCodeComponent_title2')}</Text>
          </View>
          <View style={styles.content}>
            <Text style={[styles.authorizedMessage, { color: 'white' }]}>
              {i18n.t('ScanAccessQRCodeComponent_authorizedMessage2', { accountNumber: '[' + this.state.grantor.substring(0, 4) + '...' + this.state.grantor.substring(this.state.grantor.length - 5, this.state.grantor.length) + ']' })}
            </Text>
          </View>
          <View style={[styles.deniedButtonArea, { paddingBottom: 20, }]}>
            <TouchableOpacity style={[styles.deniedButton, { backgroundColor: 'white' }]} onPress={() => { Actions.reset('user') }}>
              <Text style={[styles.deniedButtonText, { color: '#FF4444' }]}>{i18n.t('ScanAccessQRCodeComponent_deniedButtonText').toUpperCase()}</Text>
            </TouchableOpacity>
          </View>
        </View>}
      </View>
    </SafeAreaView>);
  }
}

const styles = StyleSheet.create({
  bodySafeView: {
    flex: 1,
    backgroundColor: 'white',
  },
  body: {
    padding: convertWidth(16),
    paddingTop: convertWidth(16) + (config.isIPhoneX ? constants.iPhoneXStatusBarHeight : 0),
    flex: 1,
  },
  bodyContent: {
    flex: 1,
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: '#FF4444',
    width: "100%",
  },
  title: {
    fontFamily: config.localization === 'vi-US' ? null : 'Avenir Light',
    fontWeight: '900',
    fontSize: 34,
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: convertWidth(20),
    paddingTop: convertWidth(15),
    paddingBottom: 0,
  },
  closeIcon: {
    margin: 12,
    width: convertWidth(20),
    height: convertWidth(20),
    resizeMode: 'contain',
  },
  content: {
    flexDirection: 'column',
    flex: 1,
    paddingTop: 20,
    paddingBottom: 20,
  },
  scanCamera: {
    width: '100%',
    height: convertWidth(350),
  },
  authorizedMessage: {
    padding: convertWidth(20),
    fontFamily: config.localization === 'vi-US' ? null : 'Avenir Light',
    fontWeight: '300',
    fontSize: 16,
  },
  deniedButtonArea: {
    padding: convertWidth(20),
    paddingBottom: 0,
  },
  deniedButton: {
    backgroundColor: "#FF4444",
    width: '100%',
    height: constants.buttonHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deniedButtonText: {
    fontFamily: config.localization === 'vi-US' ? null : 'Avenir Heavy',
    fontWeight: '900',
    fontSize: 16,
    color: 'white',
  },
});

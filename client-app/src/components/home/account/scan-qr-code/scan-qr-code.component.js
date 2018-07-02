import React from 'react';
import PropTypes from 'prop-types';
import {
  Text, View, TouchableOpacity, Image,
  Alert,
} from 'react-native';
import Camera from 'react-native-camera';
import componentStyle from './scan-qr-code.component.style';

import defaultStyles from '../../../../commons/styles';
import moment from 'moment';
import { AppProcessor } from '../../../../processors';
import { EventEmitterService } from '../../../../services';

export class ScanQRCodeComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  onBarCodeRead(scanData) {
    this.cameraRef.stopPreview();
    let qrCode = scanData.data;

    let tempArrays = qrCode.split('|');
    if (tempArrays.length === 4 && tempArrays[0] === 'i') {
      let token = tempArrays[1];
      let timestamp = parseInt(tempArrays[2], 0);
      let encryptionKey = tempArrays[3];
      if (!timestamp || isNaN(timestamp)) {
        Alert.alert('', 'QR-code is invalid!', ''[{
          text: 'OK',
          onPress: this.props.navigation.goBack
        }]);
        return;
      }
      let expiredTime = timestamp + 5 * 60 * 1000;
      if (expiredTime < moment().toDate().getTime()) {
        Alert.alert('', 'QR-code is expired!', ''[{
          text: 'OK',
          onPress: this.props.navigation.goBack
        }]);
        return;
      }

      AppProcessor.doDecentralizedIssuance(token, encryptionKey).then(result => {
        if (result) {
          Alert.alert('Success!', 'Your property rights have been registered.', [{
            text: 'OK',
            onPress: this.props.navigation.goBack
          }]);
        }
      }).catch(error => {
        console.log('doDecentralizedIssuance error:', error);
        EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { onClose: this.props.navigation.goBack });
      });
    } else if (tempArrays.length === 3 && tempArrays[0] === 't') {
      let token = tempArrays[1];
      let timestamp = parseInt(tempArrays[2], 0);
      if (!timestamp || isNaN(timestamp)) {
        Alert.alert('', 'QR-code is invalid!', ''[{
          text: 'OK',
          onPress: this.props.navigation.goBack
        }]);
        return;
      }
      let expiredTime = timestamp + 5 * 60 * 1000;
      if (expiredTime < moment().toDate().getTime()) {
        Alert.alert('', 'QR-code is expired!', ''[{
          text: 'OK',
          onPress: this.props.navigation.goBack
        }]);
        return;
      }

      AppProcessor.doDecentralizedTransfer(token).then(result => {
        if (result) {
          Alert.alert('Success!', 'Your property rights have been transferred.', [{
            text: 'OK',
            onPress: this.props.navigation.goBack
          }]);
        }
      }).catch(error => {
        console.log('doDecentralizedTransfer error:', error);
        EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { onClose: this.props.navigation.goBack });
      });
    } else {
      Alert.alert('', 'QR-code is invalid!', ''[{
        text: 'OK',
        onPress: this.props.navigation.goBack
      }]);
    }
  }

  render() {
    return (<View style={componentStyle.body}>
      <View style={componentStyle.header}>
        <TouchableOpacity style={defaultStyles.headerLeft} onPress={() => this.props.navigation.goBack()} >
          <Image style={defaultStyles.headerLeftIcon} source={require('./../../../../../assets/imgs/header_blue_icon.png')} />
        </TouchableOpacity>
        <Text style={defaultStyles.headerTitle}>{'SCAN QRCODE'.toUpperCase()}</Text>
        <TouchableOpacity style={defaultStyles.headerRight} />
      </View>
      <View style={componentStyle.bodyContent}>
        <Camera ref={(ref) => this.cameraRef = ref} style={componentStyle.scanCamera} aspect={Camera.constants.Aspect.fill} onBarCodeRead={this.onBarCodeRead.bind(this)} />
      </View>
    </View>);
  }
}

ScanQRCodeComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
  })
};
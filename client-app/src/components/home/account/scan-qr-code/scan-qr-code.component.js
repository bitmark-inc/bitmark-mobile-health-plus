import React from 'react';
import PropTypes from 'prop-types';
import {
  Text, View, TouchableOpacity, Image,
} from 'react-native';
import Camera from 'react-native-camera';
import componentStyle from './scan-qr-code.component.style';

import defaultStyles from '../../../../commons/styles';

export class ScanQRCodeComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  onBarCodeRead(scanData) {
    this.cameraRef.stopPreview();
    // let qrCode = scanData.data;

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
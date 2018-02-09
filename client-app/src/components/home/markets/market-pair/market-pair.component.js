import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, Image,
  Platform,
} from 'react-native';
import Camera from 'react-native-camera';

import { AppService } from './../../../../services';

import marketPairStyle from './market-pair.component.style';
import { androidDefaultStyle, iosDefaultStyle } from './../../../../commons/styles';
let defaultStyle = Platform.select({
  ios: iosDefaultStyle,
  android: androidDefaultStyle
});


export class MarketPairComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      market: this.props.navigation.state.params.market
    }
    this.onBarCodeRead = this.onBarCodeRead.bind(this);
  }

  onBarCodeRead(e) {
    if (this.processing) {
      return;
    }
    this.processing = true;
    this.camera.stopPreview();
    let qrCodeString = e.data;
    let market = qrCodeString.substring(0, qrCodeString.indexOf(':'));
    let token = qrCodeString.substring(qrCodeString.indexOf(':') + 1);
    AppService.doPairMarketAccount(token, market).then((user) => {
      console.log('doPairMarketAccount success :', user);
      if (this.props.navigation.state.params.reloadMarketsScreen) {
        this.props.navigation.state.params.reloadMarketsScreen();
      }
      this.props.navigation.goBack();
    }).catch(error => {
      console.log('doPairMarketAccount error :', error);
      this.processing = false;
    })
  }

  render() {
    return (
      <View style={marketPairStyle.body}>
        <View style={defaultStyle.header}>
          <TouchableOpacity style={defaultStyle.headerLeft} onPress={() => this.props.navigation.goBack()}>
            <Image style={defaultStyle.headerLeftIcon} source={require('../../../../../assets/imgs/header_back_icon_study_setting.png')} />
          </TouchableOpacity>
          <Text style={defaultStyle.headerTitle}>Pair Account</Text>
          <TouchableOpacity style={defaultStyle.headerRight} />
        </View>
        <Camera
          ref={(cam) => this.camera = cam}
          onBarCodeRead={this.onBarCodeRead.bind(this)}
          style={[marketPairStyle.camera]}
          aspect={Camera.constants.Aspect.fill}>
        </Camera>
      </View>
    );
  }
}

MarketPairComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.shape({
        reloadMarketsScreen: PropTypes.func,
        market: PropTypes.string,
      }),
    }),
  }),
}
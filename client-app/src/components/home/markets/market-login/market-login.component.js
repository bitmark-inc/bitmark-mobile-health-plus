import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, Image, WebView,
  Platform,
} from 'react-native';

import { AppService } from './../../../../services';

import marketLoginStyle from './market-login.component.style';
import { androidDefaultStyle, iosDefaultStyle } from './../../../../commons/styles';
import { config } from '../../../../configs';
let defaultStyle = Platform.select({
  ios: iosDefaultStyle,
  android: androidDefaultStyle
});

export class MarketLoginComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      market: this.props.navigation.state.params.market,
      user: null,
    };
    AppService.getCurrentUser().then(user => {
      this.setState({ user });
    }).catch((error) => {
      console.log('getCurrentUser error :', error);
      this.setState({ user: null })
    })
  }

  render() {
    return (
      <View style={marketLoginStyle.body}>
        <View style={defaultStyle.header}>
          <TouchableOpacity style={defaultStyle.headerLeft} onPress={() => { this.props.navigation.goBack() }}>
            <Image style={defaultStyle.headerLeftIcon} source={require('../../../../../assets/imgs/header_back_icon_study_setting.png')} />
          </TouchableOpacity>
          <Text style={defaultStyle.headerTitle}>{this.state.market.charAt(0).toUpperCase() + this.state.market.slice(1)}</Text>
          <TouchableOpacity style={defaultStyle.headerRight} />
        </View>
        {this.state.user && this.state.user.bitmarkAccountNumber && <View style={marketLoginStyle.main}>
          <WebView
            onMessage={(event) => {
              console.log('onMessage :', event);
              let message = event.nativeEvent.data;
              console.log(message, this.state.user.bitmarkAccountNumber);
              if (message === 'ready') {
                this.webViewRef.postMessage(this.state.user.bitmarkAccountNumber);
              } else if (message === 'submit') {
                AppService.createSignatureData().then(data => {
                  this.webViewRef.postMessage(JSON.stringify(data));
                }).catch(error => console.log('MarketLoginComponent createSignatureData error :', error));
              }
            }}
            ref={(ref) => this.webViewRef = ref}
            source={{ uri: config.market_urls[this.state.market] + '/login?webview=true' }} />
        </View>}
      </View>
    );
  }
}

MarketLoginComponent.propTypes = {
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
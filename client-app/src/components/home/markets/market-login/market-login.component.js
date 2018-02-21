import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, Image, WebView,
  Platform,
} from 'react-native';

import { AppService, EventEmiterService } from './../../../../services';

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
    this.onMessage = this.onMessage.bind(this);

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

  onMessage(event) {
    console.log('onMessage :', event);
    let message = event.nativeEvent.data;
    console.log(message, this.state.user.bitmarkAccountNumber);
    if (message === 'ready') {
      this.webViewRef.postMessage(this.state.user.bitmarkAccountNumber);
    } else if (message === 'submit') {
      EventEmiterService.emit(EventEmiterService.events.APP_PROCESSING, true);
      AppService.createSignatureData().then(data => {
        EventEmiterService.emit(EventEmiterService.events.APP_PROCESSING, false);
        this.webViewRef.postMessage(JSON.stringify(data));
      }).catch(error => {
        EventEmiterService.emit(EventEmiterService.events.APP_PROCESSING, false);
        console.log('MarketLoginComponent createSignatureData error :', error);
      });
    } else if (message === 'submit-success' && this.props.navigation.state.params.refreshMarketStatus) {
      this.props.navigation.state.params.refreshMarketStatus(this.state.market);
      this.props.navigation.goBack();
    }
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
            onMessage={this.onMessage}
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
        refreshMarketStatus: PropTypes.func,
        market: PropTypes.string,
      }),
    }),
  }),
}
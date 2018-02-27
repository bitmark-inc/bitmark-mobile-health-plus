import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
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
      connecting: true,
    };
    this.ready = false;
    EventEmiterService.emit(EventEmiterService.events.APP_PROCESSING, true);
    AppService.getCurrentUser().then(user => {
      this.setState({ user });
    }).catch((error) => {
      console.log('getCurrentUser error :', error);
      this.setState({ user: null })
    });
    setTimeout(() => {
      if (!this.ready) {
        EventEmiterService.emit(EventEmiterService.events.APP_PROCESSING, false);
        this.setState({ connecting: false })
        // this.props.navigation.goBack();
      }
    }, 5 * 1000);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.user && this.state.connecting === true && nextState.connecting === true) {
      return false;
    }
    return true;
  }

  onMessage(event) {
    let message = event.nativeEvent.data;
    if (message === 'ready') {
      this.ready = true;
      EventEmiterService.emit(EventEmiterService.events.APP_PROCESSING, false);
      this.webViewRef.postMessage(this.state.user.bitmarkAccountNumber);
    } else if (message === 'submit') {
      EventEmiterService.emit(EventEmiterService.events.APP_PROCESSING, true);
      AppService.createSignatureData('Please sign to pair the bitmark account with market.', true).then(data => {
        EventEmiterService.emit(EventEmiterService.events.APP_PROCESSING, false);
        if (!data) {
          this.props.navigation.goBack();
          return;
        }
        this.webViewRef.postMessage(JSON.stringify(data));
      }).catch(error => {
        EventEmiterService.emit(EventEmiterService.events.APP_PROCESSING, false);
        console.log('MarketLoginComponent createSignatureData error :', error);
      });
    }
  }

  render() {
    let uri = config.market_urls[this.state.market] + `/login?webview=true&hash=${moment().toDate().getTime()}`;
    return (
      <View style={marketLoginStyle.body}>
        <View style={defaultStyle.header}>
          <TouchableOpacity style={defaultStyle.headerLeft} onPress={() => {
            this.props.navigation.goBack();
            this.props.navigation.state.params.refreshMarketStatus(this.state.market);
          }}>
            <Image style={defaultStyle.headerLeftIcon} source={require('../../../../../assets/imgs/header_back_icon_study_setting.png')} />
          </TouchableOpacity>
          <Text style={defaultStyle.headerTitle}>{this.state.market.charAt(0).toUpperCase() + this.state.market.slice(1)}</Text>
          <TouchableOpacity style={defaultStyle.headerRight} />
        </View>
        {this.state.connecting && this.state.user && this.state.user.bitmarkAccountNumber && <View style={marketLoginStyle.main}>
          <WebView
            onMessage={this.onMessage}
            ref={(ref) => this.webViewRef = ref}
            source={{ uri: uri }} />
        </View>}
        {!this.state.connecting && <View style={marketLoginStyle.main}>
          <Text style={{
            marginTop: 30,
            marginLeft: 20,
            fontFamily: 'Avenir Black',
            fontWeight: '900',
            fontSize: 16,
            lineHeight: 18,
            color: '#FF003C'
          }}>Can not connect and send data for {this.state.market} website! Please go back and try again!</Text>
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
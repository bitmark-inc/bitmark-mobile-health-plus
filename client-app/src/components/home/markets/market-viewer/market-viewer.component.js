import React from 'react';
import PropTypes from 'prop-types';
import {
  Text, View, TouchableOpacity, WebView, Image,
  Platform,
  Share,
} from 'react-native';

import { androidDefaultStyle, iosDefaultStyle } from './../../../../commons/styles';
import termsStyles from './market-viewer.component.style';
let defaultStyles = Platform.select({
  ios: iosDefaultStyle,
  android: androidDefaultStyle,
});

export class MarketViewerComponent extends React.Component {
  constructor(props) {
    super(props);
    this.onNavigationStateChange = this.onNavigationStateChange.bind(this);
    this.reloadWebView = this.reloadWebView.bind(this);
    this.onGoBack = this.onGoBack.bind(this);
    this.share = this.share.bind(this);

    this.state = {
      marketName: this.props.navigation.state.params.name,
      url: this.props.navigation.state.params.url,
      currentUrl: this.props.navigation.state.params.url,
    };
  }
  onNavigationStateChange(webViewState) {
    this.setState({
      currentUrl: webViewState.url,
    });
  }

  reloadWebView() {
    if (this.state.url !== this.state.currentUrl) {
      this.setState({ url: this.state.currentUrl });
    } else {
      this.webViewRef.reload();
    }
  }

  share() {
    Share.share({ title: this.state.marketName, message: this.state.marketName, url: this.state.currentUrl });
  }

  onGoBack() {
    if (this.props.navigation.state.params.realoadPreivewScreen) {
      this.props.navigation.state.params.realoadPreivewScreen();
    }
    this.props.navigation.goBack();
  }

  render() {
    return (
      <View style={termsStyles.body}>
        <View style={defaultStyles.header}>
          <TouchableOpacity style={defaultStyles.headerLeft} onPress={this.onGoBack}>
            <Image style={defaultStyles.headerLeftIcon} source={require('../../../../../assets/imgs/header_back_icon_study_setting.png')} />
          </TouchableOpacity>
          <Text style={defaultStyles.headerTitle}>{this.state.marketName}</Text>
          <View style={defaultStyles.headerRight}>
            <TouchableOpacity onPress={this.reloadWebView}>
              <Image style={termsStyles.marketIcon} source={require('../../../../../assets/imgs/refresh-icon.png')} />
            </TouchableOpacity>
            <TouchableOpacity onPress={this.share}>
              <Image style={termsStyles.marketIcon} source={require('../../../../../assets/imgs/share-icon.png')} />
            </TouchableOpacity>
          </View>
        </View>
        <WebView
          style={termsStyles.main}
          ref={(ref) => this.webViewRef = ref}
          source={{ uri: this.state.url }}
          onNavigationStateChange={this.onNavigationStateChange.bind(this)}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          injectedJavaScript={this.state.cookie}
          startInLoadingState={false}
        />
      </View >
    );
  }
}

MarketViewerComponent.propTypes = {
  screenProps: PropTypes.shape({
    setShowPagination: PropTypes.func,
  }),
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.shape({
        url: PropTypes.string,
        name: PropTypes.string,
        realoadPreivewScreen: PropTypes.func,
      }),
    }),
  }),
};
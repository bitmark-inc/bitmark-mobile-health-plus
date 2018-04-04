import React from 'react';
import PropTypes from 'prop-types';
import {
  Text, View, TouchableOpacity, WebView, Image, Share,
} from 'react-native';
import { FullComponent } from './../bitmark-app-component';

import defaultStyles from './../../styles/index';
import termsStyles from './bitmark-web-view.component.style';
import { ios } from '../../../configs';
import { EventEmiterService } from './../../../services';

class WebViewComponent extends React.Component {
  constructor(props) {
    super(props);
    this.onNavigationStateChange = this.onNavigationStateChange.bind(this);
    this.doShare = this.doShare.bind(this);
  }

  onNavigationStateChange(navState) {
    if (this.needShare) {
      this.needShare = false;
      EventEmiterService.emit(EventEmiterService.events.APP_PROCESSING, false);
      let title
      if (this.props.screenProps) {
        title = this.props.screenProps.title;
      }
      if (this.props.navigation && this.props.navigation.state && this.props.navigation.state.params) {
        title = this.props.navigation.state.params.title;
      }
      Share.share({ title, url: navState.url });
    }
  }

  doShare() {
    this.needShare = true;
    EventEmiterService.emit(EventEmiterService.events.APP_PROCESSING, true);
    this.webViewRef.reload();
  }

  render() {
    let isFullScreen
    if (this.props.screenProps) {
      isFullScreen = this.props.screenProps.isFullScreen;
    }
    if (this.props.navigation && this.props.navigation.state && this.props.navigation.state.params) {
      isFullScreen = this.props.navigation.state.params.isFullScreen;
    }

    let title
    if (this.props.screenProps) {
      title = this.props.screenProps.title;
    }
    if (this.props.navigation && this.props.navigation.state && this.props.navigation.state.params) {
      title = this.props.navigation.state.params.title;
    }

    let sourceUrl
    if (this.props.screenProps) {
      sourceUrl = this.props.screenProps.sourceUrl;
    }
    if (this.props.navigation && this.props.navigation.state && this.props.navigation.state.params) {
      sourceUrl = this.props.navigation.state.params.sourceUrl;
    }
    return (<View style={termsStyles.body}>
      {!!title && <View style={termsStyles.header}>
        <TouchableOpacity style={defaultStyles.headerLeft}>
        </TouchableOpacity>
        <Text style={defaultStyles.headerTitle}>{title.toUpperCase()}</Text>
        <TouchableOpacity style={defaultStyles.headerRight} onPress={() => {
          if (this.props.screenProps && this.props.screenProps.setShowPagination) {
            this.props.screenProps.setShowPagination(true);
          }
          this.props.navigation.goBack()
        }}>
          <Text style={defaultStyles.headerRightText}>Done</Text>
        </TouchableOpacity>
      </View>}
      <View style={termsStyles.main}>
        <WebView
          source={{ uri: sourceUrl }}
          ref={(ref) => this.webViewRef = ref}
          onNavigationStateChange={this.onNavigationStateChange}
        />
      </View>
      <View style={[termsStyles.bottomController, {
        height: 57 + (isFullScreen ? ios.constant.blankFooter : 0),
        paddingBottom: (isFullScreen ? ios.constant.blankFooter : 0),
      }]}>
        <TouchableOpacity style={termsStyles.webViewControllButton} onPress={() => { console.log('source :', this.webViewRef.getWebViewHandle()); this.webViewRef.goBack(); }}>
          <Image style={termsStyles.webViewControllIcon} source={require('./../../../../assets/imgs/webview-back.png')} />
        </TouchableOpacity>
        <TouchableOpacity style={termsStyles.webViewControllButton} onPress={() => { this.webViewRef.goForward(); }}>
          <Image style={termsStyles.webViewControllIcon} source={require('./../../../../assets/imgs/webview-next.png')} />
        </TouchableOpacity>
        <TouchableOpacity style={termsStyles.webViewControllButton} onPress={() => { this.webViewRef.reload(); }}>
          <Image style={[termsStyles.webViewControllIcon]} source={require('./../../../../assets/imgs/webview-reload.png')} />
        </TouchableOpacity>
        <TouchableOpacity style={termsStyles.webViewControllButton} onPress={this.doShare}>
          <Image style={[termsStyles.webViewControllIcon, { width: 17, height: 24 }]} source={require('./../../../../assets/imgs/webview-share.png')} />
        </TouchableOpacity>
      </View>
    </View>);
  }
}

WebViewComponent.propTypes = {
  screenProps: PropTypes.shape({
    title: PropTypes.string.isRequired,
    sourceUrl: PropTypes.string,
    isFullScreen: PropTypes.bool,
    setShowPagination: PropTypes.func,
  }),
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.shape({
        sourceUrl: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        isFullScreen: PropTypes.bool,
      })
    })
  }),
};

export class BitmarkWebViewComponent extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    let isFullScreen
    if (this.props.screenProps) {
      isFullScreen = this.props.screenProps.isFullScreen;
    }
    if (this.props.navigation && this.props.navigation.state && this.props.navigation.state.params) {
      isFullScreen = this.props.navigation.state.params.isFullScreen;
    }
    if (isFullScreen) {
      return (
        <FullComponent
          content={(<WebViewComponent screenProps={this.props.screenProps} navigation={this.props.navigation} />)}
        />
      );
    } else {
      return (<WebViewComponent screenProps={this.props.screenProps} navigation={this.props.navigation} />);
    }
  }
}

BitmarkWebViewComponent.propTypes = {
  screenProps: PropTypes.shape({
    sourceUrl: PropTypes.string,
    isFullScreen: PropTypes.bool,
    setShowPagination: PropTypes.func,
  }),
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.shape({
        sourceUrl: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        isFullScreen: PropTypes.bool,
      })
    })
  }),
};
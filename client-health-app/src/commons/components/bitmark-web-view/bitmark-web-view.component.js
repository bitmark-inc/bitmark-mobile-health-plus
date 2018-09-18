import React from 'react';
import PropTypes from 'prop-types';
import {
  Text, View, WebView, Image, Share,
} from 'react-native';
import { BitmarkComponent } from './../bitmark';

import defaultStyles from './../../styles/index';
import termsStyles from './bitmark-web-view.component.style';
import { ios } from '../../../configs';
import { EventEmitterService } from './../../../services';
import { BitmarkOneTabButtonComponent } from '../bitmark-button';

class WebViewComponent extends React.Component {
  constructor(props) {
    super(props);
    this.onNavigationStateChange = this.onNavigationStateChange.bind(this);
    this.doShare = this.doShare.bind(this);
  }

  onNavigationStateChange(navState) {
    if (this.needShare) {
      this.needShare = false;
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESSING, false);
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
    EventEmitterService.emit(EventEmitterService.events.APP_PROCESSING, true);
    this.webViewRef.reload();
  }

  render() {
    let isFullScreen;
    if (this.props.screenProps) {
      isFullScreen = this.props.screenProps.isFullScreen;
    }
    if (this.props.navigation && this.props.navigation.state && this.props.navigation.state.params) {
      isFullScreen = this.props.navigation.state.params.isFullScreen;
    }

    let showDoneButton;
    if (this.props.screenProps) {
      showDoneButton = this.props.screenProps.showDoneButton;
    }
    if (this.props.navigation && this.props.navigation.state && this.props.navigation.state.params) {
      showDoneButton = this.props.navigation.state.params.showDoneButton;
    }

    let title;
    if (this.props.screenProps) {
      title = this.props.screenProps.title;
    }
    if (this.props.navigation && this.props.navigation.state && this.props.navigation.state.params) {
      title = this.props.navigation.state.params.title;
    }

    let sourceUrl;
    if (this.props.screenProps) {
      sourceUrl = this.props.screenProps.sourceUrl;
    }
    if (this.props.navigation && this.props.navigation.state && this.props.navigation.state.params) {
      sourceUrl = this.props.navigation.state.params.sourceUrl;
    }

    let heightButtonController;
    if (this.props.screenProps) {
      heightButtonController = this.props.screenProps.heightButtonController;
    }
    if (this.props.navigation && this.props.navigation.state && this.props.navigation.state.params) {
      heightButtonController = this.props.navigation.state.params.heightButtonController;
    }

    let hideBottomController;
    if (this.props.screenProps) {
      hideBottomController = this.props.screenProps.hideBottomController;
    }
    if (this.props.navigation && this.props.navigation.state && this.props.navigation.state.params) {
      hideBottomController = this.props.navigation.state.params.hideBottomController;
    }
    return (<View style={termsStyles.body}>
      {!!title && <View style={termsStyles.header}>
        {!showDoneButton ? (
          // Go Back Arrow
          <BitmarkOneTabButtonComponent style={defaultStyles.headerLeft} onPress={() => {
            if (this.props.screenProps && this.props.screenProps.setShowPagination) {
              this.props.screenProps.setShowPagination(true);
            }
            this.props.navigation.goBack()
          }}>
            <Image style={defaultStyles.headerLeftIcon} source={require('./../../../../assets/imgs/header_blue_icon.png')} />
          </BitmarkOneTabButtonComponent>
        ) : (
            <BitmarkOneTabButtonComponent style={defaultStyles.headerLeft} />
          )}

        {/*Header Text*/}
        <Text style={defaultStyles.headerTitle}>{title.toUpperCase()}</Text>

        {showDoneButton ? (
          // Done Button
          <BitmarkOneTabButtonComponent style={defaultStyles.headerRight} onPress={() => this.props.navigation.goBack()}>
            <Text style={defaultStyles.headerRightText}>Done</Text>
          </BitmarkOneTabButtonComponent>
        ) : (
            <BitmarkOneTabButtonComponent style={defaultStyles.headerRight} />
          )}
      </View>}
      <View style={termsStyles.main}>
        <WebView
          dataDetectorTypes="none"
          source={{ uri: sourceUrl }}
          ref={(ref) => this.webViewRef = ref}
          onNavigationStateChange={this.onNavigationStateChange}
        />
      </View>
      {!hideBottomController && <View style={[termsStyles.bottomController, {
        height: (heightButtonController || ios.constant.bottomBottomHeight) + (isFullScreen ? ios.constant.blankFooter : 0),
        paddingBottom: (isFullScreen ? ios.constant.blankFooter : 0),
      }]}>
        <BitmarkOneTabButtonComponent style={termsStyles.webViewControlButton} onPress={() => { console.log('source :', this.webViewRef.getWebViewHandle()); this.webViewRef.goBack(); }}>
          <Image style={termsStyles.webViewControlIcon} source={require('./../../../../assets/imgs/webview-back.png')} />
        </BitmarkOneTabButtonComponent>
        <BitmarkOneTabButtonComponent style={[termsStyles.webViewControlButton, { marginLeft: 90 }]} onPress={() => { this.webViewRef.goForward(); }}>
          <Image style={termsStyles.webViewControlIcon} source={require('./../../../../assets/imgs/webview-next.png')} />
        </BitmarkOneTabButtonComponent>
        {/* <BitmarkOneTabButtonComponent style={termsStyles.webViewControlButton} onPress={() => { this.webViewRef.reload(); }}>
          <Image style={[termsStyles.webViewControlIcon]} source={require('./../../../../assets/imgs/webview-reload.png')} />
        </BitmarkOneTabButtonComponent> */}
        {/* <BitmarkOneTabButtonComponent style={termsStyles.webViewControlButton} onPress={this.doShare}>
          <Image style={[termsStyles.webViewControlIcon, { width: 17, height: 24 }]} source={require('./../../../../assets/imgs/webview-share.png')} />
        </BitmarkOneTabButtonComponent> */}
      </View>}
    </View>);
  }
}

WebViewComponent.propTypes = {
  screenProps: PropTypes.shape({
    title: PropTypes.string,
    sourceUrl: PropTypes.string,
    isFullScreen: PropTypes.bool,
    setShowPagination: PropTypes.func,
    heightButtonController: PropTypes.number,
    hideBottomController: PropTypes.bool,
    showDoneButton: PropTypes.bool,
  }),
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.shape({
        sourceUrl: PropTypes.string,
        title: PropTypes.string,
        isFullScreen: PropTypes.bool,
        heightButtonController: PropTypes.number,
        hideBottomController: PropTypes.bool,
        showDoneButton: PropTypes.bool,
      })
    })
  }),
};

export class BitmarkWebViewComponent extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    let isFullScreen;
    if (this.props.screenProps) {
      isFullScreen = this.props.screenProps.isFullScreen;
    }
    if (this.props.navigation && this.props.navigation.state && this.props.navigation.state.params) {
      isFullScreen = this.props.navigation.state.params.isFullScreen;
    }

    if (isFullScreen) {
      return (
        <BitmarkComponent
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
        sourceUrl: PropTypes.string,
        title: PropTypes.string,
        isFullScreen: PropTypes.bool,
        showDoneButton: PropTypes.bool,
      })
    })
  }),
};

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StackNavigator } from 'react-navigation';
import ReactNative from 'react-native';
// import PushNotification from 'react-native-push-notification';

const {
  Linking,
  Alert,
  AppState,
  NetInfo,
  // PushNotificationIOS,
  View,
} = ReactNative;

import {
  LoadingComponent,
  DefaultIndicatorComponent,
  BitmarkIndicatorComponent,
  BitmarkInternetOffComponent,
} from './../commons/components';
import { HomeComponent } from './../components/home';
import { OnboardingComponent } from './onboarding';
import { EventEmiterService } from './../services';
import { AppController, DataController } from '../managers';
import { CommonModel } from '../models';

class MainComponent extends Component {
  constructor(props) {
    super(props);

    this.handleDeppLink = this.handleDeppLink.bind(this);
    this.handleAppStateChange = this.handleAppStateChange.bind(this);
    this.handerProcessingEvent = this.handerProcessingEvent.bind(this);
    this.handerSumittinggEvent = this.handerSumittinggEvent.bind(this);
    this.handleNetworkChange = this.handleNetworkChange.bind(this);
    this.handerProcessErrorEvent = this.handerProcessErrorEvent.bind(this);
    this.doTryConnectInternet = this.doTryConnectInternet.bind(this);

    this.doOpenApp = this.doOpenApp.bind(this);

    this.state = {
      user: null,
      processingCount: false,
      submitting: null,
      justCreatedBitmarkAccount: false,
      networkStatus: true,
    };
    this.appState = AppState.currentState;


    // setTimeout(() => {
    //   console.log('send notification');
    //   PushNotification.localNotification({
    //     title: 'Donate data',
    //     message: 'Your daily data donation for <date range> has been sent to the <institution> <study name>. Thanks for donating!',
    //     userInfo: {
    //       event: 'transfer_required',
    //       bitmark_id: '6a2617f125303e25a8bd78de0b16c94f34c281fde4f934babbb4a29dcae1540b',
    //     }
    //   });
    // }, 4000);

    // setTimeout(() => {
    //   console.log('send notification');
    //   PushNotification.localNotification({
    //     title: 'Donate data',
    //     message: 'Your daily data donation for <date range> has been sent to the <institution> <study name>. Thanks for donating!',
    //     userInfo: {
    //       event: 'transfer_rejected',
    //       bitmark_id: 'e683dc72c6b20f1e4c4e8c70b4139bca6e08ed646ac55a51478f5c0ede1a04b1',
    //     }
    //   });
    // }, 4000);

  }

  componentDidMount() {
    let justCreatedBitmarkAccount = false;
    if (this.props.navigation.state && this.props.navigation.state.params) {
      justCreatedBitmarkAccount = !!this.props.navigation.state.params.justCreatedBitmarkAccount;
      this.setState({ justCreatedBitmarkAccount });
    }
    this.doOpenApp();

    EventEmiterService.on(EventEmiterService.events.APP_PROCESSING, this.handerProcessingEvent);
    EventEmiterService.on(EventEmiterService.events.APP_SUBMITTING, this.handerSumittinggEvent);
    EventEmiterService.on(EventEmiterService.events.APP_PROCESS_ERROR, this.handerProcessErrorEvent);
    Linking.addEventListener('url', this.handleDeppLink);
    AppState.addEventListener('change', this.handleAppStateChange);
    NetInfo.isConnected.fetch().then().done(() => {
      NetInfo.isConnected.addEventListener('connectionChange', this.handleNetworkChange);
    });
  }
  componentWillUnmount() {
    EventEmiterService.remove(EventEmiterService.events.APP_PROCESSING, this.handerProcessingEvent);
    EventEmiterService.remove(EventEmiterService.events.APP_SUBMITTING, this.handerSumittinggEvent);
    EventEmiterService.remove(EventEmiterService.events.APP_PROCESS_ERROR, this.handerProcessErrorEvent);
    Linking.addEventListener('url', this.handleDeppLink);
    AppState.removeEventListener('change', this.handleAppStateChange);
    NetInfo.isConnected.removeEventListener('connectionChange', this.handleNetworkChange);
  }

  handerProcessingEvent(processing) {
    let processingCount = this.state.processingCount + (processing ? 1 : -1);
    this.setState({ processingCount });
  }

  handerProcessErrorEvent(processError) {
    Alert.alert((processError && processError.title) ? processError.title : "We’re sorry!",
      (processError && processError.message) ? processError.message : 'Something went wrong.\nPlease try again later.',
      [{
        text: 'OK',
        onPress: () => {
          if (processError && processError.onClose) {
            processError.onClose();
          }
        }
      }]);
  }

  handerSumittinggEvent(submitting) {
    this.setState({ submitting });
  }

  handleDeppLink(event) {
    const route = event.url.replace(/.*?:\/\//g, '');
    const params = route.split('/');
    switch (params[0]) {
      // case 'login': {
      //   break;
      // }
      default: {
        // TODO
        break;
      }
    }
  }

  handleAppStateChange = (nextAppState) => {
    if (this.appState.match(/background/) && nextAppState === 'active') {
      this.doTryConnectInternet();
    }
    this.appState = nextAppState;
  }

  handleNetworkChange(networkStatus) {
    this.setState({ networkStatus });
    if (networkStatus) {
      this.doOpenApp();
    }
  }

  doTryConnectInternet() {
    console.log('doTryConnectInternet ====');
    NetInfo.isConnected.removeEventListener('connectionChange', this.handleNetworkChange);
    NetInfo.isConnected.fetch().then().done(() => {
      NetInfo.isConnected.addEventListener('connectionChange', this.handleNetworkChange);
    });
  }

  doOpenApp() {
    DataController.doOpenApp().then(user => {
      console.log('user: ', user);
      this.setState({ user });
      if (user && user.bitmarkAccountNumber) {
        CommonModel.doCheckPasscodeAndFaceTouchId().then(ok => {
          if (ok) {
            AppController.doStartBackgroundProcess(this.state.justCreatedBitmarkAccount);
            setTimeout(() => {
              this.setState({ justCreatedBitmarkAccount: false });
            }, 5000);
          } else {
            if (!this.requiringTouchId) {
              this.requiringTouchId = true;
              Alert.alert('Please enable your Touch ID & Passcode to continue using Bitmark. Settings > Touch ID & Passcode', '', [{
                text: 'ENABLE', onPress: () => {
                  Linking.openURL('app-settings:');
                  this.requiringTouchId = false;
                }
              }]);
            }
          }
        });
      }
    });
  }

  render() {
    let DisplayedComponent = LoadingComponent;
    if (this.state.user) {
      DisplayedComponent = this.state.user.bitmarkAccountNumber ? HomeComponent : OnboardingComponent;
    }
    return (
      <View style={{ flex: 1 }}>
        {!this.state.networkStatus && <BitmarkInternetOffComponent tryConnectInternet={this.doTryConnectInternet} />}
        {this.state.processingCount > 0 && <DefaultIndicatorComponent />}

        {!!this.state.submitting && !this.state.submitting.title && !this.state.submitting.message && <DefaultIndicatorComponent />}
        {!!this.state.submitting && (this.state.submitting.title || this.state.submitting.message) && <BitmarkIndicatorComponent
          indicator={!!this.state.submitting.indicator} title={this.state.submitting.title} message={this.state.submitting.message} />}
        <View style={{
          flex: 1,
        }}><DisplayedComponent screenProps={{
          rootNavigation: this.props.navigation,
        }}>
          </DisplayedComponent>
        </View>
      </View>
    )
  }
}

MainComponent.propTypes = {
  navigation: PropTypes.shape({
    dispatch: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.shape({
        justCreatedBitmarkAccount: PropTypes.bool,
      }),
    }),
  })
}

let BitmarkAppComponent = StackNavigator({
  Main: { screen: MainComponent, },
}, {
    headerMode: 'none',
    navigationOptions: {
      gesturesEnabled: false,
    }, cardStyle: {
      shadowOpacity: 0,
    }
  }
);
export { BitmarkAppComponent };
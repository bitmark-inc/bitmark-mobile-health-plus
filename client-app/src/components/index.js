
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StackNavigator } from 'react-navigation';
import ReactNative from 'react-native';

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
    this.doOpenApp = this.doOpenApp.bind(this);

    this.state = {
      user: null,
      processing: false,
      submitting: null,
      justCreatedBitmarkAccount: false,
      networkStatus: true,
    };
    this.appState = AppState.currentState;
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
    Linking.addEventListener('url', this.handleDeppLink);
    AppState.addEventListener('change', this.handleAppStateChange);
    NetInfo.isConnected.fetch().then().done(() => {
      NetInfo.isConnected.addEventListener('connectionChange', this.handleNetworkChange);
    });
  }
  componentWillUnmount() {
    EventEmiterService.remove(EventEmiterService.events.APP_PROCESSING, this.handerProcessingEvent);
    EventEmiterService.remove(EventEmiterService.events.APP_SUBMITTING, this.handerSumittinggEvent);
    Linking.addEventListener('url', this.handleDeppLink);
    AppState.removeEventListener('change', this.handleAppStateChange);
    NetInfo.isConnected.removeEventListener('connectionChange', this.handleNetworkChange);
  }

  handerProcessingEvent(processing) {
    this.setState({ processing });
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
      console.log('active component');
      this.doOpenApp();
    }
    this.appState = nextAppState;
  }

  handleNetworkChange(networkStatus) {
    this.setState({ networkStatus });
    if (networkStatus) {
      this.doOpenApp();
    }
  }

  doOpenApp() {
    DataController.doOpenApp().then(user => {
      console.log('user: ', user);
      this.setState({ user });
      if (user && user.bitmarkAccountNumber) {
        CommonModel.doCheckPasscodeAndFaceTouchId().then(ok => {
          if (ok) {
            AppController.doStartBackgroundProcess();
          } else {
            if (!this.requiringTouchId) {
              this.requiringTouchId = true;
              Alert.alert('Touch/Face ID or a passcode is required to authorize your transactions.', '', [{
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
        {!this.state.networkStatus && <BitmarkInternetOffComponent />}
        {!!this.state.processing && <DefaultIndicatorComponent />}

        {!!this.state.submitting && !this.state.submitting.title && !this.state.submitting.message && <DefaultIndicatorComponent />}
        {!!this.state.submitting && (this.state.submitting.title || this.state.submitting.message) && <BitmarkIndicatorComponent
          indicator={!!this.state.submitting.indicator} title={this.state.submitting.title} message={this.state.submitting.message} />}
        <View style={{
          flex: 1,
        }}><DisplayedComponent screenProps={{
          rootNavigation: this.props.navigation,
          refreshScaling: () => {
            if (this.appScaler) {
              this.appScaler.refreshScaling();
            }
          }
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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StackNavigator } from 'react-navigation';
import ReactNative from 'react-native';

const {
  Linking,
  // Alert,
  AppState,
  // NetInfo,
  // PushNotificationIOS,
  View,
} = ReactNative;

import {
  LoadingComponent,
  DefaultIndicatorComponent,
  BitmarkIndicatorComponent,
} from './../commons/components';
import { HomeComponent } from './../components/home';
import { OnboardingComponent } from './onboarding';
import { EventEmiterService } from './../services';
import { AppController } from '../controllers';

class MainComponent extends Component {
  constructor(props) {
    super(props);

    this.handleDeppLink = this.handleDeppLink.bind(this);
    this.handleAppStateChange = this.handleAppStateChange.bind(this);
    this.handerProcessingEvent = this.handerProcessingEvent.bind(this);
    this.handerSumittinggEvent = this.handerSumittinggEvent.bind(this);

    this.state = {
      user: null,
      processing: false,
      submitting: null,
    };
    this.appState = AppState.currentState;

    AppController.doOpenApp().then(user => {
      console.log(' doOpenApp : ', user);
      this.setState({ user });
    }).catch(error => {
      console.log('doOpenApp error :', error);
      this.setState({ user: {} })
    });
  }

  componentDidMount() {
    EventEmiterService.on(EventEmiterService.events.APP_PROCESSING, this.handerProcessingEvent);
    EventEmiterService.on(EventEmiterService.events.APP_SUBMITTING, this.handerSumittinggEvent);
    Linking.addEventListener('url', this.handleDeppLink);
    AppState.addEventListener('change', this.handleAppStateChange);
  }
  componentWillUnmount() {
    EventEmiterService.remove(EventEmiterService.events.APP_PROCESSING, this.handerProcessingEvent);
    EventEmiterService.remove(EventEmiterService.events.APP_SUBMITTING, this.handerSumittinggEvent);
    Linking.addEventListener('url', this.handleDeppLink);
    AppState.removeEventListener('change', this.handleAppStateChange);
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
      AppController.doOpenApp().then(user => {
        console.log(' doOpenApp : ', user);
        this.setState({ user });
      }).catch(error => {
        console.log('doOpenApp error :', error);
        this.setState({ user: {} })
      });
    }
    this.appState = nextAppState;
  }

  render() {
    let DisplayedComponent = LoadingComponent;
    if (this.state.user) {
      DisplayedComponent = this.state.user.bitmarkAccountNumber ? HomeComponent : OnboardingComponent;
    }
    return (
      <View style={{ flex: 1 }}>
        {!!this.state.processing && <DefaultIndicatorComponent />}
        {!!this.state.submitting && <BitmarkIndicatorComponent
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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StackNavigator } from 'react-navigation';
import ReactNative from 'react-native';

const {
  // Linking,
  // Alert,
  // AppState,
  // NetInfo,
  Text,
  // PushNotificationIOS,
  View,
} = ReactNative;

import { LoadingComponent, AppScaleComponent } from './commons/components';
import { HomeComponent } from './components/home';
import { OnboardingComponent } from './components/onboarding';

Text.defaultProps.allowFontScaling = false;

class MainComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
    };
  }

  render() {
    let DisplayedComponent = LoadingComponent;
    // if (this.state.user) {
    DisplayedComponent = this.state.user ? HomeComponent : OnboardingComponent;
    // }
    return (
      <AppScaleComponent ref={(r) => { this.appScaler = r; }}>
        <View style={{ width: '100%', height: '100%' }}>
          <DisplayedComponent screenProps={{
            refreshScaling: () => {
              if (this.appScaler) {
                this.appScaler.refreshScaling();
              }
            }
          }}>
          </DisplayedComponent>
        </View>
      </AppScaleComponent >
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
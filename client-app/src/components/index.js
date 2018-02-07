
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StackNavigator } from 'react-navigation';
import ReactNative from 'react-native';

const {
  // Linking,
  // Alert,
  // AppState,
  // NetInfo,
  // PushNotificationIOS,
  View,
} = ReactNative;

import { LoadingComponent } from './../commons/components';
import { HomeComponent } from './../components/home';
import { OnboardingComponent } from './onboarding';
import { AppService, } from './../services';

class MainComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
    };

    AppService.getCurrentUser().then((user) => {
      this.setState({ user });
      console.log('current user :', user);
    }).catch(error => {
      console.log(error);
      this.setState({ user: {} })
    });
  }

  render() {
    let DisplayedComponent = LoadingComponent;
    if (this.state.user) {
      DisplayedComponent = this.state.user.bitmarkAccountNumber ? HomeComponent : OnboardingComponent;
    }
    return (
      <View style={{ flex: 1 }}>
        <DisplayedComponent style={{ borderWidth: 1 }} screenProps={{
          rootNavigation: this.props.navigation,
          refreshScaling: () => {
            if (this.appScaler) {
              this.appScaler.refreshScaling();
            }
          }
        }}>
        </DisplayedComponent>
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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StackNavigator } from 'react-navigation';
import ReactNative from 'react-native';

const {
  Linking,
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

    this.handleDeppLink = this.handleDeppLink.bind(this);

    this.state = {
      user: null,
    };

    AppService.getCurrentUser().then((user) => {
      this.setState({ user });
    }).catch(error => {
      console.log(error);
      this.setState({ user: {} })
    });
  }

  componentDidMount() {
    Linking.addEventListener('url', this.handleDeppLink);
  }
  componentWillUnmount() {
    Linking.addEventListener('url', this.handleDeppLink);
  }

  handleDeppLink(event) {
    const route = event.url.replace(/.*?:\/\//g, '');
    const params = route.split('/');
    switch (params[0]) {
      // case 'login': {
      //   AppService.doPairMarketAccount(params[2], params[1]).then(() => {
      //     console.log('handleDeppLink doPairMarketAccount success!');
      //   }).catch(error => console.log('handleDeppLink doPairMarketAccount error :', error));
      //   break;
      // }
      default: {
        // TODO
        break;
      }
    }
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
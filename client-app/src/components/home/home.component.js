import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity
} from 'react-native';
import { NavigationActions } from 'react-navigation';

import { AppService } from "./../../services";

export class HomeComponent extends React.Component {

  render() {
    return (
      <View style={{ flex: 1, width: '100%', height: '100%', flexDirection: 'column', justifyContent: 'center', alignContent: 'center', alignItems: 'center' }}>
        <Text>Home screen</Text>
        <TouchableOpacity onPress={() => {
          AppService.logOut().then(() => {
            console.log('log out success');
            const resetMainPage = NavigationActions.reset({
              index: 0,
              actions: [NavigationActions.navigate({ routeName: 'Main', params: { justCreatedBitmarkAccount: true } })]
            });
            this.props.screenProps.rootNavigation.dispatch(resetMainPage);
          }).catch((error) => {
            console.log('log out error :', error);
          });
        }}>
          <Text >Log out</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

HomeComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
  }),
  screenProps: PropTypes.shape({
    rootNavigation: PropTypes.shape({
      navigate: PropTypes.func,
      dispatch: PropTypes.func,
    })
  }),
}
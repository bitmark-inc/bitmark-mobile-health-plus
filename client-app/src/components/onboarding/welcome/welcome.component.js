import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, Image,
  StatusBar,
} from 'react-native';

import welcomeComponentStyle from './welcome.component.style';

export class WelcomeComponent extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <View style={welcomeComponentStyle.body}>
        <StatusBar hidden={true} />
        <View style={welcomeComponentStyle.welcomeBackground}>
          <Image style={welcomeComponentStyle.welcomeLogo} source={require('./../../../../assets/imgs/welcome-logo.png')} />
          <View style={[welcomeComponentStyle.welcomeButtonArea]}>
            <TouchableOpacity style={[welcomeComponentStyle.welcomeButton,]} onPress={() => {
              this.props.navigation.navigate('NewAccount');
            }}>
              <Text style={[welcomeComponentStyle.welcomeButtonText,]}>{'OPEN NEW ACCOUNT'.toUpperCase()}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[welcomeComponentStyle.welcomeButton]} onPress={() => {
              this.props.navigation.navigate('SignIn');
            }}>
              <Text style={[welcomeComponentStyle.welcomeButtonText,]}>{'Sign in Existing Account'.toUpperCase()}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}

WelcomeComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
  }),
};
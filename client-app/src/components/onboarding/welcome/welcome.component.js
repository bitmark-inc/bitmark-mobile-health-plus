import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, Image,
  StatusBar,
} from 'react-native';

import welcomeComponentStyle from './welcome.component.style';
import { ios } from './../../../configs';

export class WelcomeComponent extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <View style={welcomeComponentStyle.body}>
        <StatusBar hidden={true} />
        <View style={welcomeComponentStyle.welcomeBackground}>
          <Image style={welcomeComponentStyle.welcomeLogo} source={require('./../../../../assets/imgs/loading-logo.png')} />
          <View style={[welcomeComponentStyle.welcomeButtonArea]}>
            <TouchableOpacity style={[welcomeComponentStyle.welcomeButton,]} onPress={() => {
              this.props.navigation.navigate('NewAccount');
            }}>
              <Text style={[welcomeComponentStyle.welcomeButtonText,]}>{'CREATE NEW ACCOUNT'.toUpperCase()}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[welcomeComponentStyle.welcomeButton, {
              backgroundColor: '#F2FAFF',
              height: 45 + ios.constant.blankFooter / 2,
              paddingBottom: Math.max(10, ios.constant.blankFooter)
            }]} onPress={() => {
              this.props.navigation.navigate('SignIn');
            }}>
              <Text style={[welcomeComponentStyle.welcomeButtonText, { color: '#0060F2' }]}>{'ACCESS EXISTING ACCOUNT'.toUpperCase()}</Text>
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
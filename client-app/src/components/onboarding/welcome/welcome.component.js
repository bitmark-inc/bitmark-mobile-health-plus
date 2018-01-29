import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';

import { iosDefaultStyle, androidDefaultStyle } from './../../../commons/styles';
import welcomeComponentStyle from './welcome.component.style';

let defaultStyle = Platform.select({
  ios: iosDefaultStyle,
  android: androidDefaultStyle,
});

export class WelcomeComponent extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <View style={welcomeComponentStyle.body}>
        <StatusBar hidden={true} />
        <View style={[defaultStyle.bottomButtonArea, { borderWidth: 0, }]}>
          <TouchableOpacity style={[defaultStyle.defaultButton, { backgroundColor: 'rgba(255, 255, 255, 0.8)', }]} onPress={() => {
            this.props.navigation.navigate('SignIn');
          }}>
            <Text style={[defaultStyle.defaultButtonText, { color: '#0060F2' }]}>RECOVER MY ACCOUNT</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[defaultStyle.bottomButton, { backgroundColor: 'rgba(0, 96, 242, 0.8)' }]} onPress={() => {
            this.props.navigation.navigate('NewAccount');
          }}>
            <Text style={[defaultStyle.bottomButtonText,]}>LET’S GET STARTED!</Text>
          </TouchableOpacity>
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
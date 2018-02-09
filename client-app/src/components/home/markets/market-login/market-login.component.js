import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, Image,
  Platform,
} from 'react-native';

import marketLoginStyle from './market-login.component.style';
import { androidDefaultStyle, iosDefaultStyle } from './../../../../commons/styles';
let defaultStyle = Platform.select({
  ios: iosDefaultStyle,
  android: androidDefaultStyle
});

export class MarketLoginComponent extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <View style={marketLoginStyle.body}>
        <View style={defaultStyle.header}>
          <TouchableOpacity style={defaultStyle.headerLeft} onPress={() => { this.props.navigation.goBack() }}>
            <Image style={defaultStyle.headerLeftIcon} source={require('../../../../../assets/imgs/header_back_icon_study_setting.png')} />
          </TouchableOpacity>
          <Text style={defaultStyle.headerTitle}></Text>
          <TouchableOpacity style={defaultStyle.headerRight} />
        </View>
      </View>
    );
  }
}

MarketLoginComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
  }),
}
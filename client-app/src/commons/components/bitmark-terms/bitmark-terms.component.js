import React from 'react';
import PropTypes from 'prop-types';
import {
  Text, View, TouchableOpacity, WebView, Platform,
} from 'react-native';

import { iosDefaultStyle, androidDefaultStyle } from './../../styles/index';
import termsStyles from './bitmark-terms.component.style';
let defaultStyles = Platform.select({
  ios: iosDefaultStyle,
  android: androidDefaultStyle,
});

export class BitmarkTermsComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      //TODO
    };
  }
  render() {
    return (
      <View style={termsStyles.body}>
        <View style={defaultStyles.header}>
          <TouchableOpacity style={defaultStyles.headerLeft}>
          </TouchableOpacity>
          <Text style={defaultStyles.headerTitle}>Terms of Service</Text>
          <TouchableOpacity style={defaultStyles.headerRight} onPress={() => {
            if (this.props.screenProps && this.props.screenProps.setShowPagination) {
              this.props.screenProps.setShowPagination(true);
            }
            this.props.navigation.goBack()
          }}>
            <Text style={defaultStyles.headerRightText}>Done</Text>
          </TouchableOpacity>
        </View>
        <View style={termsStyles.main}>
          <WebView source={{ uri: 'https://bitmark.com/term' }} />
        </View>
      </View >
    );
  }
}

BitmarkTermsComponent.propTypes = {
  screenProps: PropTypes.shape({
    setShowPagination: PropTypes.func,
  }),
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func
  }),
};
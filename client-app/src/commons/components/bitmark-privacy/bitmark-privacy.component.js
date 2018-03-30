import React from 'react';
import PropTypes from 'prop-types';
import {
  Text, View, TouchableOpacity, WebView, Platform,
} from 'react-native';
import { FullComponent } from './../bitmark-app-component';

import { iosDefaultStyle, androidDefaultStyle } from './../../styles/index';
import termsStyles from './bitmark-privacy.component.style';
let defaultStyles = Platform.select({
  ios: iosDefaultStyle,
  android: androidDefaultStyle,
});

export class BitmarkPrivacyComponent extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (<FullComponent
      header={(<View style={defaultStyles.header}>
        <TouchableOpacity style={defaultStyles.headerLeft}>
        </TouchableOpacity>
        <Text style={defaultStyles.headerTitle}>{'Terms of Service'.toUpperCase()}</Text>
        <TouchableOpacity style={defaultStyles.headerRight} onPress={() => {
          if (this.props.screenProps && this.props.screenProps.setShowPagination) {
            this.props.screenProps.setShowPagination(true);
          }
          this.props.navigation.goBack()
        }}>
          <Text style={defaultStyles.headerRightText}>Done</Text>
        </TouchableOpacity>
      </View>)}
      content={(<View style={termsStyles.main}>
        <WebView source={{ uri: 'https://bitmark.com/privacy' }} />
      </View>)}
    />
    );
  }
}

BitmarkPrivacyComponent.propTypes = {
  screenProps: PropTypes.shape({
    setShowPagination: PropTypes.func,
  }),
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func
  }),
};
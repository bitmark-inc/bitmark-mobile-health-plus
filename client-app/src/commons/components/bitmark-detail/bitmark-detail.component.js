import React from 'react';
import {
  Text, View, TouchableOpacity, WebView,
  StyleSheet,
  Platform,
} from 'react-native';
import PropTypes from 'prop-types';


import { iosDefaultStyle, androidDefaultStyle } from './../../styles/index';
import { config } from '../../../configs';
let defaultStyles = Platform.select({
  ios: iosDefaultStyle,
  android: androidDefaultStyle,
});
let termsStyles = StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
  },
  main: {
    flex: 1,
    borderTopColor: '#C0CCDF',
    backgroundColor: 'white',
  },
});

export class BitmarkDetailComponent extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    let bitmarkId;
    if (this.props.navigation.state.params && this.props.navigation.state.params.bitmarkId) {
      bitmarkId = this.props.navigation.state.params.bitmarkId;
    }
    if (!bitmarkId) {
      this.props.navigation.goBack();
    }
    return (
      <View style={termsStyles.body}>
        <View style={defaultStyles.header}>
          <TouchableOpacity style={defaultStyles.headerLeft}>
          </TouchableOpacity>
          <Text style={defaultStyles.headerTitle}>Bitmark</Text>
          <TouchableOpacity style={defaultStyles.headerRight} onPress={() => { this.props.navigation.goBack() }}>
            <Text style={defaultStyles.headerRightText}>Done</Text>
          </TouchableOpacity>
        </View>
        <View style={termsStyles.main}>
          <WebView source={{ uri: config.registry_server_url + '/bitmark/' + bitmarkId }} />
        </View>
      </View>
    );
  }
}

BitmarkDetailComponent.propTypes = {
  navigation: PropTypes.shape({
    state: PropTypes.shape({
      params: PropTypes.shape({
        bitmarkId: PropTypes.string,
      }),
    }),
    goBack: PropTypes.func,
  }),
};
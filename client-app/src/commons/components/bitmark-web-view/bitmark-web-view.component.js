import React from 'react';
import PropTypes from 'prop-types';
import {
  Text, View, TouchableOpacity, WebView,
} from 'react-native';
import { FullComponent } from './../bitmark-app-component';

import defaultStyles from './../../styles/index';
import termsStyles from './bitmark-web-view.component.style';

export class BitmarkWebViewComponent extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    let isFullScreen = this.props.screenProps.isFullScreen || this.props.navigation.state.params.isFullScreen;
    if (isFullScreen) {
      return (
        <FullComponent
          content={(<View style={termsStyles.body}>
            <View style={termsStyles.header}>
              <TouchableOpacity style={defaultStyles.headerLeft}>
              </TouchableOpacity>
              <Text style={defaultStyles.headerTitle}>{this.props.navigation.state.params.title.toUpperCase()}</Text>
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
              <WebView source={{ uri: this.props.navigation.state.params.sourceUrl }} />
            </View>
          </View>)}
        />
      );
    } else {
      return (<View style={termsStyles.body}>
        <View style={termsStyles.header}>
          <TouchableOpacity style={defaultStyles.headerLeft}>
          </TouchableOpacity>
          <Text style={defaultStyles.headerTitle}>{this.props.navigation.state.params.title.toUpperCase()}</Text>
          <TouchableOpacity style={defaultStyles.headerRight} onPress={() => {
            if (this.props.screenProps && this.props.screenProps.setShowPagination) {
              this.props.screenProps.setShowPagination(true);
            }
            this.props.navigation.goBack();
          }}>
            <Text style={defaultStyles.headerRightText}>Done</Text>
          </TouchableOpacity>
        </View>
        <View style={termsStyles.main}>
          <WebView source={{ uri: this.props.navigation.state.params.sourceUrl }} />
        </View>
      </View>);
    }
  }
}

BitmarkWebViewComponent.propTypes = {
  screenProps: PropTypes.shape({
    sourceUrl: PropTypes.string,
    isFullScreen: PropTypes.bool,
    setShowPagination: PropTypes.func,
  }),
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.shape({
        sourceUrl: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        isFullScreen: PropTypes.bool,
      })
    })
  }),
};
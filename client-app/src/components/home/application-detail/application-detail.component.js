import React from 'react';
import PropTypes from 'prop-types';
import {
  Text, View, TouchableOpacity,
  Share,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import Mailer from 'react-native-mail';

import applicationDetailStyle from './application-detail.component.style';

import { androidDefaultStyle, iosDefaultStyle } from './../../../commons/styles';
import { config } from '../../../configs/index';
import { DataController } from '../../../managers';

let defaultStyles = Platform.select({
  ios: iosDefaultStyle,
  android: androidDefaultStyle
});

export class ApplicationDetailComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const shareApp = () => {
      Share.share({ title: 'Bitmark', message: '', url: config.appLink });
    };
    const requestSendFeedback = () => {
      Alert.alert('Send Feedback', 'Have a comment or suggestion? We are always making improvements based on community feedback', [{
        text: 'Cancel', onPress: () => { }
      }, {
        text: 'Send', onPress: sendFeedback,
      }]);
    };

    const rateApp = () => {
      Alert.alert('App Store Review', 'Positive App Store ratings and reviews help support Bitmark. How would you rate us?', [{
        text: '5 Stars!', onPress: () => { Linking.openURL(config.appLink) }
      }, {
        text: '4 Stars or less', onPress: requestSendFeedback,
      }]);
    }

    const sendFeedback = () => {
      Mailer.mail({
        subject: 'Suggestion for Bitmark iOS',
        recipients: ['support@bitmark.com'],
      }, (error) => {
        if (error) {
          Alert.alert('Error', 'Could not send mail. Please send a mail to support@bitmark.com');
        }
      });
    };
    return (
      <View style={applicationDetailStyle.body}>
        <View style={defaultStyles.header}>
          <TouchableOpacity style={defaultStyles.headerLeft} >
          </TouchableOpacity>
          <Text style={defaultStyles.headerTitle}>Details</Text>
          <TouchableOpacity style={defaultStyles.headerRight} onPress={() => this.props.navigation.goBack()} >
            <Text style={defaultStyles.headerRightText}>Done</Text>
          </TouchableOpacity>
        </View>

        <View style={applicationDetailStyle.bodyContent}>
          <View style={applicationDetailStyle.topArea}>
            <View style={applicationDetailStyle.lineSetting}></View>
            <TouchableOpacity style={applicationDetailStyle.rowSetting} onPress={() => { this.props.navigation.navigate('BitmarkTerms') }}>
              <Text style={applicationDetailStyle.itemSettingText}>Terms of Service</Text>
            </TouchableOpacity>
            <View style={applicationDetailStyle.lineSetting}></View>
            <TouchableOpacity style={applicationDetailStyle.rowSetting} onPress={() => { this.props.navigation.navigate('BitmarkPrivacy') }}>
              <Text style={applicationDetailStyle.itemSettingText}>Privacy Policy</Text>
            </TouchableOpacity>
            <View style={applicationDetailStyle.lineSetting}></View>
          </View>

          <View style={applicationDetailStyle.donorInfo}>
            <Text style={applicationDetailStyle.version}>Version: {DataController.getApplicationVersion()} ({DataController.getApplicationBuildNumber() + (config.network !== 'livenet' ? '-' + config.network : '')})</Text>
          </View>

          <View style={applicationDetailStyle.bottomArea}>
            <View style={applicationDetailStyle.lineSetting}></View>
            <TouchableOpacity style={applicationDetailStyle.rowSetting} onPress={() => rateApp()}>
              <Text style={applicationDetailStyle.itemSettingText}>App Store Rating & Review</Text>
            </TouchableOpacity>
            <View style={applicationDetailStyle.lineSetting}></View>
            <TouchableOpacity style={applicationDetailStyle.rowSetting} onPress={() => { shareApp() }}>
              <Text style={applicationDetailStyle.itemSettingText}>Share This App</Text>
            </TouchableOpacity>
            <View style={applicationDetailStyle.lineSetting}></View>
            <TouchableOpacity style={[defaultStyles.bottomButton, applicationDetailStyle.rowSetting]} onPress={() => { requestSendFeedback() }}>
              <Text style={applicationDetailStyle.itemSettingText}>Send Feedback</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}

ApplicationDetailComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
  })
}
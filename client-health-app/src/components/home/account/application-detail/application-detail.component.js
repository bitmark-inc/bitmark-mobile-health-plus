import React from 'react';
import PropTypes from 'prop-types';
import {
  Text, View, TouchableOpacity, Image,
  Share,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import Mailer from 'react-native-mail';

import applicationDetailStyle from './application-detail.component.style';

import defaultStyles from '../../../../commons/styles';
import { config } from '../../../../configs/index';
import { DataProcessor } from '../../../../processors';

import {
  ios,
  android // TODO
} from '../../../../configs';
let constant = Platform.select({
  ios: ios.constant,
  android: android.constant
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
        text: 'Cancel', style: 'cancel',
      }, {
        text: 'Send', onPress: sendFeedback,
      }]);
    };

    const rateApp = () => {
      Alert.alert('App Store Review', 'Positive App Store ratings and reviews help support Bitmark. How would you rate us?', [{
        text: '5 Stars!',
        style: 'cancel',
        onPress: () => { Linking.openURL(config.appLink) }
      }, {
        text: '4 Stars or less', onPress: requestSendFeedback,
      }]);
    }

    const sendFeedback = () => {
      Mailer.mail({
        subject: 'Suggestion for Bitmark iOS',
        recipients: ['support@bitmark.com'],
        body: 'App version: ' + DataProcessor.getApplicationVersion() + ' (' + DataProcessor.getApplicationBuildNumber() + ')',
      }, (error) => {
        if (error) {
          Alert.alert('Error', 'Could not send mail. Please send a mail to support@bitmark.com');
        }
      });
    };

    return (
      <View style={applicationDetailStyle.body}>
        <View style={applicationDetailStyle.header}>
          <TouchableOpacity style={defaultStyles.headerLeft} onPress={() => this.props.navigation.goBack()} >
            <Image style={defaultStyles.headerLeftIcon} source={require('./../../../../../assets/imgs/header_blue_icon.png')} />
          </TouchableOpacity>
          <Text style={defaultStyles.headerTitle}>DETAILS</Text>
          <TouchableOpacity style={defaultStyles.headerRight} />
        </View>
        <View style={applicationDetailStyle.bodyContent}>
          <View style={applicationDetailStyle.topArea}>
            <TouchableOpacity style={applicationDetailStyle.rowSetting} onPress={() => {
              this.props.navigation.navigate('BitmarkWebView', {
                title: 'Terms of Service', sourceUrl: config.bitmark_web_site + '/term?env=app',
                hideBottomController: true,
              })
            }}>
              <Text style={applicationDetailStyle.itemSettingText}>{'Terms of Service'.toUpperCase()}</Text>
            </TouchableOpacity>
            <View style={applicationDetailStyle.lineSetting}></View>
            <TouchableOpacity style={applicationDetailStyle.rowSetting} onPress={() => {
              this.props.navigation.navigate('BitmarkWebView', {
                title: 'Privacy Policy', sourceUrl: config.bitmark_web_site + '/privacy?env=app',
                hideBottomController: true,
              })
            }}>
              <Text style={applicationDetailStyle.itemSettingText}>{'Privacy Policy'.toUpperCase()}</Text>
            </TouchableOpacity>
            <View style={applicationDetailStyle.lineSetting}></View>
          </View>

          <View style={applicationDetailStyle.donorInfo}>
            <Text style={applicationDetailStyle.version}>Version: {DataProcessor.getApplicationVersion()} ({DataProcessor.getApplicationBuildNumber() + (config.network !== 'livenet' ? '-' + config.network : '')})</Text>
          </View>

          <View style={applicationDetailStyle.bottomArea}>
            <View style={applicationDetailStyle.lineSetting}></View>
            <TouchableOpacity style={applicationDetailStyle.rowSetting} onPress={() => rateApp()}>
              <Text style={applicationDetailStyle.itemSettingText}>{'App Store Rating & Review'.toUpperCase()}</Text>
            </TouchableOpacity>
            <View style={applicationDetailStyle.lineSetting}></View>
            <TouchableOpacity style={applicationDetailStyle.rowSetting} onPress={() => { shareApp() }}>
              <Text style={applicationDetailStyle.itemSettingText}>{'Share This App'.toUpperCase()}</Text>
            </TouchableOpacity>
            <View style={applicationDetailStyle.lineSetting}></View>
            <TouchableOpacity style={[applicationDetailStyle.rowSetting, { marginBottom: constant.blankFooter, }]} onPress={() => { requestSendFeedback() }}>
              <Text style={applicationDetailStyle.itemSettingText}>{'Send Feedback'.toUpperCase()}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View >
    );
  }
}

ApplicationDetailComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
  })
}
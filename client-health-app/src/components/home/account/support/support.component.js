import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, Image,
  Share,
  Alert,
  Linking
} from 'react-native';

import Mailer from 'react-native-mail';
import { BitmarkComponent } from '../../../../commons/components';

import defaultStyle from '../../../../commons/styles';
import style from './support.component.style';
import {config} from "../../../../configs";
import {DataProcessor} from "../../../../processors";

export class SupportComponent extends React.Component {
  render() {
    return (
      <BitmarkComponent
        header={(<View style={defaultStyle.header}>
          <TouchableOpacity style={defaultStyle.headerLeft} onPress={() => this.props.navigation.goBack()}>
            <Image style={defaultStyle.headerLeftIcon} source={require('./../../../../../assets/imgs/header_blue_icon.png')} />
          </TouchableOpacity>
          <Text style={defaultStyle.headerTitle}>SUPPORT</Text>
          <TouchableOpacity style={defaultStyle.headerRight} />
        </View>)}

        content={(<View style={style.body}>
            {/*LEGAL*/}
            <View style={defaultStyle.itemContainer}>
              <Text style={defaultStyle.headerText}>LEGAL</Text>
            </View>

            <View style={defaultStyle.itemContainer}>
              <TouchableOpacity onPress={() => {
                this.props.navigation.navigate('BitmarkWebView', {
                  title: 'Terms of Service', sourceUrl: config.bitmark_web_site + '/term?env=app',
                  hideBottomController: true,
                  isFullScreen: true,
                  showDoneButton: true
                })
              }}>
                <Text style={defaultStyle.text}>Terms of Service</Text>
              </TouchableOpacity>
            </View>

            <View style={defaultStyle.itemContainer}>
              <TouchableOpacity onPress={() => {
                this.props.navigation.navigate('BitmarkWebView', {
                  title: 'Privacy Policy', sourceUrl: config.bitmark_web_site + '/privacy?env=app',
                  hideBottomController: true,
                  isFullScreen: true,
                  showDoneButton: true
                })
              }}>
                <Text style={defaultStyle.text}>Privacy Policy</Text>
              </TouchableOpacity>
            </View>

            {/*ABOUT*/}
            <View style={[defaultStyle.itemContainer, defaultStyle.sectionContainer]}>
              <Text style={defaultStyle.headerText}>ABOUT</Text>
            </View>

            <View style={defaultStyle.itemContainer}>
              <TouchableOpacity onPress={() => this.rateApp()}>
                <Text style={defaultStyle.text}>App Store Rating & Review</Text>
              </TouchableOpacity>
            </View>

            <View style={defaultStyle.itemContainer}>
              <TouchableOpacity onPress={() => this.shareApp()}>
                <Text style={defaultStyle.text}>Share This App</Text>
              </TouchableOpacity>
            </View>

            <View style={defaultStyle.itemContainer}>
              <TouchableOpacity onPress={() => this.sendFeedback()}>
                <Text style={defaultStyle.text}>Send Feedback</Text>
              </TouchableOpacity>
            </View>

            {/*POWERED BY*/}
            <View style={[defaultStyle.itemContainer, defaultStyle.sectionContainer]}>
              <Text style={defaultStyle.headerText}>POWERED BY</Text>
            </View>

            <View style={defaultStyle.itemContainer}>
              <Text style={defaultStyle.text}>Bitmark Inc.</Text>
            </View>
        </View >
        )}
      />
    );
  }

  shareApp() {
    Share.share({title: 'Bitmark', message: '', url: config.appLink});
  };

  requestSendFeedback() {
    Alert.alert('Send Feedback', 'Have a comment or suggestion? We are always making improvements based on community feedback', [{
      text: 'Cancel', style: 'cancel',
    }, {
      text: 'Send', onPress: this.sendFeedback,
    }]);
  };

  rateApp() {
    Alert.alert('App Store Review', 'Positive App Store ratings and reviews help support Bitmark. How would you rate us?', [{
      text: '5 Stars!',
      style: 'cancel',
      onPress: () => {
        Linking.openURL(config.appLink)
      }
    }, {
      text: '4 Stars or less', onPress: this.requestSendFeedback,
    }]);
  };

  sendFeedback() {
    Mailer.mail({
      subject: 'Suggestions for Bitmark Data Donation iOS',
      recipients: ['support@bitmark.com'],
      body: 'App version: ' + DataProcessor.getApplicationVersion() + ' (' + DataProcessor.getApplicationBuildNumber() + ')',
    }, (error) => {
      if (error) {
        Alert.alert('Error', 'Could not send mail. Please send a mail to support@bitmark.com');
      }
    });
  };
}

SupportComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func
  }),
};
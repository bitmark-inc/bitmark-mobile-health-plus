import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import {
  StyleSheet,
  Alert,
  Image, View, SafeAreaView, TouchableOpacity, Text, ScrollView,
} from 'react-native';
import QRCode from 'react-native-qrcode';
import Mailer from 'react-native-mail';
import Hyperlink from 'react-native-hyperlink';

import { convertWidth } from './../../utils';
import { config } from '../../configs';
import { constants } from '../../constants';
import { Actions } from 'react-native-router-flux';
import { AppProcessor } from '../../processors';
import { EventEmitterService } from '../../services';

export class GrantingAccessComponent extends Component {
  static propTypes = {
  };
  constructor(props) {
    super(props);
    this.state = {
      token: '',
    }

    AppProcessor.doGrantingAccess().then(result => {
      this.setState({ token: result.id });
    }).catch(error => {
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error, onClose: Actions.pop })
    })
  }

  sendEmail() {
    Mailer.mail({
      subject: 'Access my Bitmark Health account',
      recipients: [],
      body: `
        Hi
        <br/>
        <br/>
        I would like you to view my health records and data. Here’s a direct link:
        <br/>
        <br/>
        <a href="healthplus://granting-access/${this.state.token}">healthplus://granting-access/${this.state.token}</a>
        <br/>
        <br/>
        Please install <a href="${config.appLink}">Bitmark Health+</a> app and sign in before clicking the link.`,
      isHTML: true,
    }, (error) => {
      if (error) {
        Alert.alert('Error', 'Could not send mail. Please send a mail to support@bitmark.com');
      }
    });
  }

  render() {
    return (
      <SafeAreaView style={styles.bodySafeView}>
        <View style={styles.body}>
          <View style={styles.bodyContent}>
            <View style={styles.titleRow}>
              <Text style={styles.titleText}>Grant access</Text>
              <TouchableOpacity onPress={Actions.pop}>
                <Image style={styles.closeIcon} source={require('./../../../assets/imgs/close_icon_red.png')} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
              {!!this.state.token && <QRCode
                value={this.state.token}
                size={convertWidth(270)}
                bgColor='black'
                fgColor='white' />}
              <View style={{ flex: 1, justifyContent: 'center' }}>
                <Hyperlink linkStyle={{ color: '#FF4444' }}
                  onPress={() => {
                    Actions.account();
                  }}
                  linkText={() => 'Account Settings.'}
                >
                  <Text style={styles.message}>
                    Granting access to your account allows someone to view all your records and data. But they cannot transfer or change your records or data.{'\n\n'}
                    You can revoke access under http://abc
              </Text>
                </Hyperlink>
                <Hyperlink linkStyle={{ color: '#FF4444' }}
                  onPress={this.sendEmail.bind(this)}
                  linkText={() => 'Grant request'}
                >
                  <Text style={styles.messageEmail}>
                    You can also email a http://abc.
              </Text>
                </Hyperlink>
              </View>
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  bodySafeView: {
    flex: 1,
    backgroundColor: 'white',
  },
  body: {
    padding: convertWidth(16),
    paddingTop: convertWidth(16) + (config.isIPhoneX ? constants.iPhoneXStatusBarHeight : 0),
    flex: 1,
  },
  bodyContent: {
    flex: 1,
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: '#FF4444',
    width: "100%"
  },


  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: convertWidth(20),
    paddingTop: convertWidth(15),
  },
  titleText: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 36,
  },
  closeIcon: {
    width: convertWidth(20),
    height: convertWidth(20),
    resizeMode: 'contain',
  },

  content: {
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: convertWidth(20),
    paddingTop: convertWidth(35),
  },
  message: {
    fontFamily: 'Avenir Light',
    fontWeight: '300',
    fontSize: 16,
    marginTop: 35,
  },
  messageEmail: {
    fontFamily: 'Avenir Light',
    fontWeight: '300',
    fontSize: 16,
    marginTop: 20,
  }
});
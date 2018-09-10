import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  Alert,
  Image, View, SafeAreaView, TouchableOpacity, Text,
} from 'react-native';
import QRCode from 'react-native-qrcode';
import Mailer from 'react-native-mail';
import Hyperlink from 'react-native-hyperlink';

import { convertWidth, runPromiseWithoutError } from './../../utils';
import { config } from '../../configs';
import { constants } from '../../constants';
import { Actions } from 'react-native-router-flux';
import { DataProcessor, AppProcessor } from '../../processors';

export class GrantingAccessComponent extends Component {
  static propTypes = {
    bitmarkType: PropTypes.string,
    bitmarkId: PropTypes.string,
    issuedAt: PropTypes.any,
  };
  constructor(props) {
    super(props);
    this.state = {
      token: '',
    }

    runPromiseWithoutError(AppProcessor.doGrantingAccess()).then(result => {
      if (result && result.error) {
        console.log('result.error :', result.error);
        Alert.alert('This record can not be accessed.', 'Once you delete your account, you wll not able to access the record again.', [{
          text: 'OK', onPress: Actions.pop
        }]);
        return;
      }
      this.setState({ token: result.id });
    });
  }

  sendEmail() {
    Mailer.mail({
      subject: 'Access my Bitmark Health account',
      recipients: [],
      body: `
        Hi
        <br/>
        I would like you to view my health records and data. Here’s a direct link:
        <br/>
        <a href="healthplush://granting-access/${this.state.token}">healthplush://granting-access/${this.state.token}</a>
        <br/>
        Get the free <a href="${config.appLink}">Bitmark Health</a> app. 
        <br/>
        Health+ app version: ${DataProcessor.getApplicationVersion()} (${DataProcessor.getApplicationBuildNumber()})`,
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

            <View style={styles.content}>
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
                  onPress={() => {
                    Actions.account();
                  }}
                  linkText={() => 'Grant request'}
                >
                  <Text style={styles.messageEmail}>
                    You can also email a http://abc.
              </Text>
                </Hyperlink>
              </View>
            </View>
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
    color: '#464646',
  },
  closeIcon: {
    width: convertWidth(20),
    height: convertWidth(20),
    resizeMode: 'contain',
  },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 29,
    padding: convertWidth(20),
    paddingTop: convertWidth(15),
  },
  message: {
    fontFamily: 'Avenir Light',
    fontWeight: '300',
    fontSize: 16,
    marginTop: 20,
  },
  messageEmail: {
    fontFamily: 'Avenir Light',
    fontWeight: '300',
    fontSize: 16,
    marginTop: 20,
  }
});
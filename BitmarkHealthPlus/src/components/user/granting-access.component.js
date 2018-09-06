import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  Alert,
  Image, View, SafeAreaView, TouchableOpacity, Text,
} from 'react-native';
import QRCode from 'react-native-qrcode';
import Mailer from 'react-native-mail';

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
      subject: 'Granting access',
      recipients: [],
      body: `
        <a href="healthplush://${this.state.token}">Click to receive the granting!</a>
        </br>
        Health+ app version: ${DataProcessor.getApplicationVersion()} (${DataProcessor.getApplicationBuildNumber()})`,
      isHTML: true,
    }, (error) => {
      if (error) {
        Alert.alert('Error', 'Could not send mail. Please send a mail to support@bitmark.com');
      }
    });
  }


  render() {
    console.log('this.state:', this.state);
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
              <Text style={styles.message}>To protect your privacy, you are identified in the Bitmark system by a pseudonymous account number. This number is public. You can safely share it with others without compromising your security.</Text>
              <View></View>
            </View>
          </View>
          <TouchableOpacity style={styles.bottomButton} onPress={this.sendEmail.bind(this)}>
            <Text style={styles.bottomButtonText}>{'Send by email'.toUpperCase()}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  bodySafeView: {
    flex: 1,
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
  },
  titleText: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 36,
    color: '#464646',
  },
  closeIcon: {
    width: convertWidth(40),
    height: convertWidth(40),
    resizeMode: 'contain',
  },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 29,
    padding: convertWidth(20),
  },
  message: {
    fontFamily: 'Avenir Light',
    fontWeight: '300',
    fontSize: 12,
  },

  bottomButton: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#FF4444',
    height: constants.buttonHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomButtonText: {
    fontFamily: 'Avenir Light',
    fontWeight: '600',
    fontSize: 16,
    color: '#FF4444'
  }

});
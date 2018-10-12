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

import { convertWidth, runPromiseWithoutError } from './../../utils';
import { config } from '../../configs';
import { constants } from '../../constants';
import { Actions } from 'react-native-router-flux';
import { AppProcessor, DataProcessor } from '../../processors';
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
    runPromiseWithoutError(DataProcessor.doTrackEvent({ eventName: 'health_plus_user_first_time_share_grant_access' }));
    Mailer.mail({
      subject: i18n.t('GrantingAccessComponent_subject'),
      recipients: [],
      body: i18n.t('GrantingAccessComponent_body', { token: this.state.token, appLink: config.appLink }),
      isHTML: true,
    }, (error) => {
      if (error) {
        Alert.alert(i18n.t('GrantingAccessComponent_alertTitle'), i18n.t('GrantingAccessComponent_alertMessage'));
      }
    });
  }

  render() {
    return (
      <SafeAreaView style={styles.bodySafeView}>
        <View style={styles.body}>
          <View style={styles.bodyContent}>
            <View style={styles.titleRow}>
              <Text style={styles.titleText}>{i18n.t('GrantingAccessComponent_titleText')}</Text>
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
                    {i18n.t('GrantingAccessComponent_message')}
                  </Text>
                </Hyperlink>
                <Hyperlink linkStyle={{ color: '#FF4444' }}
                  onPress={this.sendEmail.bind(this)}
                  linkText={() => 'Grant request'}
                >
                  <Text style={styles.messageEmail}>
                    {i18n.t('GrantingAccessComponent_messageEmail')}
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
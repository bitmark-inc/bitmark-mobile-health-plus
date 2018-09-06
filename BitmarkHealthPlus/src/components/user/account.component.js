import React, { Component } from 'react';
import {
  StyleSheet,
  Linking,
  Alert,
  Share,
  Clipboard,
  Image, View, TouchableOpacity, Text, SafeAreaView, ScrollView,
} from 'react-native';
import Intercom from 'react-native-intercom';

import HyperLink from 'react-native-hyperlink';
import Mailer from 'react-native-mail';

import { convertWidth } from './../../utils';
import { config } from './../../configs';
import { Actions } from 'react-native-router-flux';
import { constants } from '../../constants';
import {
  DataProcessor,
  AppProcessor
} from '../../processors';
import { EventEmitterService } from '../../services';

export class AccountComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      accountNumberCopyText: ''
    }
  }

  rateApp() {
    Alert.alert('App Store Review', 'Positive App Store ratings and reviews help support Bitmark. How would you rate us?', [{
      text: '5 Stars!',
      style: 'cancel',
      onPress: () => { Linking.openURL(config.appLink) }
    }, {
      text: '4 Stars or less', onPress: this.requestSendFeedback,
    }]);
  }

  requestSendFeedback() {
    Alert.alert('Send Feedback', 'Have a comment or suggestion? We are always making improvements based on community feedback', [{
      text: 'Cancel', style: 'cancel',
    }, {
      text: 'Send', onPress: this.sendFeedback,
    }]);
  }

  sendFeedback() {
    Mailer.mail({
      subject: 'Suggestion for Bitmark iOS',
      recipients: ['support@bitmark.com'],
      body: 'Health+ version: ' + DataProcessor.getApplicationVersion() + ' (' + DataProcessor.getApplicationBuildNumber() + ')',
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
            <View style={[styles.accountNumberTitleRow,]}>
              <Text style={styles.accountNumberTitle} >Account</Text>
              <TouchableOpacity onPress={Actions.pop}>
                <Image style={styles.closeIcon} source={require('../../../assets/imgs/close_icon_red.png')} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <View style={styles.accountNumberArea}>
                <Text style={styles.accountNumberLabel}>Account number</Text>
                <TouchableOpacity onPress={() => {
                  Clipboard.setString(DataProcessor.getUserInformation().bitmarkAccountNumber);
                  this.setState({ accountNumberCopyText: 'Account number copied!' });
                  setTimeout(() => { this.setState({ accountNumberCopyText: '' }) }, 1000);
                }}>
                  <Text style={styles.accountNumberValue}>{DataProcessor.getUserInformation().bitmarkAccountNumber}</Text>
                </TouchableOpacity>
                <View style={styles.accountNumberValueBar}></View>
                <View style={[styles.accountNumberCopiedArea, this.state.accountNumberCopyText ? {} : { backgroundColor: 'white' }]}>
                  <Text style={styles.accountNumberCopiedText}>{this.state.accountNumberCopyText}</Text>
                </View>
                <HyperLink
                  onPress={(url) => Linking.openURL(url)}
                  linkStyle={{ color: '#0060F2', }}
                  linkText={() => 'This number is public'} >
                  <Text style={styles.accountNumberDescription}>To protect your privacy, you are identified in the Bitmark system by a pseudonymous account number. {config.registry_server_url}. You can safely share it with others without compromising your security.</Text>
                </HyperLink>

                <TouchableOpacity style={styles.rowButton} onPress={() => {
                  Intercom.displayMessageComposer();
                }}>
                  <Text style={styles.rowButtonText}>Help and feedback</Text>
                  <Image style={styles.rowButtonIcon} source={require('../../../assets/imgs/arrow_left_icon_red.png')} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.rowButton} onPress={Actions.support}>
                  <Text style={styles.rowButtonText}>Legal</Text>
                  <Image style={styles.rowButtonIcon} source={require('../../../assets/imgs/arrow_left_icon_red.png')} />
                </TouchableOpacity>
              </View>

              <View style={styles.securityArea}>
                <Text style={styles.securityTitle} >Security</Text>
                <TouchableOpacity style={styles.rowButton} onPress={() => Actions.accountPhrase()}>
                  <Text style={styles.rowButtonText}>Write Down Recovery Phrase</Text>
                  <Image style={styles.rowButtonIcon} source={require('../../../assets/imgs/arrow_left_icon_red.png')} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.rowButton} onPress={() => Actions.accountPhrase({ isLogout: true })}>
                  {/* <TouchableOpacity style={styles.rowButton} onPress={() => {
                  AppProcessor.doLogout().then(() => {
                    EventEmitterService.emit(EventEmitterService.events.APP_NEED_REFRESH);
                  }).catch(error => {
                    EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error })
                  })
                }}> */}
                  <Text style={styles.rowButtonText}>Log out</Text>
                  <Image style={styles.rowButtonIcon} source={require('../../../assets/imgs/arrow_left_icon_red.png')} />
                </TouchableOpacity>
              </View>

              <View style={styles.accessArea}>
                <Text style={styles.accessTitle}>Access list</Text>
              </View>
              <View style={styles.aboutArea}>
                <Text style={styles.aboutTitle}>About</Text>
                <TouchableOpacity style={styles.rowButton} onPress={this.rateApp.bind(this)}>
                  <Text style={styles.rowButtonText}>App Store Rating & Review</Text>
                  <Image style={styles.rowButtonIcon} source={require('../../../assets/imgs/arrow_left_icon_red.png')} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.rowButton} onPress={() => Share.share({ title: 'Bitmark', message: '', url: config.appLink })}>
                  <Text style={styles.rowButtonText}>Share This App</Text>
                  <Image style={styles.rowButtonIcon} source={require('../../../assets/imgs/arrow_left_icon_red.png')} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.rowButton} onPress={this.requestSendFeedback.bind(this)}>
                  <Text style={styles.rowButtonText}>Send Feedback</Text>
                  <Image style={styles.rowButtonIcon} source={require('../../../assets/imgs/arrow_left_icon_red.png')} />
                </TouchableOpacity>
              </View>
              <View style={styles.aboutArea}>
                <Text style={styles.powerTitle}>POWERED BY</Text>
                <TouchableOpacity style={styles.rowButton} onPress={() => Linking.openURL(config.bitmark_web_site)}>
                  <Text style={styles.rowButtonText}>Bitmark Inc.</Text>
                  <Image style={styles.rowButtonIcon} source={require('../../../assets/imgs/arrow_left_icon_red.png')} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.rowButton} disabled={true}>
                  <Text style={styles.rowButtonText}>Version</Text>
                  <Text style={styles.rowButtonText}>{DataProcessor.getApplicationVersion()} ({DataProcessor.getApplicationBuildNumber() + (config.network !== config.NETWORKS.livenet ? '-' + config.network : '')})</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.rowButton, { marginTop: 53 }]} onPress={Actions.deletingAccount}>
                  <Text style={[styles.rowButtonText, { color: '#FF4444' }]}>Delete your account</Text>
                  <Image style={styles.rowButtonIcon} source={require('../../../assets/imgs/arrow_left_icon_red.png')} />
                </TouchableOpacity>
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
    width: "100%",
  },
  accountNumberArea: {
    flexDirection: 'column',
    padding: convertWidth(20),
    paddingBottom: 30,
  },
  accountNumberTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: convertWidth(20),
    paddingBottom: 0,
  },
  accountNumberTitle: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 36,
  },
  closeIcon: {
    width: convertWidth(30),
    height: convertWidth(30),
    resizeMode: 'contain',
  },
  accountNumberLabel: {
    fontFamily: 'Avenir Medium',
    fontSize: 16,
    color: '#6D6D72',
  },
  accountNumberValue: {
    fontFamily: 'Andale Mono',
    fontSize: 10,
    marginTop: 5,
    color: '#FF1F1F'
  },
  accountNumberValueBar: {
    marginTop: 4,
    borderBottomWidth: 1,
    width: '100%',
    borderColor: '#FF1F1F',
  },
  accountNumberCopiedArea: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
    marginTop: 8,
    minHeight: 21,
  },
  accountNumberCopiedText: {
    fontFamily: 'Avenir Light',
    fontWeight: '300',
    fontSize: 14,
    color: 'white',
  },
  accountNumberDescription: {
    marginTop: 12,
    fontFamily: 'Avenir Light',
    fontWeight: '300',
    fontSize: 16,
  },

  securityArea: {
    borderTopWidth: 1,
    borderColor: '#FF4444',
    padding: convertWidth(20),
    paddingBottom: 30,
  },
  securityTitle: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 34,
    color: '#464646',
  },


  accessArea: {
    borderTopWidth: 1,
    borderColor: '#FF4444',
    padding: convertWidth(20),
    paddingBottom: 30,
  },
  accessTitle: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 34,
    color: '#464646',
  },

  aboutArea: {
    borderTopWidth: 1,
    borderColor: '#FF4444',
    padding: convertWidth(20),
    paddingBottom: 30,
  },
  aboutTitle: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 34,
    color: '#464646',
  },

  powerTitle: {
    fontFamily: 'Avenir Black',
    fontWeight: '600',
    fontSize: 14,
    color: '#6D6D72',
  },

  rowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 12.5,
    minHeight: 24.5,
  },
  rowButtonIcon: {
    width: convertWidth(8),
    height: 14 * convertWidth(8) / 8,
    resizeMode: 'contain',
  },
  rowButtonText: {
    fontFamily: 'Avenir Light',
    fontWeight: '300',
    fontSize: 16,
  }

});

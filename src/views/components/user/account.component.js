import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import {
  StyleSheet,
  Linking,
  Alert,
  Share,
  Image, View, TouchableOpacity, Text, SafeAreaView, ScrollView,
} from 'react-native';
import Intercom from 'react-native-intercom';
import Mailer from 'react-native-mail';
import { Actions } from 'react-native-router-flux';
import { AppProcessor, EventEmitterService, DataProcessor, CacheData } from 'src/processors';
import { config, } from 'src/configs';
import { convertWidth } from 'src/utils';

export class AccountComponent extends Component {
  static propTypes = {

  };
  constructor(props) {
    super(props);
    this.state = {
      accountNumberCopyText: i18n.t('AccountComponent_accountNumberCopyText'),
    };
  }

  doLogout() {
    AppProcessor.doLogout().then((result) => {
      if (result) {
        EventEmitterService.emit(EventEmitterService.events.APP_NEED_REFRESH, {indicator: true});
      }
    }).catch(error => {
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error })
    });
  }


  rateApp() {
    Alert.alert(i18n.t('AccountComponent_alertTitle1'), i18n.t('AccountComponent_alertMessage1'), [{
      text: i18n.t('AccountComponent_alertButton11'),
      style: 'cancel',
      onPress: () => { Linking.openURL(config.appLink) }
    }, {
      text: i18n.t('AccountComponent_alertButton12'), onPress: this.requestSendFeedback.bind(this),
    }]);
  }

  requestSendFeedback() {
    Alert.alert(i18n.t('AccountComponent_alertTitle2'), i18n.t('AccountComponent_alertMessage2'), [{
      text: i18n.t('AccountComponent_alertButton21'), style: 'cancel',
    }, {
      text: i18n.t('AccountComponent_alertButton22'), onPress: this.sendFeedback,
    }]);
  }

  sendFeedback() {
    Mailer.mail({
      subject: i18n.t('AccountComponent_subject'),
      recipients: ['support@bitmark.com'],
      body: 'Bitmark Health version: ' + DataProcessor.getApplicationVersion() + ' (' + DataProcessor.getApplicationBuildNumber() + ')',
    }, (error) => {
      if (error) {
        Alert.alert(i18n.t('AccountComponent_alertTitle3'), i18n.t('AccountComponent_alertMessage3'));
      }
    });
  }

  render() {
    let emailAddress = config.network === config.NETWORKS.livenet
      ? `${CacheData.userInformation.bitmarkAccountNumber}@health.bitmark.com`
      : `${CacheData.userInformation.bitmarkAccountNumber}@drop.test.bitmark.com`;
    return (
      <SafeAreaView style={styles.bodySafeView}>
        <View style={styles.body}>
          <View style={styles.bodyContent}>


            <ScrollView>
              <View style={styles.accountNumberArea}>
                <View style={[styles.accountNumberTitleRow,]}>
                  <Text style={styles.accountNumberTitle} >{i18n.t('AccountComponent_accountNumberTitle')}</Text>
                  <TouchableOpacity onPress={Actions.pop}>
                    <Image style={styles.closeIcon} source={require('assets/imgs/close_icon_red.png')} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.accountNumberDescription}>{i18n.t('AccountComponent_accountNumberDescription')}</Text>
                <Text style={styles.accountNumberValue}>{emailAddress}</Text>
                <View style={[styles.accountNumberCopiedArea]} >
                  <TouchableOpacity onPress={() => Share.share({ title: '', message: emailAddress })}>
                    <Text style={styles.accountNumberShareButtonText}>{i18n.t('AccountComponent_accountNumberShareButtonText')}</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.rowButton} onPress={Actions.accountNumber}>
                  <Text style={[styles.accountNumberLabel, styles.rowButtonText]}>{i18n.t('AccountComponent_accountNumberLabel')}</Text>
                  <Image style={styles.rowButtonIcon} source={require('assets/imgs/arrow_left_icon_red.png')} />
                </TouchableOpacity>
              </View>

              <View style={styles.securityArea}>
                <Text style={styles.securityTitle} >{i18n.t('AccountComponent_securityTitle')}</Text>
                <TouchableOpacity style={[styles.rowButton, { marginTop: 25 }]} onPress={() => Actions.accountPhrase()}>
                  <Text style={styles.rowButtonText}>{i18n.t('AccountComponent_rowButtonText3')}</Text>
                  <Image style={styles.rowButtonIcon} source={require('assets/imgs/arrow_left_icon_red.png')} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.rowButton} onPress={() => Actions.accountPhrase({ isLogout: true })}>
                  {/* <TouchableOpacity style={styles.rowButton} onPress={this.doLogout.bind(this)}> */}
                  <Text style={styles.rowButtonText}>{i18n.t('AccountComponent_rowButtonText4')}</Text>
                  <Image style={styles.rowButtonIcon} source={require('assets/imgs/arrow_left_icon_red.png')} />
                </TouchableOpacity>
              </View>
              <View style={styles.aboutArea}>
                <Text style={styles.aboutTitle}>{i18n.t('AccountComponent_aboutTitle')}</Text>
                <TouchableOpacity style={[styles.rowButton, { marginTop: 25 }]} onPress={() => {
                  Intercom.displayMessageComposer();
                }}>
                  <Text style={styles.rowButtonText}>{i18n.t('AccountComponent_rowButtonText1')}</Text>
                  <Image style={styles.rowButtonIcon} source={require('assets/imgs/arrow_left_icon_red.png')} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.rowButton} onPress={() => Linking.openURL('https://www.facebook.com/groups/274018259885853/')} >
                  <Text style={styles.rowButtonText}>{i18n.t('AccountComponent_rowButtonText9')}</Text>
                  <Image style={styles.rowButtonIcon} source={require('assets/imgs/arrow_left_icon_red.png')} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.rowButton} onPress={() => Share.share({ title: 'Bitmark', message: '', url: config.appLink })}>
                  <Text style={styles.rowButtonText}>{i18n.t('AccountComponent_rowButtonText6')}</Text>
                  <Image style={styles.rowButtonIcon} source={require('assets/imgs/arrow_left_icon_red.png')} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.rowButton} onPress={Actions.support}>
                  <Text style={styles.rowButtonText}>{i18n.t('AccountComponent_rowButtonText2')}</Text>
                  <Image style={styles.rowButtonIcon} source={require('assets/imgs/arrow_left_icon_red.png')} />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.rowButton, { marginTop: 53 }]} disabled={true}>
                  <Text style={styles.rowButtonText}>{i18n.t('AccountComponent_rowButtonText7')}</Text>
                  <Text style={styles.rowButtonText}>{DataProcessor.getApplicationVersion()} ({DataProcessor.getApplicationBuildNumber() + (config.network !== config.NETWORKS.livenet ? '-' + config.network : '')})</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.rowButton]} onPress={() => DataProcessor.doDisplayedWhatNewInformation()}>
                  <Text style={styles.rowButtonText}>{i18n.t('AccountComponent_rowButtonText8')}</Text>
                  <Image style={styles.rowButtonIcon} source={require('assets/imgs/arrow_left_icon_red.png')} />
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
    paddingTop: convertWidth(16),
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
    paddingBottom: 45,
  },
  accountNumberTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: convertWidth(10),
  },
  accountNumberTitle: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next W1G' : 'Avenir Black',
    fontWeight: '900',
    fontSize: 36,
  },
  closeIcon: {
    width: convertWidth(20),
    height: convertWidth(20),
    resizeMode: 'contain',
  },
  accountNumberValue: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next W1G' : 'Andale Mono',
    fontSize: 14,
    marginTop: 15,
    color: '#FF1F1F'
  },
  accountNumberLabel: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next W1G' : 'Avenir Medium',
    fontSize: 16,
    color: '#6D6D72',
  },
  accountNumberCopiedArea: {
    backgroundColor: 'white',
    marginTop: 8,
    minHeight: 21,
    flexDirection: 'row',
  },
  accountNumberShareButtonText: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next W1G' : 'Avenir Medium',
    fontWeight: '600',
    fontSize: 14,
    color: '#0064FC',
    marginTop: 5,
    minWidth: 54,
  },
  accountNumberDescription: {
    marginTop: 12,
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next W1G' : 'Avenir Light',
    fontWeight: '300',
    fontSize: 16,
  },

  securityArea: {
    borderTopWidth: 1,
    borderColor: '#FF4444',
    padding: convertWidth(20),
    paddingBottom: 45,
  },
  securityTitle: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next W1G' : 'Avenir Black',
    fontWeight: '900',
    fontSize: 34,
  },

  aboutArea: {
    borderTopWidth: 1,
    borderColor: '#FF4444',
    padding: convertWidth(20),
    paddingBottom: 20,
  },
  aboutTitle: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next W1G' : 'Avenir Black',
    fontWeight: '900',
    fontSize: 34,
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
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next W1G' : 'Avenir Medium',
    fontWeight: '400',
    fontSize: 16,
    color: 'black'
  }

});

import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import {
  StyleSheet,
  Linking,
  Alert,
  Image, View, SafeAreaView, ScrollView, Text, TouchableOpacity,
} from 'react-native';
import Mailer from 'react-native-mail';
import { AppProcessor, EventEmitterService, DataProcessor, CacheData } from 'src/processors';
import { config, } from 'src/configs';
import { convertWidth } from 'src/utils';
import { MMRCardComponent } from './mmr';

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
        EventEmitterService.emit(EventEmitterService.events.APP_NEED_REFRESH);
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
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerLeft}>
            <Image style={styles.headerLeftBackIcon} source={require('assets/imgs/back_icon_black_white.png')} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vault</Text>
          <View style={styles.headerRight} />
        </View>
        <ScrollView contentContainerStyle={styles.body}>
          <View style={{
          }} />
          <MMRCardComponent />
        </ScrollView>
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
    padding: convertWidth(15),
    paddingTop: convertWidth(15),
    flexGrow: 1,
    borderWidth: 1,
  },
  header: {
    height: 56, width: '100%',
    flexDirection: 'row', alignItems: 'center',
  },
  headerLeft: {
    paddingLeft: convertWidth(19),
    width: convertWidth(35),
  },

  headerLeftBackIcon: {
    width: 16, height: '100%', resizeMode: 'contain',
  },
  headerTitle: {
    textAlign: 'center',
    flex: 1
  },
  headerRight: {
    paddingRight: convertWidth(19),
    width: convertWidth(35),
  },

});

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
          <MMRCardComponent />
          <View style={{
            marginTop: 16,
            width: convertWidth(344),
            shadowOffset: { width: 0, height: 3, }, shadowOpacity: 0.2, shadowColor: '#000000', shadowRadius: 5,
            borderWidth: 0.1, borderRadius: 4, borderColor: '#F4F2EE',
            paddingBottom: 14,
            backgroundColor: '#F4F2EE',
          }}>
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              height: 40, width: '100%',
              backgroundColor: '#F4F2EE',
              shadowOffset: { width: 0, height: 1, }, shadowOpacity: 0.2, shadowColor: '#000000', shadowRadius: 4,
              borderTopWidth: 0.1, borderTopLeftRadius: 4, borderTopRightRadius: 4, borderTopColor: '#F4F2EE',
              zIndex: 1,
            }}>
              <Text style={{
                fontFamily: 'Avenir Light', fontSize: 10, fontWeight: '300',
                marginLeft: convertWidth(15),
              }}>ADDRESS</Text>
            </View>
            <View style={{
              flex: 1,
              backgroundColor: '#F4F2EE',
              marginTop: 7,
            }}>
              <View style={{
                flexDirection: 'row', alignItems: 'center',
                paddingLeft: convertWidth(15), paddingRight: convertWidth(15),
                height: 43,
              }}>
                <Text >Your vault is addressed using your{'\n'}Bitmark account number: </Text>
              </View>
              <View style={{
                flexDirection: 'row', alignItems: 'center',
                paddingLeft: convertWidth(15), paddingRight: convertWidth(15),
                height: 43,
                borderTopWidth: 0.3, borderTopColor: 'rgba(0,0,0,0.05)'
              }}>
                <Text>[e4fT2...gAB1o]</Text>
              </View>
              <View style={{
                flexDirection: 'row', alignItems: 'center',
                paddingLeft: convertWidth(15), paddingRight: convertWidth(15),
                height: 43,
                borderTopWidth: 0.3, borderTopColor: 'rgba(0,0,0,0.05)'
              }}>
                <Text>Others can send you medical records at the following email address:</Text>
              </View>
              <View style={{
                flexDirection: 'row', alignItems: 'center',
                paddingLeft: convertWidth(15), paddingRight: convertWidth(15),
                height: 43,
                borderTopWidth: 0.3, borderTopColor: 'rgba(0,0,0,0.05)'
              }}>
                <Text>account_number@health.bitmark.com</Text>
              </View>
            </View>

          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  bodySafeView: {
    flex: 1,
    backgroundColor: '#E5E5E5',
  },
  body: {
    padding: convertWidth(15),
    paddingTop: convertWidth(15),
    flexGrow: 1,
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
    fontFamily: 'Avenir Black', fontSize: 24, fontWeight: '900', textAlign: 'center',
    flex: 1
  },
  headerRight: {
    paddingRight: convertWidth(19),
    width: convertWidth(35),
  },

});

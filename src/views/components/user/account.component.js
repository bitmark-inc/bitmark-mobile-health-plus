import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import {
  StyleSheet,
  Linking,
  Alert,
  Share,
  Image, View, SafeAreaView, ScrollView, Text, TouchableOpacity,
} from 'react-native';
import Mailer from 'react-native-mail';
import { AppProcessor, EventEmitterService, DataProcessor, CacheData } from 'src/processors';
import { config, } from 'src/configs';
import { convertWidth } from 'src/utils';
import { MMRCardComponent } from './mmr';
import { ShadowTopComponent, ShadowComponent } from 'src/views/commons';
import { Actions } from 'react-native-router-flux';
import Intercom from 'react-native-intercom';


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
          <TouchableOpacity style={styles.headerLeft} onPress={() => Actions.reset('user')}>
            <Image style={styles.headerLeftBackIcon} source={require('assets/imgs2/back_icon_black.png')} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vault</Text>
          <View style={styles.headerRight} />
        </View>
        <ScrollView contentContainerStyle={styles.body}>
          <MMRCardComponent />

          <ShadowComponent style={styles.cardBody}>
            <ShadowTopComponent contentStyle={styles.cardHeader}>
              <Text style={styles.cardTitle}>ADDRESS</Text>
            </ShadowTopComponent>
            <View style={styles.cardContentRow}>
              <Text style={styles.itemDescription}>Your vault is addressed using your{'\n'}Bitmark account number: </Text>
            </View>
            <TouchableOpacity style={styles.cardContentRow} onPress={Actions.accountNumber}>
              <Text style={styles.accountNumber}>{`[${CacheData.userInformation.bitmarkAccountNumber.substring(0, 4)}...${CacheData.userInformation.bitmarkAccountNumber.substring(CacheData.userInformation.bitmarkAccountNumber.length - 4, CacheData.userInformation.bitmarkAccountNumber.length)}]`}</Text>
              <Image style={styles.copyIcon} source={require('assets/imgs2/arrow_left_icon_black.png')} />
            </TouchableOpacity>
            <View style={styles.cardContentRow}>
              <Text style={styles.itemDescription}>Others can send you medical records at the following email address:</Text>
            </View>
            <TouchableOpacity style={[styles.cardContentRow, {
              borderBottomLeftRadius: 4, borderBottomRightRadius: 4,
            }]}
              onPress={() => Share.share({ title: '', message: emailAddress })}
            >
              <Text style={styles.emailAddress}>{emailAddress}</Text>
              <Image style={styles.shareIcon} source={require('assets/imgs2/share_icon.png')} />
            </TouchableOpacity>

          </ShadowComponent>

          <ShadowComponent style={styles.cardBody}>
            <ShadowTopComponent contentStyle={styles.cardHeader}>
              <Text style={styles.cardTitle}>SECURITY</Text>
            </ShadowTopComponent>
            <TouchableOpacity style={styles.cardContentRow}
              onPress={() => Actions.accountPhrase()}
            >
              <Text style={styles.cardContentRowButtonText}>Write down vault key phrase</Text>
              <Image style={styles.copyIcon} source={require('assets/imgs2/arrow_left_icon_black.png')} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.cardContentRow, {
              borderBottomLeftRadius: 4, borderBottomRightRadius: 4,
            }]}
              onPress={() => Actions.accountPhrase({ isLogout: true })}
            >
              <Text style={styles.cardContentRowButtonText}>Lock your vault</Text>
              <Image style={styles.copyIcon} source={require('assets/imgs2/arrow_left_icon_black.png')} />
            </TouchableOpacity>
          </ShadowComponent>

          <ShadowComponent style={styles.cardBody}>
            <ShadowTopComponent contentStyle={styles.cardHeader}>
              <Text style={styles.cardTitle}>ABOUT</Text>
            </ShadowTopComponent>
            <TouchableOpacity style={styles.cardContentRow} onPress={() => Intercom.displayMessageComposer()}>
              <Text style={styles.cardContentRowButtonText}>Chat with us</Text>
              <Image style={styles.copyIcon} source={require('assets/imgs2/arrow_left_icon_black.png')} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.cardContentRow]} onPress={() => Linking.openURL('https://www.facebook.com/groups/274018259885853/')} >
              <Text style={styles.cardContentRowButtonText}>Join our Alpha Tester Group</Text>
              <Image style={styles.copyIcon} source={require('assets/imgs2/arrow_left_icon_black.png')} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.cardContentRow, {
              borderBottomLeftRadius: 4, borderBottomRightRadius: 4,
            }]}
              onPress={Actions.support}
            >
              <Text style={styles.cardContentRowButtonText}>Legal</Text>
              <Image style={styles.copyIcon} source={require('assets/imgs2/arrow_left_icon_black.png')} />
            </TouchableOpacity>
          </ShadowComponent>

          <View style={[styles.normalRow, { marginTop: 16 }]}>
            <Text style={styles.rowLabel}>VERSION</Text>
            <Text style={styles.rowValue}>1.0</Text>
          </View>

          <TouchableOpacity style={styles.normalRow} onPress={() => DataProcessor.doDisplayedWhatNewInformation()}>
            <Text style={styles.rowLabel}>WHAT’S NEW</Text>
            <Image style={styles.copyIcon} source={require('assets/imgs2/arrow_left_icon_black.png')} />
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView >
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


  cardBody: {
    flexDirection: 'column',
    marginTop: 16,
    width: convertWidth(344),
  },
  cardHeader: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start',
    height: 40,
  },
  cardTitle: {
    fontFamily: 'Avenir Light', fontSize: 10, fontWeight: '300',
    marginLeft: convertWidth(15),
  },
  cardContentRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    minHeight: 43, width: '100%',
    paddingLeft: convertWidth(15), paddingRight: convertWidth(15),
    backgroundColor: 'white',
  },
  itemDescription: {
    fontSize: 14, fontWeight: '300', fontFamily: 'Avenir', marginTop: 6, color: 'rgba(0,0,0,0.6)',
  },
  accountNumber: {
    fontFamily: 'Andale Mono', fontSize: 12, color: '#FF003C',
  },
  copyIcon: {
    width: 12, height: 20, resizeMode: 'contain',
  },
  emailAddress: {
    flex: 1,
    fontFamily: 'Andale Mono', fontSize: 12, color: '#FF003C',
  },
  shareIcon: {
    width: 19, height: 22, resizeMode: 'contain'
  },

  cardContentRowButtonText: {
    fontFamily: 'Avenir Black', fontSize: 18, fontWeight: '900', color: 'rgba(0,0,0,0.87)'
  },

  normalRow: {
    minHeight: 43, width: '100%',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingLeft: convertWidth(15), paddingRight: convertWidth(15),
  },
  rowLabel: {
    fontFamily: 'Avenir Light', fontSize: 10, fontWeight: '300', color: 'rgba(0,0,0,0.87)',
    flex: 1,
  },

  rowValue: {
    fontFamily: 'Avenir Black', fontSize: 10, fontWeight: '900', color: 'rgba(0,0,0,0.87)'
  },

});

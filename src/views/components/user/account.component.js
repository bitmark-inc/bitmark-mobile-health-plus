import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  Linking,
  Alert,
  Share,
  Image, View, SafeAreaView, ScrollView, Text, TouchableOpacity,
} from 'react-native';
import Mailer from 'react-native-mail';
import { AppProcessor, EventEmitterService, DataProcessor } from 'src/processors';
import { config, } from 'src/configs';
import { convertWidth } from 'src/utils';
import { ShadowTopComponent, ShadowComponent } from 'src/views/commons';
import { Actions } from 'react-native-router-flux';
import Intercom from 'react-native-intercom';
import { Provider, connect } from 'react-redux';
import { AccountStore } from 'src/views/stores';
import { CacheData } from "src/processors/caches";

const PAGE_STATE = {
  SETTINGS: '0',
  PRIVATE_HEALTH_ASSISTANT: '1',
  SECURITY: '2',
  ABOUT: '3',
};

class PrivateAccountComponent extends Component {
  static propTypes = {
    userInformation: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {
      accountNumberCopyText: i18n.t('AccountComponent_accountNumberCopyText'),
      pageState: PAGE_STATE.SETTINGS
    };

    this.changePageState = this.changePageState.bind(this);
  }

  changePageState(pageState) {
    this.setState({ pageState });
  }

  doLogout() {
    AppProcessor.doLogout().then((result) => {
      if (result) {
        EventEmitterService.emit(EventEmitterService.events.APP_NEED_REFRESH, { indicator: true });
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


  changeAccountSetting(userSettings) {
    AppProcessor.doSaveUserSetting(userSettings).catch(error => {
      console.log({ error });
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
    });
  }

  render() {
    let emailAddress = config.network === config.NETWORKS.livenet
      ? `${this.props.userInformation.bitmarkAccountNumber}@health.bitmark.com`
      : `${this.props.userInformation.bitmarkAccountNumber}@drop.test.bitmark.com`;

    let emrInformation = CacheData.userInformation.currentEMRData;

    return (
      <SafeAreaView style={styles.bodySafeView}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerLeft} onPress={() => { this.state.pageState === PAGE_STATE.SETTINGS ? Actions.pop() : this.changePageState(PAGE_STATE.SETTINGS) }}>
            <Image style={styles.headerLeftBackIcon} source={require('assets/imgs2/back_icon_black.png')} />
          </TouchableOpacity>
          {this.state.pageState === PAGE_STATE.SETTINGS &&
            <Text style={styles.headerTitle}>Vault</Text>
          }
          <View style={styles.headerRight} />
        </View>

        {/*SETTINGS*/}
        <ScrollView contentContainerStyle={styles.body}>
          {this.state.pageState === PAGE_STATE.SETTINGS &&
            <View>
              {/*EMR*/}
              {/*<EMRCardComponent />*/}
              <View style={[styles.userInfoContainer]}>
                <Image style={styles.profileIcon} source={(emrInformation && emrInformation.avatar) ? {
                  uri: emrInformation.avatar
                } : require('assets/imgs/profile-icon.png')} />
                <View style={[styles.userInfoArea]}>
                  {emrInformation && emrInformation.name &&
                    <Text style={[styles.username]}>{emrInformation.name}</Text>
                  }
                </View>
              </View>

              {/*VAULT SETTINGS*/}
              <ShadowComponent style={styles.cardBody}>
                <ShadowTopComponent contentStyle={styles.cardHeader}>
                  <Text style={styles.cardTitle}>VAULT SETTINGS</Text>
                </ShadowTopComponent>
                {/*Emergency Medical Record*/}
                <TouchableOpacity style={styles.cardContentRow} onPress={() => Actions.emrInformation({ emrInformation: CacheData.userInformation.currentEMRData })}>
                  <Text style={styles.cardContentRowButtonText}>Emergency Medical Record</Text>
                  <Image style={styles.copyIcon} source={require('assets/imgs2/arrow_left_icon_black.png')} />
                </TouchableOpacity>
                {/*Private Health Assistant*/}
                <TouchableOpacity style={[styles.cardContentRow, { borderBottomLeftRadius: 4, borderBottomRightRadius: 4, }]} onPress={() => this.changePageState(PAGE_STATE.PRIVATE_HEALTH_ASSISTANT)}>
                  <Text style={styles.cardContentRowButtonText}>Private Health Assistant</Text>
                  <Image style={styles.copyIcon} source={require('assets/imgs2/arrow_left_icon_black.png')} />
                </TouchableOpacity>
                {/*Security*/}
                <TouchableOpacity style={[styles.cardContentRow, { borderBottomLeftRadius: 4, borderBottomRightRadius: 4, }]} onPress={() => this.changePageState(PAGE_STATE.SECURITY)}>
                  <Text style={styles.cardContentRowButtonText}>Security</Text>
                  <Image style={styles.copyIcon} source={require('assets/imgs2/arrow_left_icon_black.png')} />
                </TouchableOpacity>
                {/*About*/}
                <TouchableOpacity style={[styles.cardContentRow, { borderBottomLeftRadius: 4, borderBottomRightRadius: 4, }]} onPress={() => this.changePageState(PAGE_STATE.ABOUT)}>
                  <Text style={styles.cardContentRowButtonText}>About</Text>
                  <Image style={styles.copyIcon} source={require('assets/imgs2/arrow_left_icon_black.png')} />
                </TouchableOpacity>
              </ShadowComponent>
            </View>
          }

          {/*PRIVATE_HEALTH_ASSISTANT*/}
          {this.state.pageState === PAGE_STATE.PRIVATE_HEALTH_ASSISTANT &&
            <ShadowComponent style={styles.cardBody}>
              <ShadowTopComponent contentStyle={styles.cardHeader}>
                <Text style={styles.cardTitle}>PRIVATE HEALTH ASSISTANT</Text>
              </ShadowTopComponent>
              <Text style={[styles.cardDescription, { paddingRight: convertWidth(68) }]}>A private health assistant to help you unlock the value of your health data.</Text>

              {/* <TouchableOpacity style={[styles.cardContentRow, { minHeight: 25, marginTop: 13, }]} onPress={() => this.changeAccountSetting.bind(this)({ suggest_health_studies: !this.props.userInformation.metadata.suggest_health_studies })}> */}
              <TouchableOpacity style={[styles.cardContentRow, { minHeight: 25, marginTop: 13, }]} disabled={true}>
                <Text style={styles.cardContentRowButtonText}>Suggest health studies</Text>
                {/* {this.props.userInformation.metadata.suggest_health_studies && <View style={{ borderWidth: 1, borderRadius: 10, width: 20, height: 20, backgroundColor: 'black', alignItems: 'center', justifyContent: 'center', }} >
                < Image style={[styles.copyIcon, { width: 19, height: 22, }]} source={require('assets/imgs2/check_box_icon_white_black.png')} />
              </View>} */}
                {/* {!this.props.userInformation.metadata.suggest_health_studies && <View style={{ borderWidth: 1, borderRadius: 10, width: 20, height: 20 }} />} */}
              </TouchableOpacity>
              <Text style={[styles.rowDescription, { fontSize: 14, paddingRight: convertWidth(49), }]}>Confidentially match you with health studies based on information you provide in your Emergency Medical Record.</Text>

              {/* <TouchableOpacity style={[styles.cardContentRow, { minHeight: 25, marginTop: 13, }]} onPress={() => this.changeAccountSetting.bind(this)({ visualize_health_data: !this.props.userInformation.metadata.visualize_health_data })}> */}
              <TouchableOpacity style={[styles.cardContentRow, { minHeight: 25, marginTop: 13, }]} disabled={true}>
                <Text style={styles.cardContentRowButtonText}>Visualize your health data</Text>
                {/* {this.props.userInformation.metadata.visualize_health_data && <View style={{ borderWidth: 1, borderRadius: 10, width: 20, height: 20, backgroundColor: 'black', alignItems: 'center', justifyContent: 'center', }} >
                < Image style={[styles.copyIcon, { width: 19, height: 22, }]} source={require('assets/imgs2/check_box_icon_white_black.png')} />
              </View>} */}
                {/* {!this.props.userInformation.metadata.visualize_health_data && <View style={{ borderWidth: 1, borderRadius: 10, width: 20, height: 20 }} />} */}
              </TouchableOpacity>
              <Text style={[styles.rowDescription, { fontSize: 14, paddingRight: convertWidth(49), }]}>Confidentially generate visual reports of health data collected from your iPhone.</Text>

              {/* <TouchableOpacity style={[styles.cardContentRow, { minHeight: 25, marginTop: 13, }]} onPress={() => this.changeAccountSetting.bind(this)({ receive_email_records: !this.props.userInformation.metadata.receive_email_records })}> */}
              <TouchableOpacity style={[styles.cardContentRow, { minHeight: 25, marginTop: 13, }]} disabled={true}>
                <Text style={styles.cardContentRowButtonText}>Add records via email</Text>
                {/* {this.props.userInformation.metadata.receive_email_records && <View style={{ borderWidth: 1, borderRadius: 10, width: 20, height: 20, backgroundColor: 'black', alignItems: 'center', justifyContent: 'center', }} >
                < Image style={[styles.copyIcon, { width: 19, height: 22, }]} source={require('assets/imgs2/check_box_icon_white_black.png')} />
              </View>} */}
                {/* {!this.props.userInformation.metadata.receive_email_records && <View style={{ borderWidth: 1, borderRadius: 10, width: 20, height: 20 }} />} */}
              </TouchableOpacity>
              <Text style={[styles.rowDescription, {
                fontSize: 14, paddingRight: convertWidth(49),
                marginBottom: this.props.userInformation.metadata.receive_email_records ? 5 : 15,
              }]}>Automatically add records sent to the following email address to your vault:</Text>

              {this.props.userInformation.metadata.receive_email_records &&
                <TouchableOpacity onPress={() => Share.share({ title: '', message: emailAddress })} style={[styles.cardContentRow, {
                  borderBottomLeftRadius: 4, borderBottomRightRadius: 4,
                  marginBottom: 10,
                }]}>
                  <Text style={[styles.emailAddress, { paddingRight: convertWidth(25), }]}>{emailAddress}</Text>
                  <Image style={styles.shareIcon} source={require('assets/imgs2/share_icon.png')} />
                </TouchableOpacity>
              }

            </ShadowComponent>
          }

          {/*SECURITY*/}
          {this.state.pageState === PAGE_STATE.SECURITY &&
            <ShadowComponent style={styles.cardBody}>
              <ShadowTopComponent contentStyle={styles.cardHeader}>
                <Text style={styles.cardTitle}>SECURITY</Text>
              </ShadowTopComponent>
              <TouchableOpacity style={styles.cardContentRow}
                onPress={() => Actions.accountPhrase()}
              >
                <Text style={styles.cardContentRowButtonText}>View your vault key phrase</Text>
                <Image style={styles.copyIcon} source={require('assets/imgs2/arrow_left_icon_black.png')} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.cardContentRow, { borderBottomLeftRadius: 4, borderBottomRightRadius: 4, }]} onPress={() => Actions.accountPhrase({ isLogout: true })}>
                {/* <TouchableOpacity style={[styles.cardContentRow, { borderBottomLeftRadius: 4, borderBottomRightRadius: 4, }]} onPress={this.doLogout.bind(this)}> */}
                <Text style={styles.cardContentRowButtonText}>Lock your vault</Text>
                <Image style={styles.copyIcon} source={require('assets/imgs2/arrow_left_icon_black.png')} />
              </TouchableOpacity>
            </ShadowComponent>
          }

          {/*ABOUT*/}
          {this.state.pageState === PAGE_STATE.ABOUT &&
            <View>
              {/*ABOUT*/}
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
                }]} onPress={() => Linking.openURL('https://bitmark.com/legal/terms')}>
                  <Text style={styles.cardContentRowButtonText}>Legal</Text>
                  <Image style={styles.copyIcon} source={require('assets/imgs2/arrow_left_icon_black.png')} />
                </TouchableOpacity>
              </ShadowComponent>

              {/*LANGUAGE*/}
              <ShadowComponent style={styles.cardBody}>
                <ShadowTopComponent contentStyle={styles.cardHeader}>
                  <Text style={styles.cardTitle}>LANGUAGE</Text>
                </ShadowTopComponent>
                <TouchableOpacity style={styles.cardContentRow} disabled={true}>
                  <Text style={styles.cardContentRowButtonText}>English</Text>
                </TouchableOpacity>
              </ShadowComponent>

              <View style={[styles.normalRow, { marginTop: 16 }]}>
                <Text style={styles.rowLabel}>VERSION</Text>
                <Text style={styles.rowValue}>{DataProcessor.getApplicationVersion() + (config.network === config.NETWORKS.testnet ? (`(${DataProcessor.getApplicationBuildNumber()})`) : '')}</Text>
              </View>

              <TouchableOpacity style={styles.normalRow} onPress={() => DataProcessor.doDisplayedWhatNewInformation()}>
                <Text style={styles.rowLabel}>WHAT’S NEW</Text>
                <Image style={styles.copyIcon} source={require('assets/imgs2/arrow_left_icon_black.png')} />
              </TouchableOpacity>
            </View>
          }

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
    paddingTop: convertWidth(10),
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
    fontFamily: 'AvenirNextW1G-Bold', fontSize: 20, textAlign: 'center',
    flex: 1
  },
  headerRight: {
    paddingRight: convertWidth(19),
    width: convertWidth(35),
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    height: 78,
    marginBottom: 18,
  },
  profileIcon: {
    width: 76, height: 76, resizeMode: 'cover',
    borderWidth: 0.1, borderRadius: 38,
    borderColor: 'white',
    marginRight: convertWidth(15),
    shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.2, shadowColor: '#000000', shadowRadius: 5,
  },
  userInfoArea: {
    height: '100%',
    alignItems: 'flex-start',
    justifyContent: 'flex-start'
  },
  username: {
    fontFamily: 'AvenirNextW1G-Bold', fontSize: 14,
    letterSpacing: 0.15,
    color: 'rgba(0, 0, 0, 0.6)',
    marginTop: 10,
  },
  cardBody: {
    flexDirection: 'column',
    marginTop: 16,
  },
  cardHeader: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start',
    height: 40,
  },
  cardTitle: {
    fontFamily: 'AvenirNextW1G-Light', fontSize: 10,
    letterSpacing: 1.5,
    marginLeft: convertWidth(15),
  },
  cardDescription: {
    fontSize: 14, fontFamily: 'AvenirNextW1G-Regular', color: 'rgba(0,0,0,0.6)',
    marginTop: 6,
    paddingLeft: convertWidth(15), paddingRight: convertWidth(15),
  },
  cardContentRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    minHeight: 43, width: '100%',
    paddingLeft: convertWidth(15), paddingRight: convertWidth(15),
    backgroundColor: 'white',
  },
  rowDescription: {
    fontSize: 10, fontFamily: 'AvenirNextW1G-light', color: 'rgba(0,0,0,0.6)',
    letterSpacing: 0.25,
    marginTop: 8,
    paddingLeft: convertWidth(15), paddingRight: convertWidth(15),
  },
  copyIcon: {
    width: 12, height: 20, resizeMode: 'contain',
  },
  emailAddress: {
    flex: 1,
    fontFamily: 'Andale Mono', fontSize: 12, color: '#FF003C',
    paddingRight: 4,
  },
  shareIcon: {
    width: 19, height: 22, resizeMode: 'contain'
  },

  cardContentRowButtonText: {
    fontFamily: 'AvenirNextW1G-Bold', fontSize: 18, color: 'rgba(0,0,0,0.87)'
  },

  normalRow: {
    minHeight: 43, width: '100%',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingLeft: convertWidth(15), paddingRight: convertWidth(15),
  },
  rowLabel: {
    fontFamily: 'AvenirNextW1G-Light', fontSize: 10, color: 'rgba(0,0,0,0.87)',
    letterSpacing: 1.5,
    flex: 1,
  },

  rowValue: {
    fontFamily: 'AvenirNextW1G-Bold', fontSize: 10, color: 'rgba(0,0,0,0.87)',
    letterSpacing: 1.5,
  },

});


const StoreAccountComponent = connect(
  (state, ) => state.data
)(PrivateAccountComponent);

export class AccountComponent extends Component {
  static propTypes = {
    displayFromUserScreen: PropTypes.bool,
    onPress: PropTypes.func
  }

  render() {
    return (
      <Provider store={AccountStore}>
        <StoreAccountComponent displayFromUserScreen={this.props.displayFromUserScreen} onPress={this.props.onPress} />
      </Provider>
    );
  }
}
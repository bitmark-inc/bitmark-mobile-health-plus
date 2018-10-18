import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Provider, connect } from 'react-redux';
import Permissions from 'react-native-permissions';
import {
  StyleSheet,
  Linking,
  Alert,
  Share,
  Clipboard,
  Image, View, TouchableOpacity, Text, SafeAreaView, ScrollView, FlatList,
} from 'react-native';
import Intercom from 'react-native-intercom';

import Mailer from 'react-native-mail';

import { convertWidth } from './../../utils';
import { config } from './../../configs';
import { Actions } from 'react-native-router-flux';
import { constants } from '../../constants';
import { EventEmitterService } from '../../services';
import {
  DataProcessor,
  AppProcessor
} from '../../processors';
import { DataAccountAccessesStore } from '../../stores';
export class PrivateAccountComponent extends Component {
  static propTypes = {
    accesses: PropTypes.shape({
      granted_to: PropTypes.array,
      granted_from: PropTypes.array,
    })
  };
  constructor(props) {
    super(props);
    this.state = {
      accountNumberCopyText: '',
    };
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
      body: 'Health+ version: ' + DataProcessor.getApplicationVersion() + ' (' + DataProcessor.getApplicationBuildNumber() + ')',
    }, (error) => {
      if (error) {
        Alert.alert(i18n.t('AccountComponent_alertTitle3'), i18n.t('AccountComponent_alertMessage3'));
      }
    });
  }

  scanQRCode() {
    let displayAlert = () => {
      Alert.alert(i18n.t('OtherAccountsComponent_alertTitle2'), i18n.t('OtherAccountsComponent_alertMessage2'), [{
        text: i18n.t('OtherAccountsComponent_alertButton21'),
        onPress: () => Linking.openURL('app-settings:')
      }, {
        text: i18n.t('OtherAccountsComponent_alertButton22'), style: 'cancel',
      }]);
    }
    Permissions.check('camera').then(permission => {
      if (permission === 'denied') {
        displayAlert();
      } else if (permission === 'undetermined') {
        Permissions.request('camera').then(permission => {
          if (permission === 'denied') {
            displayAlert();
          } else if (permission === 'authorized') {
            Actions.scanAccessQRCode();
          }
        });
      } else if (permission === 'authorized') {
        Actions.scanAccessQRCode();
      }
    });
  }

  selectAccount(accountNumber) {
    AppProcessor.doSelectAccountAccess(accountNumber).then(result => {
      if (result === true) {
        Actions.reset('user');
      } else if (result === false) {
        Alert.alert('', i18n.t('OtherAccountsComponent_alertMessage1'), [{
          text: 'OK', style: 'cancel',
        }]);
      }
    }).catch(error => {
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
    });
  }

  render() {
    return (
      <SafeAreaView style={styles.bodySafeView}>
        <View style={styles.body}>
          <View style={styles.bodyContent}>
            <View style={[styles.accountNumberTitleRow,]}>
              <Text style={styles.accountNumberTitle} >{i18n.t('AccountComponent_accountNumberTitle')}</Text>
              <TouchableOpacity onPress={Actions.pop}>
                <Image style={styles.closeIcon} source={require('../../../assets/imgs/close_icon_red.png')} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View style={styles.accountNumberArea}>
                <Text style={styles.accountNumberLabel}>{i18n.t('AccountComponent_accountNumberLabel')}</Text>
                <TouchableOpacity onPress={() => {
                  Clipboard.setString(DataProcessor.getUserInformation().bitmarkAccountNumber);
                  this.setState({ accountNumberCopyText: i18n.t('AccountComponent_accountNumberCopiedText') });
                  setTimeout(() => { this.setState({ accountNumberCopyText: '' }) }, 1000);
                }}>
                  <Text style={styles.accountNumberValue}>{DataProcessor.getUserInformation().bitmarkAccountNumber}</Text>
                </TouchableOpacity>
                <View style={styles.accountNumberValueBar}></View>
                <View style={[styles.accountNumberCopiedArea, this.state.accountNumberCopyText ? {} : { backgroundColor: 'white' }]}>
                  <Text style={styles.accountNumberCopiedText}>{this.state.accountNumberCopyText}</Text>
                </View>

                <Text style={styles.accountNumberDescription}>{i18n.t('AccountComponent_accountNumberDescription')}</Text>
              </View>

              <View style={styles.accessArea}>
                <Text style={styles.accessTitle}>{i18n.t('AccountComponent_accessTitle')}</Text>
                <Text style={styles.accessDescription}>
                  {this.props.accesses['granted_to'] && this.props.accesses['granted_to'].length > 0 ? i18n.t('AccountComponent_accessDescription1') : i18n.t('AccountComponent_accessDescription2')}
                </Text>
                {this.props.accesses['granted_to'] && this.props.accesses['granted_to'].length > 0 && <FlatList
                  style={{ marginTop: 12 }}
                  keyExtractor={(item, index) => index}
                  scrollEnabled={false}
                  data={this.props.accesses['granted_to']}
                  extraData={this.props}
                  renderItem={({ item }) => {
                    return (<View style={styles.accessAccountRow} >
                      <Text style={styles.accessAccountNumber}>
                        {'[' + item.grantee.substring(0, 4) + '...' + item.grantee.substring(item.grantee.length - 4, item.grantee.length) + ']'}
                      </Text>
                      <TouchableOpacity onPress={() => Actions.revokeAccess({ accessInfo: item })}>
                        <Text style={styles.accessRevokeButtonText}>{i18n.t('AccountComponent_accessRevokeButtonText')}</Text>
                      </TouchableOpacity>
                    </View>);
                  }}
                />}

                <TouchableOpacity style={styles.addGrandAccessButton} onPress={Actions.grantingAccess}>
                  <Text style={styles.addGrandAccessButtonText}>+ {i18n.t('AccountComponent_addGrandAccessButtonText').toUpperCase()}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.accessOtherAccountArea}>
                <Text style={styles.accessOtherAccountTitle}>{i18n.t('AccountComponent_accessOtherAccountTitle')}</Text>
                <Text style={styles.accessOtherAccountDescription}>
                  {this.props.accesses['granted_from'] && this.props.accesses['granted_from'].length > 0 ? i18n.t('AccountComponent_accessOtherAccountDescription1') : i18n.t('AccountComponent_accessOtherAccountDescription2')}
                </Text>
                {this.props.accesses['granted_from'] && this.props.accesses['granted_from'].length > 0 && <FlatList
                  style={{ marginTop: 12 }}
                  keyExtractor={(item, index) => index}
                  scrollEnabled={false}
                  data={this.props.accesses['granted_from']}
                  extraData={this.props}
                  renderItem={({ item }) => {
                    return (<TouchableOpacity style={styles.accessOtherAccountAccountRow} onPress={() => this.selectAccount.bind(this)(item.grantor)} >
                      <Text style={styles.accessOtherAccountAccountNumber}>
                        {'[' + item.grantor.substring(0, 4) + '...' + item.grantor.substring(item.grantor.length - 4, item.grantor.length) + ']'}
                      </Text>
                      <Image style={styles.rowButtonIcon} source={require('../../../assets/imgs/arrow_left_icon_red.png')} />
                    </TouchableOpacity>);
                  }}
                />}

                <TouchableOpacity style={styles.addOtherAccountButton} onPress={this.scanQRCode.bind(this)}>
                  <Text style={styles.addOtherAccountButtonText}>+ {i18n.t('AccountComponent_addOtherAccountButtonText').toUpperCase()}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.securityArea}>
                <Text style={styles.securityTitle} >{i18n.t('AccountComponent_securityTitle')}</Text>
                <TouchableOpacity style={[styles.rowButton, { marginTop: 25 }]} onPress={() => Actions.accountPhrase()}>
                  <Text style={styles.rowButtonText}>{i18n.t('AccountComponent_rowButtonText3')}</Text>
                  <Image style={styles.rowButtonIcon} source={require('../../../assets/imgs/arrow_left_icon_red.png')} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.rowButton} onPress={() => Actions.accountPhrase({ isLogout: true })}>
                  {/* <TouchableOpacity style={styles.rowButton} onPress={() => {
                  AppProcessor.doLogout().then((result) => {
                    if (result) {
                      EventEmitterService.emit(EventEmitterService.events.APP_NEED_REFRESH);
                    }
                  }).catch(error => {
                    EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error })
                  })
                }}> */}
                  <Text style={styles.rowButtonText}>{i18n.t('AccountComponent_rowButtonText4')}</Text>
                  <Image style={styles.rowButtonIcon} source={require('../../../assets/imgs/arrow_left_icon_red.png')} />
                </TouchableOpacity>
              </View>
              <View style={styles.aboutArea}>
                <Text style={styles.aboutTitle}>{i18n.t('AccountComponent_aboutTitle')}</Text>

                <TouchableOpacity style={[styles.rowButton, { marginTop: 25 }]} onPress={() => {
                  Intercom.displayMessageComposer();
                }}>
                  <Text style={styles.rowButtonText}>{i18n.t('AccountComponent_rowButtonText1')}</Text>
                  <Image style={styles.rowButtonIcon} source={require('../../../assets/imgs/arrow_left_icon_red.png')} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.rowButton} onPress={Actions.support}>
                  <Text style={styles.rowButtonText}>{i18n.t('AccountComponent_rowButtonText2')}</Text>
                  <Image style={styles.rowButtonIcon} source={require('../../../assets/imgs/arrow_left_icon_red.png')} />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.rowButton]} onPress={this.rateApp.bind(this)}>
                  <Text style={styles.rowButtonText}>{i18n.t('AccountComponent_rowButtonText5')}</Text>
                  <Image style={styles.rowButtonIcon} source={require('../../../assets/imgs/arrow_left_icon_red.png')} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.rowButton} onPress={() => Share.share({ title: 'Bitmark', message: '', url: config.appLink })}>
                  <Text style={styles.rowButtonText}>{i18n.t('AccountComponent_rowButtonText6')}</Text>
                  <Image style={styles.rowButtonIcon} source={require('../../../assets/imgs/arrow_left_icon_red.png')} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.rowButton, { marginTop: 53 }]} disabled={true}>
                  <Text style={styles.rowButtonText}>{i18n.t('AccountComponent_rowButtonText7')}</Text>
                  <Text style={styles.rowButtonText}>{DataProcessor.getApplicationVersion()} ({DataProcessor.getApplicationBuildNumber() + (config.network !== config.NETWORKS.livenet ? '-' + config.network : '')})</Text>
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
    paddingTop: convertWidth(15),
    paddingBottom: 45,
  },
  accountNumberTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: convertWidth(20),
    paddingTop: convertWidth(15),
  },
  accountNumberTitle: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 36,
  },
  closeIcon: {
    width: convertWidth(20),
    height: convertWidth(20),
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
    paddingBottom: 45,
  },
  securityTitle: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 34,
  },


  accessArea: {
    borderTopWidth: 1,
    borderColor: '#FF4444',
    padding: convertWidth(20),
    paddingBottom: 20,
  },
  accessTitle: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 34,
  },
  accessDescription: {
    fontFamily: 'Avenir Book',
    fontWeight: '300',
    fontSize: 16,
    marginTop: 10,
  },
  accessAccountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  accessAccountNumber: {
    fontFamily: 'Andale Mono',
    fontSize: 14,
    color: '#0060F2',
  },
  accessRevokeButtonText: {
    fontFamily: 'Andale Mono',
    fontSize: 14,
    color: '#FF003C',
  },
  addGrandAccessButton: {
    marginTop: 29,
    width: '100%',
    height: 37,
    backgroundColor: '#FF4444',

    justifyContent: 'center',
  },
  addGrandAccessButtonText: {
    fontFamily: 'Avenir Heavy',
    fontWeight: '900',
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
  accessOtherAccountArea: {
    borderTopWidth: 1,
    borderColor: '#FF4444',
    padding: convertWidth(20),
    paddingBottom: 20,
  },
  accessOtherAccountTitle: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 34,
  },
  accessOtherAccountDescription: {
    fontFamily: 'Avenir Book',
    fontWeight: '300',
    fontSize: 16,
    marginTop: 10,
  },
  accessOtherAccountAccountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  accessOtherAccountAccountNumber: {
    fontFamily: 'Andale Mono',
    fontSize: 14,
    color: '#0060F2',
  },
  addOtherAccountButton: {
    marginTop: 29,
    width: '100%',
    height: 37,
    backgroundColor: '#FF4444',

    justifyContent: 'center',
  },
  addOtherAccountButtonText: {
    fontFamily: 'Avenir Heavy',
    fontWeight: '900',
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },

  aboutArea: {
    borderTopWidth: 1,
    borderColor: '#FF4444',
    padding: convertWidth(20),
    paddingBottom: 20,
  },
  aboutTitle: {
    fontFamily: 'Avenir Black',
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
    fontFamily: 'Avenir Medium',
    fontWeight: '400',
    fontSize: 16,
    color: 'black'
  }

});


const StoreAccountComponent = connect(
  (state) => state.data,
)(PrivateAccountComponent);

export class AccountComponent extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <View style={{ flex: 1 }}>
        <Provider store={DataAccountAccessesStore}>
          <StoreAccountComponent />
        </Provider>
      </View>
    );
  }
}

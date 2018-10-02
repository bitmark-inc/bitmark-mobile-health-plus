import React, { Component } from 'react';
import { Provider, connect } from 'react-redux';
import PropTypes from 'prop-types';
import Permissions from 'react-native-permissions';
import {
  StyleSheet,
  Alert,
  Linking,
  Image, View, TouchableOpacity, Text, SafeAreaView, FlatList,
} from 'react-native';

import { convertWidth } from './../../utils';
import { config } from './../../configs';
import { Actions } from 'react-native-router-flux';
import { constants } from '../../constants';
import { AppProcessor } from '../../processors';
import { EventEmitterService } from '../../services';
import { DataAccountAccessesStore } from '../../stores';


class PrivateOtherUserComponent extends Component {
  static propTypes = {
    accesses: PropTypes.shape({
      granted_from: PropTypes.array,
    })
  };
  constructor(props) {
    super(props);
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

  render() {
    return (
      <SafeAreaView style={styles.bodySafeView}>
        <View style={styles.body}>
          <View style={styles.bodyContent} >
            <View style={styles.titleRow}>
              <Text style={styles.title}>{i18n.t('OtherAccountsComponent_title')}</Text>
              <TouchableOpacity onPress={Actions.pop} >
                <Image style={styles.closeIcon} source={require('./../../../assets/imgs/close_icon_red.png')} />
              </TouchableOpacity>
            </View>
            <View style={styles.content}>
              {this.props.accesses.granted_from && this.props.accesses.granted_from.length > 0 && <FlatList
                keyExtractor={(item, index) => index + ''}
                data={this.props.accesses.granted_from}
                extraData={this.props}
                renderItem={({ item }) => {
                  return (<TouchableOpacity style={styles.accountRow} onPress={() => this.selectAccount.bind(this)(item.grantor)}>
                    <Text style={styles.accountNumber}>
                      {'[' + item.grantor.substring(0, 4) + '...' + item.grantor.substring(item.grantor.length - 5, item.grantor.length) + ']'}
                    </Text>
                    <Image style={styles.accountRowIcon} source={require('./../../../assets/imgs/arrow_left_icon_red.png')} />
                  </TouchableOpacity>);
                }}
              />}
              {(!this.props.accesses.granted_from || this.props.accesses.granted_from.length === 0) && <View style={{ flex: 1, paddingTop: 50, }}>
                <Text style={{ fontFamily: 'Avenir Heavy', fontWeight: '800', fontSize: 16 }}>
                  {i18n.t('OtherAccountsComponent_message1')}
                </Text>
                <Text style={{ fontFamily: 'Avenir Heavy', fontWeight: '300', fontSize: 16, marginTop: 20, }}>
                  {i18n.t('OtherAccountsComponent_message2')}
                </Text>
              </View>}
            </View>
            <View style={styles.bottomButtonArea} >
              <TouchableOpacity style={styles.bottomButton} onPress={this.scanQRCode.bind(this)} >
                <Text style={styles.bottomButtonText}>{i18n.t('OtherAccountsComponent_bottomButtonText').toUpperCase()}</Text>
              </TouchableOpacity>
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
    width: "100%",
  },
  content: {
    padding: convertWidth(20),
    paddingTop: convertWidth(15),
    flexDirection: 'column',
    flex: 1,
  },
  title: {
    flex: 1,
    fontFamily: 'Avenir Light',
    fontWeight: '900',
    fontSize: 36,
    color: 'black',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: convertWidth(20),
    paddingTop: convertWidth(15),
    paddingBottom: 0,
  },
  closeIcon: {
    marginTop: 12,
    width: convertWidth(23),
    height: convertWidth(23),
    resizeMode: 'contain',
  },

  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  accountNumber: {
    fontFamily: 'Avenir Book',
    fontSize: 16,
    fontWeight: '300',
    color: '#0060F2',
  },
  accountRowIcon: {
    width: convertWidth(8),
    height: 14 * convertWidth(8) / 8,
    resizeMode: 'contain',
  },

  bottomButtonArea: {
    paddingLeft: convertWidth(20),
    paddingRight: convertWidth(20),
    paddingBottom: convertWidth(20),
  },
  bottomButton: {
    backgroundColor: '#FF4444',
    height: constants.buttonHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomButtonText: {
    fontFamily: 'Avenir Light',
    fontWeight: '600',
    fontSize: 16,
    color: 'white'
  }


});


const StoreOtherUserComponent = connect(
  (state) => state.data,
)(PrivateOtherUserComponent);

export class OtherAccountsComponent extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <View style={{ flex: 1 }}>
        <Provider store={DataAccountAccessesStore}>
          <StoreOtherUserComponent />
        </Provider>
      </View>
    );
  }
}
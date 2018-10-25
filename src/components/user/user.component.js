import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,

  Image, View, TouchableOpacity, Text, SafeAreaView,
} from 'react-native';

import { Provider, connect } from 'react-redux';

import { convertWidth } from './../../utils';
import { config } from '../../configs';
import { constants } from '../../constants';
import { DataProcessor, AppProcessor } from './../../processors';
import { Actions } from 'react-native-router-flux';
import { EventEmitterService } from '../../services';
import { UserBitmarksStore } from '../../stores';

class PrivateUserComponent extends Component {
  static propTypes = {
    healthDataBitmarks: PropTypes.array,
    healthAssetBitmarks: PropTypes.array,
  };
  constructor(props) {
    super(props);
  }


  backToUserAccount() {
    AppProcessor.doSelectAccountAccess(DataProcessor.getUserInformation().bitmarkAccountNumber).then(result => {
      if (result) {
        Actions.reset('user');
      }
    }).catch(error => {
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
    });
  }

  render() {
    let accountNumberDisplay = DataProcessor.getAccountAccessSelected() || DataProcessor.getUserInformation().bitmarkAccountNumber;
    let isCurrentUser = accountNumberDisplay === DataProcessor.getUserInformation().bitmarkAccountNumber;
    return (
      <View style={{ flex: 1, }}>
        {!isCurrentUser && <TouchableOpacity style={styles.accountNumberDisplayArea} onPress={this.backToUserAccount.bind(this)}>
          <Text style={styles.accountNumberDisplayText}>
            {i18n.t('UserComponent_accountNumberDisplayText', { accountNumber: '[' + accountNumberDisplay.substring(0, 4) + '...' + accountNumberDisplay.substring(accountNumberDisplay.length - 4, accountNumberDisplay.length) + ']' })}
          </Text>
        </TouchableOpacity>}
        <SafeAreaView style={[styles.bodySafeView,]}>
          <View style={styles.body}>
            <View style={[styles.bodyContent, isCurrentUser ? {} : { borderBottomWidth: 1 }]} >
              <View style={styles.dataArea}>
                <TouchableOpacity style={{ flex: 1 }} onPress={() => {

                  if (isCurrentUser && !DataProcessor.getUserInformation().activeHealthData) {
                    Actions.getStart();
                  } else {
                    Actions.bitmarkList({ bitmarkType: 'bitmark_health_data' });
                  }
                }}>
                  <Text style={styles.dataTitle}><Text style={{ color: '#FF1829' }}>{this.props.healthDataBitmarks.length} </Text>
                    {i18n.t('UserComponent_dataTitle1', { s: this.props.healthDataBitmarks.length !== 1 ? 's' : '' })}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.dataArea, { borderTopColor: '#FF1829', borderTopWidth: 1, paddingBottom: convertWidth(60), }]}>
                <TouchableOpacity style={{ flex: 1 }} disabled={this.props.healthAssetBitmarks.length === 0} onPress={() => {
                  Actions.bitmarkList({ bitmarkType: 'bitmark_health_issuance' })
                }}>
                  <Text style={styles.dataTitle}><Text style={{ color: '#FF1829' }}>{this.props.healthAssetBitmarks.length} </Text>
                    {i18n.t('UserComponent_dataTitle2', { s: this.props.healthAssetBitmarks.length !== 1 ? 's' : '' })}
                  </Text>
                </TouchableOpacity>
                {isCurrentUser && <TouchableOpacity style={styles.addHealthRecordButton} onPress={Actions.addRecord}>
                  <Image style={styles.addHealthRecordButtonIcon} source={require('./../../../assets/imgs/plus_icon_red.png')} />
                  <Text style={styles.addHealthRecordButtonText} > {i18n.t('UserComponent_addHealthRecordButtonText').toUpperCase()}</Text>
                </TouchableOpacity>}
              </View>
            </View>
            {isCurrentUser && <View style={[styles.accountArea]}>
              <TouchableOpacity style={styles.accountButton} onPress={Actions.account}>
                <Text style={styles.accountButtonText}>
                  {i18n.t('UserComponent_accountButtonText1')}
                </Text>
              </TouchableOpacity>
            </View>}
          </View>
        </SafeAreaView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  accountNumberDisplayArea: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: convertWidth(32) + (config.isIPhoneX ? constants.iPhoneXStatusBarHeight : 0),
    paddingTop: (config.isIPhoneX ? constants.iPhoneXStatusBarHeight : 0),
    backgroundColor: '#E6FF00',
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountNumberDisplayText: {
    fontFamily: 'Avenir Heavy',
    fontWeight: '800',
    fontSize: 14,
  },
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
    borderBottomWidth: 0,
    borderColor: '#FF4444',
    width: "100%"
  },

  dataArea: {
    flex: 1,
    width: '100%',
    padding: convertWidth(20),
  },
  dataTitle: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 36,
  },
  addHealthRecordButton: {
    position: 'absolute',
    left: convertWidth(16),
    bottom: convertWidth(15),
    padding: convertWidth(4),
    flexDirection: 'row',
    alignItems: 'center',
  },
  addHealthRecordButtonIcon: {
    width: 12,
    height: 12,
    resizeMode: 'contain',
  },
  addHealthRecordButtonText: {
    marginLeft: convertWidth(6),
    fontFamily: 'Avenir Medium',
    fontWeight: '300',
    fontSize: 16,
  },
  accountArea: {
    width: '100%', height: 45,
    borderColor: '#FF1829', borderTopWidth: 1, borderWidth: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
  },
  accountButtonText: {
    fontFamily: 'Avenir Medium',
    fontWeight: '300',
    fontSize: 16,
    color: '#FF1F1F'
  },
});

const StoreUserComponent = connect(
  (state) => state.data,
)(PrivateUserComponent);

export class UserComponent extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <View style={{ flex: 1 }}>
        <Provider store={UserBitmarksStore}>
          <StoreUserComponent />
        </Provider>
      </View>
    );
  }
}
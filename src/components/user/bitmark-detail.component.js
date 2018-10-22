import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from "moment";
import {
  StyleSheet,
  Alert,
  Image, View, SafeAreaView, TouchableOpacity, Text, ScrollView,
} from 'react-native';

import { convertWidth, runPromiseWithoutError, } from './../../utils';
import { config } from '../../configs';
import { constants } from '../../constants';
import { EventEmitterService } from '../../services';
import { AppProcessor, DataProcessor } from '../../processors';
import { Actions } from 'react-native-router-flux';

export class BitmarkDetailComponent extends Component {
  static propTypes = {
    bitmarkType: PropTypes.string,
    bitmark: PropTypes.any,
  };
  constructor(props) {
    super(props);
    this.state = {
      filePath: '',
      content: '',
    }

    if (this.props.bitmark) {
      let accountDisplayed = DataProcessor.getAccountAccessSelected() || DataProcessor.getUserInformation().bitmarkAccountNumber;
      if (this.props.bitmarkType === 'bitmark_health_data') {
        let id = this.props.bitmark.id;
        if (accountDisplayed !== DataProcessor.getUserInformation().bitmarkAccountNumber) {
          let grantedInfo = DataProcessor.getGrantedAccessAccountSelected();
          id = grantedInfo.ids[this.props.bitmark.asset_id];
        }
        runPromiseWithoutError(AppProcessor.doDownloadHealthDataBitmark(id, {
          indicator: true, title: i18n.t('BitmarkDetailComponent_title')
        })).then(result => {
          console.log('result :', result);
          if (result && result.error) {
            EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error: result.error, onClose: Actions.pop });
            // Alert.alert('This record can not be accessed.', 'Once you delete your account, you wll not able to access the record again.', [{
            //   text: 'OK', onPress: Actions.pop
            // }]);
            return;
          }
          this.setState({ content: JSON.stringify(JSON.parse(result), null, 2) });
        });
      } else if (this.props.bitmarkType === 'bitmark_health_issuance') {
        let id = this.props.bitmark.id;
        if (accountDisplayed !== DataProcessor.getUserInformation().bitmarkAccountNumber) {
          let grantedInfo = DataProcessor.getGrantedAccessAccountSelected();
          id = grantedInfo.ids[this.props.bitmark.asset_id];
        }
        runPromiseWithoutError(AppProcessor.doDownloadBitmark(id, {
          indicator: true, title: i18n.t('BitmarkDetailComponent_title')
        })).then(result => {
          console.log('result :', result);
          if (result && result.error) {
            EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error: result.error, onClose: Actions.pop });
            // Alert.alert('This record can not be accessed.', 'Once you delete your account, you wll not able to access the record again.', [{
            //   text: 'OK', onPress: Actions.pop
            // }]);
            return;
          }
          this.setState({ filePath: result });
        });
      } else {
        Actions.pop();
      }
    } else {
      Alert.alert(i18n.t('BitmarkDetailComponent_alertTitle1'), i18n.t('BitmarkDetailComponent_alertMessage1'), [{
        text: 'OK', onPress: Actions.pop
      }]);
    }
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
    console.log('this.state :', this.state, this.props)
    return (
      <View style={{ flex: 1, }}>
        {!isCurrentUser && <TouchableOpacity style={styles.accountNumberDisplayArea} onPress={this.backToUserAccount.bind(this)}>
          <Text style={styles.accountNumberDisplayText}>
            {i18n.t('BitmarkDetailComponent_accountNumberDisplayText', { accountNumber: accountNumberDisplay.substring(0, 4) + '...' + accountNumberDisplay.substring(accountNumberDisplay.length - 4, accountNumberDisplay.length) })}
          </Text>
        </TouchableOpacity>}
        <SafeAreaView style={[styles.bodySafeView]}>
          <View style={styles.body}>
            <View style={styles.bodyContent}>
              <View style={styles.titleRow}>
                {this.props.bitmarkType === 'bitmark_health_data' && <Text style={[styles.titleText]}>{moment(this.props.bitmark.asset.created_at).format('YYYY MMM DD').toUpperCase()}</Text>}
                {this.props.bitmarkType === 'bitmark_health_issuance' && <Text style={styles.titleText}>{moment(this.props.bitmark.asset.created_at).format('YYYY MMM DD').toUpperCase()}</Text>}
                <TouchableOpacity style={styles.closeButton} onPress={Actions.pop}>
                  <Image style={styles.closeIcon} source={require('./../../../assets/imgs/back_icon_red.png')} />
                </TouchableOpacity>
              </View>
              <View style={styles.content}>
                <ScrollView style={styles.contentScroll} contentContainerStyle={{ flex: 1, }}>
                  <Text style={styles.metadataTitle}>{i18n.t('BitmarkDetailComponent_metadataTitle1')}</Text>
                  <Text style={styles.metadataMessage}>{i18n.t('BitmarkDetailComponent_metadataMessage')}</Text>
                  <View style={styles.metadataRow}>
                    <Text style={styles.metadataLabel}>{i18n.t('BitmarkDetailComponent_metadataLabel1').toUpperCase()}</Text>
                    <Text style={styles.metadataValue}>{moment(this.props.bitmark.asset.metadata['Saved Time']).format('YYYY MMM DD hh:mm:ss').toUpperCase()}</Text>
                  </View>
                  <View style={styles.metadataRow}>
                    <Text style={styles.metadataLabel}>{i18n.t('BitmarkDetailComponent_metadataLabel2').toUpperCase()}</Text>
                    <Text style={styles.metadataValue}>{this.props.bitmark.asset.metadata['Source'].toUpperCase()}</Text>
                  </View>
                  <Text style={styles.metadataTitle}>{i18n.t('BitmarkDetailComponent_metadataTitle2')}</Text>
                  {this.props.bitmarkType === 'bitmark_health_issuance' && !!this.state.filePath &&
                    <TouchableOpacity style={styles.bitmarkImageArea} onPress={() => Actions.fullViewCaptureAsset({ filePath: this.state.filePath, bitmark: this.props.bitmark })}>
                      <Image style={styles.bitmarkImage} source={{ uri: this.state.filePath }} /></TouchableOpacity>}
                  {this.props.bitmarkType === 'bitmark_health_data' && <ScrollView style={styles.bitmarkContent} contentContainerStyle={{ flexGrow: 1, paddingBottom: 30, }}>
                    <Text >{this.state.content}</Text>
                  </ScrollView>}
                </ScrollView>
              </View>
            </View>
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
    borderColor: "#FF4444",
    width: "100%",
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: convertWidth(20),
    paddingTop: 0,
    paddingRight: 0,
  },
  titleText: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 36,
  },
  closeButton: {
    paddingTop: convertWidth(26),
    paddingBottom: convertWidth(26),
    paddingRight: convertWidth(24),
    paddingLeft: convertWidth(50),
  },
  closeIcon: {
    width: convertWidth(21),
    height: convertWidth(21),
    resizeMode: 'contain',
  },

  content: {
    flex: 1,
    padding: convertWidth(26),
    paddingTop: convertWidth(15),
  },
  contentScroll: {
    flexDirection: 'column',
  },
  metadataTitle: {
    fontFamily: 'Avenir Medium',
    fontWeight: '700',
    fontSize: 16,
    marginTop: 21,
  },
  metadataMessage: {
    fontFamily: 'Avenir Medium',
    fontWeight: '300',
    fontSize: 14,
    color: '#999999',
    marginTop: 4,
    marginBottom: 24,
  },

  metadataRow: {
    flexDirection: 'row',
  },
  metadataLabel: {
    fontFamily: 'Avenir Medium',
    fontWeight: '300',
    fontSize: 14,
    color: '#999999'
  },
  metadataValue: {
    fontFamily: 'Avenir Medium',
    fontWeight: '300',
    fontSize: 14,
    color: '#999999'
  },

  bitmarkImageArea: {
    flex: 1,
  },
  bitmarkImage: {
    height: '100%',
    resizeMode: 'contain',
  },
  bitmarkContent: {
    padding: convertWidth(20),
    flex: 1,
  },

});
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from "moment";
import {
  StyleSheet,
  Alert,
  Image, View, SafeAreaView, TouchableOpacity, Text, ScrollView,
} from 'react-native';
import JSONTree from 'react-native-json-tree';
import { Map } from 'immutable'

import { convertWidth, runPromiseWithoutError, FileUtil, } from './../../utils';
import { config } from '../../configs';
import { constants } from '../../constants';
import { EventEmitterService } from '../../services';
import { AppProcessor, DataProcessor } from '../../processors';
import { Actions } from 'react-native-router-flux';
import { getThumbnail, isPdfFile } from "../../utils";

export class BitmarkDetailComponent extends Component {
  static propTypes = {
    bitmarkType: PropTypes.string,
    bitmark: PropTypes.any,
  };
  constructor(props) {
    super(props);
    this.state = {
      filePath: this.props.bitmarkType === 'bitmark_health_issuance' ? this.props.bitmark.asset.filePath : '',
      thumbnail: isPdfFile(this.props.bitmark.asset.filePath) ? getThumbnail(this.props.bitmark.id, true) : '',
      content: '',
    };

    if (this.props.bitmark) {
      if (this.props.bitmarkType === 'bitmark_health_data') {
        runPromiseWithoutError(FileUtil.readFile(this.props.bitmark.asset.filePath)).then(result => {
          if (result && result.error) {
            console.log('error:', result.error);
            EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error: result.error, onClose: Actions.pop });
            return;
          }
          result.immutable = Map({ key: 'value' });
          this.setState({ content: JSON.parse(result) });
        });
      } else if (this.props.bitmarkType !== 'bitmark_health_issuance') {
        Actions.pop();
      }

      // let accountDisplayed = DataProcessor.getAccountAccessSelected() || DataProcessor.getUserInformation().bitmarkAccountNumber;
      // if (this.props.bitmarkType === 'bitmark_health_data') {
      //   let id = this.props.bitmark.id;
      //   if (accountDisplayed !== DataProcessor.getUserInformation().bitmarkAccountNumber) {
      //     let grantedInfo = DataProcessor.getGrantedAccessAccountSelected();
      //     id = grantedInfo.ids[this.props.bitmark.asset_id];
      //   }
      //   runPromiseWithoutError(AppProcessor.doDownloadHealthDataBitmark(id, this.props.bitmark.asset_id, {
      //     indicator: true, title: i18n.t('BitmarkDetailComponent_title')
      //   })).then(result => {
      //     console.log('result :', result);
      //     if (result && result.error) {
      //       EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error: result.error, onClose: Actions.pop });
      //       // Alert.alert('This record can not be accessed.', 'Once you delete your account, you wll not able to access the record again.', [{
      //       //   text: 'OK', onPress: Actions.pop
      //       // }]);
      //       return;
      //     }
      //     this.setState({ content: JSON.stringify(JSON.parse(result), null, 2) });
      //   });
      // } else if (this.props.bitmarkType === 'bitmark_health_issuance') {
      //   let id = this.props.bitmark.id;
      //   if (accountDisplayed !== DataProcessor.getUserInformation().bitmarkAccountNumber) {
      //     let grantedInfo = DataProcessor.getGrantedAccessAccountSelected();
      //     id = grantedInfo.ids[this.props.bitmark.asset_id];
      //   }
      //   runPromiseWithoutError(AppProcessor.doDownloadBitmark(id, this.props.bitmark.asset_id, {
      //     indicator: true, title: i18n.t('BitmarkDetailComponent_title')
      //   })).then(result => {
      //     console.log('result :', result);
      //     if (result && result.error) {
      //       EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error: result.error, onClose: Actions.pop });
      //       // Alert.alert('This record can not be accessed.', 'Once you delete your account, you wll not able to access the record again.', [{
      //       //   text: 'OK', onPress: Actions.pop
      //       // }]);
      //       return;
      //     }
      //     this.setState({ filePath: result });
      //   });
      // } else {
      //   Actions.pop();
      // }
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
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        {!isCurrentUser && <TouchableOpacity style={styles.accountNumberDisplayArea} onPress={this.backToUserAccount.bind(this)}>
          <Text style={styles.accountNumberDisplayText}>
            {i18n.t('BitmarkDetailComponent_accountNumberDisplayText', { accountNumber: accountNumberDisplay.substring(0, 4) + '...' + accountNumberDisplay.substring(accountNumberDisplay.length - 4, accountNumberDisplay.length) })}
          </Text>
        </TouchableOpacity>}
        <SafeAreaView style={[styles.bodySafeView]}>
          <View style={styles.body}>
            <View style={styles.bodyContent}>
              <View style={styles.titleRow}>
                <Text style={styles.titleText}>{this.props.bitmark.asset.name}</Text>
                <TouchableOpacity style={styles.closeButton} onPress={Actions.pop}>
                  <Image style={styles.closeIcon} source={require('./../../../assets/imgs/back_icon_red.png')} />
                </TouchableOpacity>
              </View>
              <View style={[styles.content, this.props.bitmarkType === 'bitmark_health_issuance' ? { padding: 0, } : {}]}>
                <ScrollView style={styles.contentScroll} contentContainerStyle={{ flex: 1, }}>
                  {this.props.bitmarkType === 'bitmark_health_data' && <Text style={styles.metadataTitle}>{i18n.t('BitmarkDetailComponent_metadataTitle2')}</Text>}
                  {this.props.bitmarkType === 'bitmark_health_issuance' && !!this.state.filePath &&
                    <TouchableOpacity style={styles.bitmarkImageArea} onPress={() => Actions.fullViewCaptureAsset({
                      filePath: this.state.filePath,
                      title: moment(this.props.bitmark.asset.created_at).format('YYYY MMM DD').toUpperCase()
                    })}>
                      <Image style={styles.bitmarkImage} source={{ uri: this.state.thumbnail ? this.state.thumbnail : this.state.filePath }} /></TouchableOpacity>}
                  {this.props.bitmarkType === 'bitmark_health_data' && <ScrollView style={styles.bitmarkContent} contentContainerStyle={{ flexGrow: 1, }}>
                    <ScrollView horizontal={true}>
                      <JSONTree data={this.state.content}
                        getItemString={() => <Text></Text>}
                        labelRenderer={raw => <Text style={{ color: 'black', fontWeight: '500', }}>{raw}</Text>}
                        valueRenderer={raw => <Text style={{ color: '#FF4444' }}>{raw}</Text>}
                        hideRoot={true}
                        theme={{
                          scheme: 'monokai',
                          author: 'wimer hazenberg (http://www.monokai.nl)',
                          base00: '#272822',
                          base01: '#383830',
                          base02: '#49483e',
                          base03: '#75715e',
                          base04: '#a59f85',
                          base05: '#f8f8f2',
                          base06: '#f5f4f1',
                          base07: '#f9f8f5',
                          base08: '#f92672',
                          base09: '#fd971f',
                          base0A: '#f4bf75',
                          base0B: '#a6e22e',
                          base0C: '#a1efe4',
                          base0D: '#FF003C',
                          base0E: '#ae81ff',
                          base0F: '#cc6633'
                        }}
                      />
                    </ScrollView>
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
    fontFamily: config.localization.startsWith('vi') ? null : 'Avenir Heavy',
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
    justifyContent: 'space-between',
    padding: convertWidth(20),
    paddingBottom: 0,
    paddingTop: 0,
    paddingRight: 0,
  },
  titleText: {
    fontFamily: config.localization.startsWith('vi') ? null : 'Avenir Black',
    fontWeight: '900',
    flex: 1,
    fontSize: 24,
    marginTop: 18,
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
    paddingTop: convertWidth(0),
  },
  contentScroll: {
    flexDirection: 'column',
  },
  metadataTitle: {
    fontFamily: config.localization.startsWith('vi') ? null : 'Avenir Medium',
    fontWeight: '600',
    fontSize: 16,
    marginTop: 5,
  },

  bitmarkImageArea: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  bitmarkImage: {
    height: '100%',
    width: '100%',
    resizeMode: 'contain',
  },
  bitmarkContent: {
    paddingTop: convertWidth(20),
    flex: 1,
  },

});
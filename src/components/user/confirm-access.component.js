import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View, SafeAreaView, TouchableOpacity, Text,
} from 'react-native';

import { convertWidth } from './../../utils';
import { config } from '../../configs';
import { constants } from '../../constants';
import { Actions } from 'react-native-router-flux';
import { DataProcessor, AppProcessor } from '../../processors';
import { EventEmitterService } from '../../services';

export class ConfirmAccessComponent extends Component {
  static propTypes = {
    token: PropTypes.string,
    grantee: PropTypes.string,
  };
  constructor(props) {
    super(props);
    this.state = {
      token: this.props.token,
      grantee: this.props.grantee,
      step: 'confirming',
    };
  }

  cancelRequest() {
    AppProcessor.doCancelGrantingAccess(this.state.token).then((result) => {
      if (result) {
        Actions.pop();
      }
    }).catch(error => {
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
    });
  }
  checkDone() {
    DataProcessor.doGetAccountAccesses('waiting').then(list => {
      if (list && list.length > 0) {
        this.setState({ token: list[0].id, grantee: list[0].grantee, step: 'confirming' });
      } else {
        Actions.pop();
      }
    });
  }
  confirmRequest() {
    AppProcessor.doConfirmGrantingAccess(this.state.token, this.state.grantee, {
      indicator: true, title: i18n.t('ConfirmAccessComponent_title'), message: ''
    }).then((result) => {
      if (result) {
        this.setState({ step: 'success' });
      }
    }).catch(error => {
      console.log('doConfirmGrantingAccess  error :', error);
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
    });
  }

  render() {
    let grantee = this.state.grantee || DataProcessor.getUserInformation().bitmarkAccountNumber;
    return (
      <SafeAreaView style={styles.bodySafeView}>
        <View style={styles.body}>
          {this.state.step === 'confirming' && <View style={styles.bodyContent}>
            <View style={styles.titleRow}>
              <Text style={styles.titleText}>{i18n.t('ConfirmAccessComponent_titleText1')}</Text>
            </View>
            <View style={styles.content}>
              <Text style={styles.message}>
                {i18n.t('ConfirmAccessComponent_message1', { accountNumber: '[' + grantee.substring(0, 4) + '...' + grantee.substring(grantee.length - 5, grantee.length) + ']' })}
              </Text>
            </View>

            <View style={styles.bottomButtonArea}>
              <TouchableOpacity style={styles.bottomButton} onPress={this.cancelRequest.bind(this)}>
                <Text style={[styles.bottomButtonText, { fontWeight: '300' }]}>{i18n.t('ConfirmAccessComponent_bottomButtonText1').toUpperCase()}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.bottomButton, { backgroundColor: 'white' }]} onPress={this.confirmRequest.bind(this)}>
                <Text style={[styles.bottomButtonText, { color: '#FF4444' }]}>{i18n.t('ConfirmAccessComponent_bottomButtonText2').toUpperCase()}</Text>
              </TouchableOpacity>
            </View>
          </View>}

          {this.state.step === 'success' && <View style={styles.bodyContent}>
            <View style={styles.titleRow}>
              <Text style={styles.titleText}>{i18n.t('ConfirmAccessComponent_titleText2')}</Text>
            </View>
            <View style={styles.content}>
              <Text style={styles.message}>
                {i18n.t('ConfirmAccessComponent_message2', { accountNumber: '[' + grantee.substring(0, 4) + '...' + grantee.substring(grantee.length - 5, grantee.length) + ']' })}
              </Text>
            </View>
            <View style={styles.bottomButtonArea}>
              <TouchableOpacity style={[styles.bottomButton, { width: '100%', backgroundColor: 'white' }]} onPress={this.checkDone.bind(this)}>
                <Text style={[styles.bottomButtonText, { fontWeight: '900', color: "#FF4444" }]}>{i18n.t('ConfirmAccessComponent_bottomButtonText3').toUpperCase()}</Text>
              </TouchableOpacity>
            </View>
          </View>}
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  bodySafeView: {
    flex: 1,
  },
  body: {
    padding: convertWidth(16),
    paddingTop: convertWidth(16) + (config.isIPhoneX ? constants.iPhoneXStatusBarHeight : 0),
    flex: 1,
  },
  bodyContent: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#FF4444',
    width: "100%"
  },


  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: convertWidth(20),
    paddingTop: convertWidth(15),
  },
  titleText: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Avenir Black',
    fontWeight: '900',
    fontSize: 36,
    color: 'white',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 29,
    padding: convertWidth(20),
    paddingTop: convertWidth(15),
  },
  message: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Avenir Light',
    fontWeight: '300',
    fontSize: 12,
    color: 'white',
  },

  bottomButtonArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: convertWidth(20),
  },

  bottomButton: {
    borderWidth: 1,
    borderColor: 'white',
    height: constants.buttonHeight,
    alignItems: 'center',
    justifyContent: 'center',
    width: convertWidth(145),

  },
  bottomButtonText: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Avenir Light',
    fontWeight: '900',
    fontSize: 16,
    color: 'white'
  }

});
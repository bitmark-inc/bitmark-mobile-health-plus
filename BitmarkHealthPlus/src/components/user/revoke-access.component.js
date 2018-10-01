import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View, TouchableOpacity, Text, SafeAreaView,
} from 'react-native';

import { convertWidth } from './../../utils';
import { config } from './../../configs';
import { Actions } from 'react-native-router-flux';
import { constants } from '../../constants';
import { DataProcessor, AppProcessor } from '../../processors';
import { EventEmitterService } from '../../services';

export class RevokeAccessComponent extends Component {
  static propTypes = {
    accessInfo: PropTypes.any,
  };
  constructor(props) {
    super(props);
    this.state = {
      accessAccounts: [],
    }
  }

  revokeAccess() {
    AppProcessor.doRemoveGrantingAccess(this.props.accessInfo.grantee).then(result => {
      if (result) {
        Actions.pop();
      }
    }).catch(error => {
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
    });
  }

  render() {
    return (
      <SafeAreaView style={styles.bodySafeView}>
        <View style={styles.body}>
          <View style={styles.bodyContent} >
            <View style={styles.titleRow}>
              <Text style={styles.title}>{i18n.t('RevokeAccessComponent_title')}</Text>
            </View>
            <View style={styles.content}>
              <Text style={styles.message}>
                {i18n.t('RevokeAccessComponent_message', { accountNumber: '[' + this.props.accessInfo.grantee.substring(0, 4) + '...' + this.props.accessInfo.grantee.substring(this.props.accessInfo.grantee.length - 4, DataProcessor.getUserInformation().bitmarkAccountNumber.length) + ']' })}
              </Text>
            </View>
            <View style={styles.bottomButtonArea}>
              <TouchableOpacity style={[styles.bottomButton, { borderWidth: 1, borderColor: 'white' }]} onPress={Actions.pop}>
                <Text style={styles.bottomButtonText}>{i18n.t('RevokeAccessComponent_bottomButtonText1').toUpperCase()}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.bottomButton, { backgroundColor: 'white', borderWidth: 1, borderColor: '#FF4444' }]} onPress={this.revokeAccess.bind(this)}>
                <Text style={[styles.bottomButtonText, { color: '#FF4444' }]}>{i18n.t('RevokeAccessComponent_bottomButtonText2').toUpperCase()}</Text>
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
    backgroundColor: '#FF4444',
    width: "100%",
  },
  content: {
    padding: convertWidth(20),
    paddingTop: convertWidth(15),
    flexDirection: 'column',
    flex: 1,
  },
  message: {
    fontFamily: 'Avenir Medium',
    fontWeight: '400',
    fontSize: 16,
    color: 'white',
    marginTop: 50,
  },
  title: {
    flex: 1,
    fontFamily: 'Avenir Light',
    fontWeight: '900',
    fontSize: 34,
    color: 'white',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: convertWidth(20),
    paddingTop: convertWidth(15),
    paddingBottom: 0,
  },
  bottomButtonArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: convertWidth(20),
  },
  bottomButton: {
    backgroundColor: '#FF4444',
    height: constants.buttonHeight,
    alignItems: 'center',
    justifyContent: 'center',
    width: convertWidth(143),
  },
  bottomButtonText: {
    fontFamily: 'Avenir Light',
    fontWeight: '600',
    fontSize: 16,
    color: 'white'
  }


});

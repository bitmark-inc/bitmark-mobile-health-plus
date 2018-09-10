import React from 'react';
import PropTypes from 'prop-types';
import {
  Text, View, TouchableOpacity, SafeAreaView,
  StyleSheet,
} from 'react-native';
import { constants } from '../../constants';
import { config } from '../../configs';
import { convertWidth } from '../../utils';
import { Actions } from 'react-native-router-flux';
import { AppProcessor } from '../../processors';
import { EventEmitterService } from '../../services';

export class DeletingAccountComponent extends React.Component {
  static propTypes = {
    tryConnectInternet: PropTypes.func,
  }
  deleteAccount() {
    AppProcessor.doDeleteAccount({
      indicator: true, title: 'Encrypting and protecting your health data...', message: ''
    }).then((result) => {
      if (result) {
        EventEmitterService.emit(EventEmitterService.events.APP_NEED_REFRESH);
      }
    }).catch(error => {
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
    })
  }

  render() {
    return (
      <View style={styles.body} activeOpacity={1}>
        <SafeAreaView style={styles.safeAreaView}>
          <View style={styles.content}>
            <View style={{ flex: 1, }}>
              <Text style={[styles.titleText,]}>Delete your account</Text>
              <Text style={[styles.description,]}>To protect your privacy, you are identified in the Bitmark system by a pseudonymous account number. This number is public. You can safely share it with others without compromising your security.</Text>
            </View>
            <View style={styles.buttonArea}>
              <TouchableOpacity style={[styles.okButton, { borderWidth: 1, borderColor: 'white', backgroundColor: '#FF4444', marginRight: convertWidth(10) }]} onPress={Actions.pop}>
                <Text style={[styles.okButtonText, { color: 'white' }]}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.okButton} onPress={this.deleteAccount.bind(this)}>
                <Text style={styles.okButtonText}>CONFIRM</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }
}

const styles = StyleSheet.create({

  body: {
    flex: 1,
    position: 'absolute',
    top: 0,
    width: '100%',
    height: '100%',
    zIndex: constants.zIndex.internetOff,
    backgroundColor: 'white',
    padding: convertWidth(16),
    paddingTop: 16 + (config.isIPhoneX ? constants.iPhoneXStatusBarHeight : 0),
  },
  safeAreaView: {
    flex: 1,
  },
  content: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#FF4444',
    padding: convertWidth(20),
    paddingTop: convertWidth(15),

  },
  titleText: {
    fontFamily: 'Avenir black',
    fontSize: 36,
    fontWeight: '900',
    color: 'white',
  },
  description: {
    fontFamily: 'Avenir black',
    fontSize: 16,
    color: 'white',
    marginTop: 70,
  },
  buttonArea: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  okButton: {
    backgroundColor: 'white',
    minWidth: convertWidth(145),
    height: constants.buttonHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  okButtonText: {
    fontFamily: 'Avenir black',
    fontSize: 16,
    fontWeight: '900',
    color: '#FF4444',
    textAlign: 'center',
  }
});

import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, Image, TouchableOpacity, SafeAreaView,
  StyleSheet,
} from 'react-native'

import { EventEmitterService, NotificationService } from '../../services';
import { convertWidth } from '../../utils';
import { constants } from '../../constants';
import { config } from '../../configs';

export class NotificationComponent extends React.Component {
  static propTypes = {
    passPhrase24Words: PropTypes.arrayOf(PropTypes.string),
  };
  constructor(props) {
    super(props);
  }
  render() {

    let requestNotification = () => {
      NotificationService.doRequestNotificationPermissions().then(() => {
        EventEmitterService.emit(EventEmitterService.events.APP_NEED_REFRESH, true);
      }).catch(error => {
        console.log('NotificationComponent requestNotification error:', error);
      });
    }
    return (
      <SafeAreaView style={styles.safeAreaView}>
        <View style={[styles.body]}>
          <View style={styles.swipePageContent}>
            <Image style={[styles.notificationImage]} source={require('../../../assets/imgs/notification.png')} />
            <Text style={[styles.notificationTitle]}>NOTIFICATIONS</Text>
            <Text style={[styles.notificationDescription,]}>Receive notifications when actions require your authorization.</Text>
          </View>
        </View>
        <View style={styles.enableButtonArea}>
          <TouchableOpacity style={[styles.enableButton]} onPress={requestNotification}>
            <Text style={styles.enableButtonText}>ENABLE</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.enableButton, {
            backgroundColor: 'white',
          }]} onPress={() => {
            EventEmitterService.emit(EventEmitterService.events.APP_NEED_REFRESH, true);
          }}>
            <Text style={[styles.enableButtonText, { color: '#FF4444' }]}>LATER</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: 'white',
  },
  body: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
    paddingLeft: convertWidth(50),
    paddingRight: convertWidth(50),
    paddingTop: (config.isIPhoneX ? constants.iPhoneXStatusBarHeight : 0),
  },

  swipePageContent: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationTitle: {
    fontFamily: 'Avenir black',
    color: '#FF4444',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 25,
    textAlign: 'center',
  },

  notificationImage: {
    width: convertWidth(275),
    height: 215 * convertWidth(275) / 275,
    resizeMode: 'contain',
  },

  notificationDescription: {
    marginTop: 25,
    width: convertWidth(275),
    fontFamily: 'Avenir light',
    fontWeight: '300',
    fontSize: 16,
    textAlign: 'center',
  },

  enableButtonArea: {
    flexDirection: 'column',
    width: '100%',
    paddingLeft: convertWidth(20),
    paddingRight: convertWidth(20),
    paddingBottom: convertWidth(20),
  },
  enableButton: {
    height: constants.buttonHeight,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF4444',
  },
  enableButtonText: {
    fontFamily: 'Avenir black',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    color: 'white',
  },
});
import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, Image, TouchableOpacity, SafeAreaView,
  AppState,
  Linking,
  StyleSheet,
} from 'react-native'

import { AppProcessor } from '../../processors';
import { CommonModel } from '../../models';
import { convertWidth } from '../../utils';
import { constants } from '../../constants';
import { EventEmitterService } from '../../services';

export class TouchFaceIdComponent extends React.Component {
  static propTypes = {
    passPhrase24Words: PropTypes.arrayOf(PropTypes.string),
  };
  constructor(props) {
    super(props);
    console.log('TouchFaceIdComponent props :', props);
    this.handleAppStateChange = this.handleAppStateChange.bind(this);
    this.checkSupportFaceTouchId = this.checkSupportFaceTouchId.bind(this);
    this.doContinue = this.doContinue.bind(this);

    this.state = {
      supported: true,
      errorMessage: '',
    }
    this.appState = AppState.currentState;
  }

  componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  handleAppStateChange = (nextAppState) => {
    if (this.appState.match(/background/) && nextAppState === 'active') {
      this.checkSupportFaceTouchId();
    }
    this.appState = nextAppState;
  }

  checkSupportFaceTouchId() {
    CommonModel.doCheckPasscodeAndFaceTouchId().then((supported) => {
      this.setState({ supported });
    });
  }

  doContinue() {
    let passPhrase24Words = this.props.passPhrase24Words;
    let promise;
    if (passPhrase24Words) {
      promise = AppProcessor.doLogin(passPhrase24Words);
    } else {
      promise = AppProcessor.doCreateNewAccount();
    }
    promise.then((user) => {
      console.log('user :', user);
      if (user) {
        EventEmitterService.emit(EventEmitterService.events.APP_NEED_REFRESH, true)
      }
    }).catch(error => {
      console.log('error :', error);
      this.setState({ errorMessage: 'Can not create or access bitmark account!' })
    });
  }

  render() {
    return (
      <SafeAreaView style={styles.safeAreaView}>
        <View style={[styles.body]}>
          <View style={styles.swipePageContent}>
            <View style={styles.swipePageMainContent}>
              <View style={styles.remindImages}>
                <Image style={[styles.touchIdImage]} source={require('../../../assets/imgs/touch_id_icon.png')} />
                <Image style={[styles.faceIdImage]} source={require('../../../assets/imgs/face_id_icon.png')} />
              </View>
              <Text style={[styles.faceTouchIdTitle]}>TOUCH/FACE ID & PASSCODE</Text>
              <Text style={[styles.faceTouchIdDescription,]}>Touch/Face ID or a passcode is required to sign and encrypt your health data.</Text>
            </View>
          </View>

          <View style={styles.enableButtonArea}>
            <TouchableOpacity style={[styles.enableButton]}
              onPress={() => {
                if (!this.state.supported) {
                  Linking.openURL('app-settings:');
                } else {
                  this.doContinue();
                }
              }}>
              <Text style={styles.enableButtonText}>ENABLE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView >
    );
  }
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: '#FF4444',
  },
  body: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'white',
  },

  swipePageContent: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },

  swipePageMainContent: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // notification
  faceTouchIdTitle: {
    fontFamily: 'Avenir black',
    color: '#FF4444',
    fontSize: 17,
    fontWeight: '900',
    marginTop: 54,
    width: convertWidth(375),
    textAlign: 'center',
  },

  remindImages: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  touchIdImage: {
    width: 90,
    height: 90,
    resizeMode: 'contain',
  },
  faceIdImage: {
    marginLeft: 30,
    width: 90,
    height: 90,
    resizeMode: 'contain',
  },

  faceTouchIdDescription: {
    marginTop: 29,
    width: convertWidth(294),
    fontFamily: 'Avenir light',
    fontWeight: '300',
    fontSize: 16,
    lineHeight: 20,
    textAlign: 'center',
  },

  enableButtonArea: {
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  enableButton: {
    height: constants.buttonHeight,
    width: convertWidth(375),
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
    color: 'white'
  },
});
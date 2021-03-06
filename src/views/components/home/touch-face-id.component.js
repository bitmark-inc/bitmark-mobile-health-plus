import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, Image, TouchableOpacity, SafeAreaView,
  AppState,
  Linking,
  StyleSheet,
} from 'react-native'
import { CommonModel, AppProcessor, EventEmitterService } from 'src/processors';
import { convertWidth } from 'src/utils';
import { constants } from 'src/configs';

export class TouchFaceIdComponent extends React.Component {
  static propTypes = {
    phraseWords: PropTypes.arrayOf(PropTypes.string),
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

  doContinue(enableTouchFaceId) {
    let phraseWords = this.props.phraseWords;
    let promise;
    if (phraseWords) {
      promise = AppProcessor.doLogin(phraseWords, enableTouchFaceId);
    } else {
      promise = AppProcessor.doCreateNewAccount(enableTouchFaceId);
    }
    promise.then((user) => {
      if (user) {
        EventEmitterService.emit(EventEmitterService.events.APP_NEED_REFRESH, { justCreatedBitmarkAccount: !phraseWords, indicator: true });
      }
    }).catch(error => {
      console.log('TouchFaceIdComponent doContinue error :', error);
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
                <Image style={[styles.touchIdImage]} source={require('assets/imgs/touch_id_icon.png')} />
                <Image style={[styles.faceIdImage]} source={require('assets/imgs/face_id_icon.png')} />
              </View>
              <Text style={[styles.faceTouchIdTitle]}>{i18n.t('TouchFaceIdComponent_faceTouchIdTitle')}</Text>
              <Text style={[styles.faceTouchIdDescription,]}>{i18n.t('TouchFaceIdComponent_faceTouchIdDescription')}</Text>
            </View>
          </View>

          <View style={styles.enableButtonArea}>
            <TouchableOpacity style={[styles.enableButton]}
              onPress={() => {
                if (!this.state.supported) {
                  Linking.openURL('app-settings:');
                } else {
                  this.doContinue(true);
                }
              }}>
              <Text style={styles.enableButtonText}>{i18n.t('TouchFaceIdComponent_enableButtonText')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.skipButton]}
              onPress={() => this.doContinue(false)}>
              <Text style={styles.skipButtonText}>{i18n.t('TouchFaceIdComponent_skipButtonText')}</Text>
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
    backgroundColor: 'white',
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
    fontFamily: 'AvenirNextW1G-Bold',
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
    fontFamily: 'AvenirNextW1G-Light',
    fontWeight: '300',
    fontSize: 16,
    lineHeight: 20,
    textAlign: 'center',
  },

  enableButtonArea: {
    flexDirection: 'column',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingLeft: convertWidth(20),
    paddingRight: convertWidth(20),
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
    fontFamily: 'AvenirNextW1G-Bold',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    color: 'white'
  },
  skipButton: {
    height: constants.buttonHeight,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    fontFamily: 'AvenirNextW1G-Bold',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    color: '#FF4444'
  },
});
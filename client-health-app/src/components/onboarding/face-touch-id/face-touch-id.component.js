import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, Image,
  Linking,
  AppState,
  // NativeModules,
} from 'react-native'
import { CommonModel } from './../../../models';

import faceTouchIdStyle from './face-touch-id.component.style';
import { BitmarkComponent } from '../../../commons/components';
import { iosConstant } from '../../../configs/ios/ios.config';
import { AppProcessor } from '../../../processors';
import { BitmarkOneTabButtonComponent } from '../../../commons/components/bitmark-button';

export class FaceTouchIdComponent extends React.Component {
  constructor(props) {
    super(props);
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
    let passPhrase24Words = (this.props && this.props.navigation && this.props.navigation.state && this.props.navigation.state.params) ? this.props.navigation.state.params.passPhrase24Words : null;
    let promise;
    if (passPhrase24Words) {
      promise = AppProcessor.doLogin(passPhrase24Words);
    } else {
      promise = AppProcessor.doCreateNewAccount();
    }
    promise.then((user) => {
      if (user) {
        this.props.navigation.navigate('Notification');
      }
    }).catch(error => {
      console.log('error :', error);
      this.setState({ errorMessage: 'Can not create or access bitmark account!' })
    });
  }

  render() {
    return (
      <BitmarkComponent
        backgroundColor='white'
        contentInScroll={true}
        content={(<View style={[faceTouchIdStyle.body]}>
          <View style={faceTouchIdStyle.swipePageContent}>
            <View style={faceTouchIdStyle.swipePageMainContent}>
              <View style={faceTouchIdStyle.passcodeRemindImages}>
                <Image style={[faceTouchIdStyle.touchIdImage]} source={require('../../../../assets/imgs/touch-id.png')} />
                <Image style={[faceTouchIdStyle.faceIdImage]} source={require('../../../../assets/imgs/face-id.png')} />
              </View>
              <Text style={[faceTouchIdStyle.faceTouchIdTitle]}>TOUCH/FACE ID & PASSCODE</Text>
              <Text style={[faceTouchIdStyle.faceTouchIdDescription,]}>Touch/Face ID or a passcode is required to sign and encrypt your health data.</Text>
            </View>
          </View>
        </View>)}

        footerHeight={iosConstant.bottomBottomHeight}
        footer={(<View style={faceTouchIdStyle.enableButtonArea}>
          <BitmarkOneTabButtonComponent style={[faceTouchIdStyle.enableButton]}
            onPress={() => {
              if (!this.state.supported) {
                Linking.openURL('app-settings:');
              } else {
                this.doContinue();
              }
            }}>
            <Text style={faceTouchIdStyle.enableButtonText}>ENABLE</Text>
          </BitmarkOneTabButtonComponent>
        </View>)}
      />
    );
  }
}

FaceTouchIdComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.shape({
        passPhrase24Words: PropTypes.array,
      }),
    }),
  }),
  screenProps: PropTypes.shape({
    rootNavigation: PropTypes.shape({
      navigate: PropTypes.func,
      dispatch: PropTypes.func,
    })
  }),
}
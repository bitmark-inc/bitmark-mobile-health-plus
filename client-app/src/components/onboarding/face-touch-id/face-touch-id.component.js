import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, Image, TouchableOpacity,
  Linking,
  AppState,
  // NativeModules,
} from 'react-native'
import { CommonModel } from './../../../models';

import { AppScaleComponent } from './../../../commons/components';
import faceTouchIdStyle from './face-touch-id.component.style';

export class FaceTouchIdComponent extends React.Component {
  constructor(props) {
    super(props);
    console.log('props :', props);
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
    this.props.navigation.state.params.doContinue().then((user) => {
      console.log('doContinue success:');
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
      <AppScaleComponent ref={(r) => { this.appScaler = r; }}>
        <View style={[faceTouchIdStyle.body]}>
          <Text style={[faceTouchIdStyle.faceTouchIdTitle]}>
            TOUCH/FACE ID & PASSCODE
          </Text>
          <Text style={[faceTouchIdStyle.faceTouchIdDescription,]}>
            Touch/Face ID or a passcode is required to authorize your transactions.
          </Text>
          <View style={faceTouchIdStyle.passcodeRemindImages}>
            <Image style={[faceTouchIdStyle.touchIdImage]} source={require('../../../../assets/imgs/touch-id.png')} />
            <Image style={[faceTouchIdStyle.faceIdImage]} source={require('../../../../assets/imgs/face-id.png')} />
          </View>
          <View style={faceTouchIdStyle.enableButtonArea}>
            <TouchableOpacity style={[faceTouchIdStyle.enableButton]}
              onPress={() => {
                if (!this.state.supported) {
                  Linking.openURL('app-settings:');
                } else {
                  this.doContinue();
                }
              }}>
              <Text style={faceTouchIdStyle.enableButtonText}>ENABLE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </AppScaleComponent>
    );
  }
}

FaceTouchIdComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.shape({
        doContinue: PropTypes.func,
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
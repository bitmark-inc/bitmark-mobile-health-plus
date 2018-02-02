import React from 'react';
import PropTypes from 'prop-types';
import { NavigationActions } from 'react-navigation';
import {
  View, Text, Image, TouchableOpacity,
  Linking,
  // NativeModules,
} from 'react-native'
import { CommonService } from './../../../services/index';

import { AppScaleComponent } from './../../../commons/components';
import faceTouchIdStyle from './face-touch-id.component.style';

export class FaceTouchIdComponent extends React.Component {
  constructor(props) {
    super(props);
    console.log('FaceTouchIdComponent  props :', props);
  }
  render() {
    const resetMainPage = NavigationActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: 'Main', params: { justCreatedBitmarkAccount: true } })]
    });
    CommonService.checkFaceTouchId().then(() => {
      this.props.screenProps.rootNavigation.dispatch(resetMainPage);
    }).catch(error => {
      console.log('checkFaceTouchId erorr :', error);
    });
    return (
      <AppScaleComponent ref={(r) => { this.appScaler = r; }}>
        <View style={[faceTouchIdStyle.body]}>
          <Text style={[faceTouchIdStyle.faceTouchIdTitle]}>
            TOUCH/FACE ID & PASSCODE
        </Text>
          <View style={faceTouchIdStyle.passcodeRemindImages}>
            <Image style={[faceTouchIdStyle.touchIdImage]} source={require('../../../../assets/imgs/touch-id.png')} />
            <Image style={[faceTouchIdStyle.faceIdImage]} source={require('../../../../assets/imgs/face-id.png')} />
          </View>
          <Text style={[faceTouchIdStyle.faceTouchIdDescription,]}>
            Touch/Face ID or a passcode is required to authorize your transactions.
        </Text>
          <View style={faceTouchIdStyle.enableButtonArea}>
            <TouchableOpacity style={[faceTouchIdStyle.enableButton]}
              onPress={() => {
                Linking.openURL('app-settings:');
                this.props.screenProps.rootNavigation.dispatch(resetMainPage);
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
  }),
  screenProps: PropTypes.shape({
    rootNavigation: PropTypes.shape({
      navigate: PropTypes.func,
      dispatch: PropTypes.func,
    })
  }),
}
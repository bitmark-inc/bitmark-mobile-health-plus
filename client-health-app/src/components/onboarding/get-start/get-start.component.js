import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, Image, TouchableOpacity,
  StatusBar,
} from 'react-native'

import getStartStyles from './get-start.component.style';
import { iosConstant } from '../../../configs/ios/ios.config';
import { BitmarkComponent } from '../../../commons/components';

export class GetStartComponent extends React.Component {
  constructor(props) {
    super(props);
    let passPhrase24Words = (this.props && this.props.navigation && this.props.navigation.state && this.props.navigation.state.params) ? this.props.navigation.state.params.passPhrase24Words : null;
    this.state = { passPhrase24Words };
  }
  render() {

    let requestHealthKitPermission = () => {
      //TODO
      this.props.navigation.navigate('FaceTouchId', { passPhrase24Words: this.state.passPhrase24Words });
    }
    return (
      <BitmarkComponent
        backgroundColor='white'
        contentInScroll={true}
        content={(<View style={[getStartStyles.body]}>
          <StatusBar hidden={false} />
          <Text style={[getStartStyles.getStartTitle]}>GET STARTED NOW</Text>
          <Text style={[getStartStyles.getStartDescription,]}>
            To register ownership of your health data, you must allow Bitmark Health to access specific (or all) categories of data.
          </Text>
          <View style={getStartStyles.accessIconArea}>
            <Image style={getStartStyles.accessIcon} source={require('../../../../assets/imgs/icon_health.png')} />
            <Image style={getStartStyles.accessIconPlus} source={require('../../../../assets/imgs/+.png')} />
            <Image style={getStartStyles.accessIcon} source={require('../../../../assets/imgs/bitmark-logo.png')} />
          </View>
        </View>)}

        footerHeight={45 + iosConstant.blankFooter / 2}
        footer={(<View style={getStartStyles.enableButtonArea}>
          <TouchableOpacity style={[getStartStyles.enableButton]} onPress={requestHealthKitPermission}>
            <Text style={getStartStyles.enableButtonText}>ALLOW ACCESS</Text>
          </TouchableOpacity>
        </View>)}
      />
    );
  }
}

GetStartComponent.propTypes = {
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
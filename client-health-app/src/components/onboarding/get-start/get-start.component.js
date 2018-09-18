import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, Image,
  StatusBar,
} from 'react-native'

import getStartStyles from './get-start.component.style';
import { iosConstant } from '../../../configs/ios/ios.config';
import { BitmarkComponent } from '../../../commons/components';
import { AppProcessor } from '../../../processors';
import { EventEmitterService } from '../../../services';
import { BitmarkOneTabButtonComponent } from '../../../commons/components/bitmark-button';

export class GetStartComponent extends React.Component {
  constructor(props) {
    super(props);
    let passPhrase24Words = (this.props && this.props.navigation && this.props.navigation.state && this.props.navigation.state.params) ? this.props.navigation.state.params.passPhrase24Words : null;
    this.state = { passPhrase24Words };
  }
  render() {

    let requestHealthKitPermission = () => {
      AppProcessor.doRequireHealthKitPermission().then(() => {
        this.props.navigation.navigate('FaceTouchId', { passPhrase24Words: this.state.passPhrase24Words });
      }).catch(error => {
        EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
        console.log('doRequireHealthKitPermission error :', error);
      });
    }
    return (
      <BitmarkComponent
        backgroundColor='white'
        content={(<View style={[getStartStyles.body]}>
          <StatusBar hidden={false} />
          <View style={getStartStyles.swipePageContent}>
            <View style={getStartStyles.swipePageMainContent}>
              <View style={getStartStyles.accessIconArea}>
                <Image style={getStartStyles.accessIcon} source={require('../../../../assets/imgs/icon_health.png')} />
                <Image style={getStartStyles.accessIconPlus} source={require('../../../../assets/imgs/+.png')} />
                <Image style={getStartStyles.accessIcon} source={require('../../../../assets/imgs/bitmark-logo.png')} />
              </View>
              <Text style={[getStartStyles.getStartTitle]}>GET STARTED NOW</Text>
              <Text style={[getStartStyles.getStartDescription,]}>To register ownership of your health data, allow Bitmark Health to access specific (or all) categories of data.</Text>
            </View>
          </View>
        </View>)}

        footerHeight={iosConstant.bottomBottomHeight}
        footer={(<View style={getStartStyles.enableButtonArea}>
          <BitmarkOneTabButtonComponent style={[getStartStyles.enableButton]} onPress={requestHealthKitPermission}>
            <Text style={getStartStyles.enableButtonText}>ALLOW ACCESS</Text>
          </BitmarkOneTabButtonComponent>
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
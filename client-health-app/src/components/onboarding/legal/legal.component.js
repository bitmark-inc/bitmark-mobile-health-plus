import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, Image, TouchableOpacity,
  StatusBar,
} from 'react-native'

import defaultStyle from './../../../commons/styles';

import getStartStyles from './legal.component.style';
import { iosConstant } from '../../../configs/ios/ios.config';
import { BitmarkComponent } from '../../../commons/components';
import { AppProcessor } from '../../../processors';
import { EventEmitterService } from '../../../services';

export class LegalComponent extends React.Component {
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

        header={(<View style={defaultStyle.header}>
          <TouchableOpacity style={defaultStyle.headerLeft} onPress={() => this.props.navigation.goBack()}>
            <Image style={defaultStyle.headerLeftIcon} source={require('./../../../../assets/imgs/close-blue-icon.png')} />
          </TouchableOpacity>
          <View style={defaultStyle.headerCenter}>
            <Text style={defaultStyle.headerTitle}>BITMARK LEGAL</Text>
          </View>
          <TouchableOpacity style={defaultStyle.headerRight} />
        </View>)}

        contentInScroll={true}
        content={(<View style={[getStartStyles.body]}>
          <StatusBar hidden={false} />
          <View style={getStartStyles.swipePageContent}>
            <View style={getStartStyles.swipePageMainContent}>
              <View style={getStartStyles.accessIconArea}>
                <Image style={getStartStyles.accessIcon} source={require('../../../../assets/imgs/icon_health.png')} />
                <Image style={getStartStyles.accessIconPlus} source={require('../../../../assets/imgs/+.png')} />
                <Image style={getStartStyles.accessIcon} source={require('../../../../assets/imgs/bitmark-logo.png')} />
              </View>
              <Text style={[getStartStyles.getStartTitle]}>Bitmark LEGAL</Text>
              <Text style={[getStartStyles.getStartDescription,]}>To register ownership of your health data, allow Bitmark Health to access specific (or all) categories of data.</Text>
            </View>
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

LegalComponent.propTypes = {
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
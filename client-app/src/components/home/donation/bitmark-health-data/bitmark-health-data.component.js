import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Image, Text, TouchableOpacity,
  Platform,
} from 'react-native';

import bitmarkHealthStyles from './bitmark-health-data.component.style';
import { androidDefaultStyle, iosDefaultStyle } from './../../../../commons/styles';
import { AppController } from '../../../../managers';
import { EventEmiterService } from '../../../../services';
let defaultStyle = Platform.select({
  ios: iosDefaultStyle,
  android: androidDefaultStyle
});

export class BitmarkHealthDataComponent extends React.Component {
  constructor(props) {
    super(props);
    let list = this.props.navigation.state.params.list;
    this.state = { list };
  }
  render() {
    return (<View style={bitmarkHealthStyles.body}>
      <View style={defaultStyle.header}>
        <TouchableOpacity style={defaultStyle.headerLeft} />
        <Text style={defaultStyle.headerTitle} />
        <TouchableOpacity style={defaultStyle.headerRight} onPress={() => this.props.navigation.goBack()} >
          <Text style={defaultStyle.headerRightText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <View style={bitmarkHealthStyles.content}>
        <Text style={bitmarkHealthStyles.bitmarkTitle}>SIGN YOUR BITMARK ISSUANCE </Text>
        <View style={bitmarkHealthStyles.passcodeRemindImages}>
          <Image style={[bitmarkHealthStyles.touchIdImage]} source={require('./../../../../../assets/imgs/touch-id.png')} />
          <Image style={[bitmarkHealthStyles.faceIdImage]} source={require('./../../../../../assets/imgs/face-id.png')} />
        </View>
        <Text style={bitmarkHealthStyles.bitmarkDescription}>Signing your issuance with Touch/ Face ID or Passcode securely creates new bitmarks for your health data.</Text>
      </View>
      <TouchableOpacity style={bitmarkHealthStyles.bitmarkButton} onPress={() => {
        AppController.doBitmarkHealthData(this.state.list).catch(error => {
          console.log('doBitmarkHelthData error:', error);
          EventEmiterService.emit(EventEmiterService.events.APP_PROCESS_ERROR);
        })
      }}>
        <Text style={bitmarkHealthStyles.bitmarkButtonText}>SIGN</Text>
      </TouchableOpacity>
    </View>);
  }
}

BitmarkHealthDataComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    dispatch: PropTypes.func,
    goBack: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.shape({
        list: PropTypes.array.isRequired,
      })
    })
  })
}
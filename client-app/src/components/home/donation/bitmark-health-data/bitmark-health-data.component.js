import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Image, Text, TouchableOpacity,
  Platform,
} from 'react-native';

import bitmarkHealthStyles from './bitmark-health-data.component.style';
import { androidDefaultStyle, iosDefaultStyle } from './../../../commons/styles';
let defaultStyle = Platform.select({
  ios: iosDefaultStyle,
  android: androidDefaultStyle
});

export default class BitmarkHealthDataComponent extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (<View style={bitmarkHealthStyles.body}>
      <View style={bitmarkHealthStyles.main}>
        <View style={bitmarkHealthStyles.swipePage}>
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
            <TouchableOpacity style={bitmarkHealthStyles.bitmarkButton}>
              <Text style={bitmarkHealthStyles.bitmarkButtonText}>SIGN</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
        justCreatedBitmarkAccount: PropTypes.bool,
      })
    })
  })
}
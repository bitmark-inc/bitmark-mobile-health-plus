import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Image, Text, TouchableOpacity,
  Platform,
} from 'react-native';

import donationStyles from './study-donation.component.style';
import { androidDefaultStyle, iosDefaultStyle } from './../../../../commons/styles';
import { AppController } from '../../../../managers';
import { EventEmiterService } from '../../../../services';
let defaultStyle = Platform.select({
  ios: iosDefaultStyle,
  android: androidDefaultStyle
});

export class StudyDonationComponent extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (<View style={[donationStyles.body]}>
      <View style={[defaultStyle.header,]}>
        <TouchableOpacity style={defaultStyle.headerLeft}>
        </TouchableOpacity>
        <Text style={defaultStyle.headerTitle}></Text>
        <TouchableOpacity style={defaultStyle.headerRight} onPress={() => this.props.navigation.goBack()}>
          <Text style={defaultStyle.headerRightText}>Cancel</Text>
        </TouchableOpacity>
      </View>
      <View style={donationStyles.main}>
        <Text style={donationStyles.donationTitle}>AUTHORIZE YOUR DONATION</Text>
        <View style={donationStyles.passcodeRemindImages}>
          <Image style={[donationStyles.touchIdImage]} source={require('./../../../../../assets/imgs/touch-id.png')} />
          <Image style={[donationStyles.faceIdImage]} source={require('./../../../../../assets/imgs/face-id.png')} />
        </View>
        <Text style={donationStyles.donationDescription}>By signing you are consenting to give the researcher rights to use this donation in their study. Your consent will be recorded in the Bitmark blockchain.</Text>
        <TouchableOpacity style={donationStyles.bitmarkButton} onPress={() => {
          AppController.doDonateHealthData().catch(error => {
            console.log('doDonateHealthData error:', error);
            EventEmiterService.emit(EventEmiterService.events.APP_PROCESS_ERROR);
          });
        }}>
          <Text style={donationStyles.bitmarkButtonText}>DONATE</Text>
        </TouchableOpacity>
      </View>
    </View>);
  }
}

StudyDonationComponent.propTypes = {
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
import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Image, Text, TouchableOpacity,
} from 'react-native';

import { FullComponent } from './../../../../commons/components';

import donationStyles from './study-donation.component.style';
import defaultStyle from './../../../../commons/styles';
import { AppController } from '../../../../managers';
import { EventEmiterService } from '../../../../services';
import { convertWidth } from '../../../../utils';
export class StudyDonationComponent extends React.Component {
  constructor(props) {
    super(props);
    let study = this.props.navigation.state.params.study;
    let list = this.props.navigation.state.params.list;
    this.state = { study, list };
  }
  render() {
    return (
      <FullComponent
        content={(
          <View style={[donationStyles.body]}>
            <View style={[donationStyles.header]}>
              <TouchableOpacity style={[defaultStyle.headerLeft, { maxWidth: 50 }]} onPress={() => this.props.navigation.goBack()}>
                <Image style={defaultStyle.headerLeftIcon} source={require('./../../../../../assets/imgs/header_blue_icon.png')} />
              </TouchableOpacity>
              <View style={[defaultStyle.headerCenter, { maxWidth: convertWidth(375) - 100 }]}>
                <Text style={[defaultStyle.headerTitle, { maxWidth: convertWidth(375) - 100 }]}>AUTHORIZE YOUR DONATION</Text>
              </View>
              <TouchableOpacity style={[defaultStyle.headerRight, { maxWidth: 50 }]} >
              </TouchableOpacity>
            </View>
            <View style={donationStyles.main}>
              <View style={donationStyles.passcodeRemindImages}>
                <Image style={[donationStyles.touchIdImage]} source={require('./../../../../../assets/imgs/touch-id.png')} />
                <Image style={[donationStyles.faceIdImage]} source={require('./../../../../../assets/imgs/face-id.png')} />
              </View>
              <Text style={donationStyles.donationDescription}>
                By signing you are consenting to give the researcher rights to use this donation in their study. Your consent will be recorded in the Bitmark blockchain.
              </Text>
              <TouchableOpacity style={donationStyles.bitmarkButton} onPress={() => {
                AppController.doDonateHealthData(this.state.study, this.state.list, {
                  indicator: true, title: 'Transferring your encrypted data to the researcher...', message: ''
                }, {
                    indicator: false, title: 'Donation Successful!', message: 'Thank you for donating your data to help current and future generations!'
                  }).then((result) => {
                    if (result) {
                      this.props.navigation.goBack();
                    }
                  }).catch(error => {
                    console.log('doDonateHealthData error:', error);
                    EventEmiterService.emit(EventEmiterService.events.APP_PROCESS_ERROR);
                  });
              }}>
                <Text style={donationStyles.bitmarkButtonText}>DONATE</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    );
  }
}

StudyDonationComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    dispatch: PropTypes.func,
    goBack: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.shape({
        study: PropTypes.object.isRequired,
        list: PropTypes.array.isRequired,
      }),
    })
  })
}
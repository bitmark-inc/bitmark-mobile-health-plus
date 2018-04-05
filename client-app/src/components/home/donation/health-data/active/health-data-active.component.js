import React from 'react';
import PropTypes from 'prop-types';
import Swiper from 'react-native-swiper';
import {
  View, Image, Text, TouchableOpacity,
} from 'react-native';

import defaultStyle from './../../../../../commons/styles';
import activeDonationStyle from './health-data-active.component.style';

import { DataController, AppController } from '../../../../../managers';
import { EventEmiterService } from '../../../../../services';
import moment from 'moment';


export class HealthDataActiveComponent extends React.Component {
  constructor(props) {
    super(props);
    this.doActiveBitmarkHealthData = this.doActiveBitmarkHealthData.bind(this);
    this.goToHealthDataSetting = this.goToHealthDataSetting.bind(this);
    this.state = {
      user: DataController.getUserInformation(),
    };
    console.log('run here');
  }

  doActiveBitmarkHealthData() {
    AppController.doRequirePermission().then(() => {
      AppController.doActiveBitmarkHealthData(moment().toDate()).then(result => {
        if (result !== null) {
          this.swiper.scrollBy(1);
        }
      }).catch(error => {
        console.log('doActiveBitmarkHealthData error :', error);
        EventEmiterService.emit(EventEmiterService.events.APP_PROCESS_ERROR);
      });
    }).catch(error => {
      console.log('doRequirePermission error :', error);
    });
  }

  goToHealthDataSetting() {
    this.props.screenProps.homeNavigation.navigate('HealthDataSettings');
    this.props.navigation.goBack();
  }

  render() {
    return (<View style={activeDonationStyle.body}>
      <Swiper loop={false} showsPagination={false} scrollEnabled={false} ref={swiper => this.swiper = swiper}>
        <View style={activeDonationStyle.swipePage}>
          <View style={activeDonationStyle.header}>
            <TouchableOpacity style={defaultStyle.headerLeft} onPress={() => this.props.navigation.goBack()}>
              <Image style={defaultStyle.headerLeftIcon} source={require('../../../../../../assets/imgs/header_blue_icon.png')} />
            </TouchableOpacity>
            <Text style={defaultStyle.headerTitle} >HEALTH DATA</Text>
            <TouchableOpacity style={defaultStyle.headerRight} />
          </View>
          <View style={activeDonationStyle.content}>
            <Text style={activeDonationStyle.description}>
              Please allow Bitmark to access your Health app data. We recommend selecting “Turn All Categories On” so that you can claim full ownership of all your health data. We cannot read or record your data. This process will be encrypted and only available on your device and your Bitmark account.
            </Text>
            <View style={activeDonationStyle.accessIconArea}>
              <Image style={activeDonationStyle.accessIcon} source={require('./../../../../../../assets/imgs/icon_health.png')} />
              <Image style={activeDonationStyle.accessIconPlus} source={require('./../../../../../../assets/imgs/+.png')} />
              <Image style={activeDonationStyle.accessIcon} source={require('./../../../../../../assets/imgs/bitmark-logo.png')} />
            </View>
            <View style={activeDonationStyle.bottomButtonArea}>
              <TouchableOpacity style={[activeDonationStyle.bottomButton,]} onPress={this.doActiveBitmarkHealthData}>
                <Text style={activeDonationStyle.bottomButtonText}>GET STARTED!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={[activeDonationStyle.swipePage]}>
          <View style={activeDonationStyle.header}>
            <TouchableOpacity style={defaultStyle.headerLeft} />
            <Text style={defaultStyle.headerTitle} >HEALTH DATA</Text>
            <TouchableOpacity style={defaultStyle.headerRight} />
          </View>
          <View style={activeDonationStyle.content}>
            <Text style={[activeDonationStyle.healthDataTitle]}>{'CONGRATULATIONS!\nYou’ve all set up!'.toUpperCase()}</Text>
            <Text style={activeDonationStyle.healthDataDescription}>We will send you issuance request every Monday 11pm, please sign the issuance to bitmark your health data.</Text>

            <View style={[activeDonationStyle.bottomButtonArea]}>
              <TouchableOpacity style={[activeDonationStyle.bottomButton,]} onPress={this.goToHealthDataSetting}>
                <Text style={activeDonationStyle.bottomButtonText}>CHECK NOW!</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[activeDonationStyle.bottomButton, {
                backgroundColor: 'white',
              }]} onPress={() => this.props.navigation.goBack()}>
                <Text style={[activeDonationStyle.bottomButtonText, { color: '#0060F2' }]}>SKIP</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

      </Swiper>
    </View >);
  }
}

HealthDataActiveComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
  }),
  screenProps: PropTypes.shape({
    homeNavigation: PropTypes.shape({
      navigate: PropTypes.func,
      goBack: PropTypes.func,
    }),
  }),
}
import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, ScrollView, Image,
  Clipboard,
  Alert,
} from 'react-native';

import { EventEmiterService } from "./../../../services";
import accountStyle from './account.component.style';

import defaultStyle from './../../../commons/styles';
import { DataController, AppController } from '../../../managers';

export class AccountDetailComponent extends React.Component {
  constructor(props) {
    super(props);
    this.handerDonationInformationChange = this.handerDonationInformationChange.bind(this);
    this.handerChangeUserInfo = this.handerChangeUserInfo.bind(this);
    this.inactiveBitmarkHealthData = this.inactiveBitmarkHealthData.bind(this);

    this.state = {
      accountNumberCopyText: 'COPY',
      notificationUUIDCopyText: 'COPY',
      userInfo: DataController.getUserInformation(),
      donationInformation: DataController.getDonationInformation(),
    };
  }

  componentDidMount() {
    EventEmiterService.on(EventEmiterService.events.CHANGE_USER_INFO, this.handerChangeUserInfo);
    EventEmiterService.on(EventEmiterService.events.CHANGE_USER_DATA_DONATION_INFORMATION, this.handerDonationInformationChange);
  }

  componentWillUnmount() {
    EventEmiterService.remove(EventEmiterService.events.CHANGE_USER_DATA_DONATION_INFORMATION, this.handerDonationInformationChange);
    EventEmiterService.remove(EventEmiterService.events.CHANGE_USER_INFO, this.handerChangeUserInfo);
  }
  handerDonationInformationChange() {
    this.setState({ donationInformation: DataController.getDonationInformation() });
  }
  handerChangeUserInfo() {
    this.setState({ userInfo: DataController.getUserInformation() });
  }

  inactiveBitmarkHealthData() {
    Alert.alert('Are you sure you want to remove bitmark health data?', '', [{
      text: 'No',
    }, {
      text: 'YES',
      onPress: () => {
        AppController.doInactiveBitmarkHealthData().then((result) => {
          if (result) {
            this.props.navigation.goBack();
          }
        }).catch(error => {
          EventEmiterService.emit(EventEmiterService.events.APP_PROCESS_ERROR);
          console.log('doInactiveBitmarkHealthData error :', error);
        });
      }
    }]);
  }

  render() {
    return (
      <View style={accountStyle.body}>
        <View style={accountStyle.header}>
          <TouchableOpacity style={defaultStyle.headerLeft}></TouchableOpacity>
          <Text style={defaultStyle.headerTitle}>ACCOUNT</Text>
          <TouchableOpacity style={defaultStyle.headerRight} onPress={() => {
            this.props.navigation.navigate('ApplicationDetail');
          }}>
            <Image style={accountStyle.bitmarkAccountHelpIcon} source={require('./../../../../assets/imgs/icon_help.png')} />
          </TouchableOpacity>
        </View>
        <ScrollView style={[accountStyle.scrollSubTabArea]}>
          <TouchableOpacity activeOpacity={1} style={{ flex: 1 }}>
            <View style={accountStyle.contentSubTab}>
              <Text style={accountStyle.settingLabel}>SETTINGS</Text>
              <Text style={accountStyle.accountNumberLabel}>{'YOUR Bitmark Account Number'.toUpperCase()}</Text>

              <View style={accountStyle.accountNumberArea}>
                <Text style={accountStyle.accountNumberValue}>{this.state.userInfo.bitmarkAccountNumber}</Text>
                <TouchableOpacity style={accountStyle.accountNumberCopyButton} onPress={() => {
                  Clipboard.setString(this.state.userInfo.bitmarkAccountNumber);
                  this.setState({ accountNumberCopyText: 'COPIED' });
                  setTimeout(() => { this.setState({ accountNumberCopyText: 'COPY' }) }, 1000);
                }}>
                  <Text style={accountStyle.accountNumberCopyButtonText}>{this.state.accountNumberCopyText}</Text>
                </TouchableOpacity>
              </View>
              <Text style={accountStyle.accountMessage}>To protect your privacy, you are identified in the Bitmark system by an anonymous public account number. You can safely share this public account number with others without compromising your account security.</Text>

              <TouchableOpacity style={accountStyle.accountWriteDownButton} onPress={() => { this.props.navigation.navigate('AccountRecovery', { isSignOut: false }) }}>
                <Text style={accountStyle.accountWriteDownButtonText}>{'WRITE DOWN RECOVERY PHRASE »'.toUpperCase()} </Text>
              </TouchableOpacity>
              {/* <TouchableOpacity style={accountStyle.accountRemoveButton} onPress={this.props.screenProps.logout}> */}
              <TouchableOpacity style={accountStyle.accountRemoveButton} onPress={() => { this.props.navigation.navigate('AccountRecovery', { isSignOut: true }) }}>
                <Text style={accountStyle.accountRemoveButtonText}>{'Remove access from this device »'.toUpperCase()} </Text>
              </TouchableOpacity>

              <View style={accountStyle.dataSourcesArea}>
                <Text style={accountStyle.authorizedLabel}>AUTHORIZED</Text>
                {!this.state.donationInformation || !this.state.donationInformation.activeBitmarkHealthDataAt &&
                  <Text style={accountStyle.noAuthorizedMessage}>If you authorize 3rd-party apps to access your Bitmark account, they will appear here. </Text>
                }
                {this.state.donationInformation && this.state.donationInformation.activeBitmarkHealthDataAt && <View style={accountStyle.authorizedItem}>
                  <View style={accountStyle.authorizedItemTitle}>
                    <Text style={accountStyle.authorizedItemTitleText} >HEALTHKIT</Text>
                    <TouchableOpacity style={accountStyle.authorizedItemRemoveButton} onPress={this.inactiveBitmarkHealthData}>
                      <Text style={accountStyle.authorizedItemRemoveButtonText}>REMOVE</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={accountStyle.authorizedItemDescription}>
                    <Image style={accountStyle.authorizedItemDescriptionIcon} source={require('./../../../../assets/imgs/icon_health.png')} />
                    <Text style={accountStyle.authorizedItemDescriptionText}>CAN:{'\n'}Extract data from HealthKit and issue bitmarks. Repeats weekly.</Text>
                  </View>
                </View>}
              </View>
            </View >
          </TouchableOpacity>
        </ScrollView>
      </View >
    );
  }
}

AccountDetailComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
  }),
  screenProps: PropTypes.shape({
    logout: PropTypes.func,
    homeNavigation: PropTypes.shape({
      navigate: PropTypes.func,
      goBack: PropTypes.func,
    }),
  }),
}
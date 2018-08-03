import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, ScrollView, Image,
  Clipboard,
  Alert,
} from 'react-native';

import { EventEmitterService } from "./../../../services";
import accountStyle from './account.component.style';

import defaultStyle from './../../../commons/styles';
import { DataProcessor, AppProcessor } from '../../../processors';
import { BitmarkComponent } from '../../../commons/components';

const SubTabs = {
  settings: 'SETTINGS',
  authorized: 'AUTHORIZED',
}
let ComponentName = 'AccountDetailComponent';
export class AccountDetailComponent extends React.Component {
  constructor(props) {
    super(props);
    this.handerDonationInformationChange = this.handerDonationInformationChange.bind(this);
    this.handerChangeUserInfo = this.handerChangeUserInfo.bind(this);
    this.inactiveBitmarkHealthData = this.inactiveBitmarkHealthData.bind(this);
    this.handerLoadingData = this.handerLoadingData.bind(this);
    this.revokeIFTTT = this.revokeIFTTT.bind(this);
    this.handerChangeIftttInformation = this.handerChangeIftttInformation.bind(this);

    EventEmitterService.remove(EventEmitterService.events.CHANGE_USER_DATA_DONATION_INFORMATION, null, ComponentName);
    EventEmitterService.remove(EventEmitterService.events.CHANGE_USER_DATA_IFTTT_INFORMATION, null, ComponentName);
    EventEmitterService.remove(EventEmitterService.events.CHANGE_USER_INFO, null, ComponentName);
    EventEmitterService.remove(EventEmitterService.events.APP_LOADING_DATA, null, ComponentName);

    let subTab = (this.props.screenProps.subTab &&
      (this.props.screenProps.subTab === SubTabs.settings || this.props.screenProps.subTab === SubTabs.authorized))
      ? this.props.screenProps.subTab : SubTabs.settings;

    this.state = {
      subTab,
      accountNumberCopyText: '',
      notificationUUIDCopyText: 'COPY',
      userInfo: DataProcessor.getUserInformation(),
      appLoadingData: DataProcessor.isAppLoadingData(),
      gettingData: true,
    };
    let doGetScreenData = async () => {
      // let donationInformation = await DataProcessor.doGetDonationInformation();
      this.setState({
        // donationInformation,
        gettingData: false
      });
    }
    doGetScreenData();
    console.log('this.props :', this.props);
  }

  componentDidMount() {
    EventEmitterService.on(EventEmitterService.events.CHANGE_USER_INFO, this.handerChangeUserInfo, ComponentName);
    EventEmitterService.on(EventEmitterService.events.CHANGE_USER_DATA_DONATION_INFORMATION, this.handerDonationInformationChange, ComponentName);
    EventEmitterService.on(EventEmitterService.events.CHANGE_USER_DATA_IFTTT_INFORMATION, this.handerChangeIftttInformation, ComponentName);
    EventEmitterService.on(EventEmitterService.events.APP_LOADING_DATA, this.handerLoadingData, ComponentName);
  }

  handerChangeIftttInformation(iftttInformation) {
    this.setState({ iftttInformation });
  }
  handerDonationInformationChange(donationInformation) {
    this.setState({ donationInformation });
  }
  handerChangeUserInfo(userInfo) {
    this.setState({ userInfo });
  }
  handerLoadingData() {
    this.setState({ appLoadingData: DataProcessor.isAppLoadingData() });
  }

  switchSubTab(subTab) {
    this.setState({ subTab, });
  }

  inactiveBitmarkHealthData() {
    Alert.alert('Are you sure you want to revoke access to your HealthKit data?', '', [{
      text: 'Cancel',
      style: 'cancel',
    }, {
      text: 'Yes',
      onPress: () => {
        AppProcessor.doInactiveBitmarkHealthData().then().catch(error => {
          EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
          console.log('doInactiveBitmarkHealthData error :', error);
        });
      }
    }]);
  }

  revokeIFTTT() {
    Alert.alert('Are you sure you want to revoke access to your IFTTT?', '', [{
      style: 'cancel',
      text: 'Cancel',
    }, {
      text: 'Yes',
      onPress: () => {
        AppProcessor.doRevokeIftttToken().then((result) => {
          if (result) {
            DataProcessor.doReloadUserData();
            this.props.navigation.goBack();
          }
        }).catch(error => {
          EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
          console.log('doInactiveBitmarkHealthData error :', error);
        });
      }
    }]);
  }

  render() {
    return (
      <BitmarkComponent

        content={(
          <View style={accountStyle.body}>
            <View style={accountStyle.header}>
              <TouchableOpacity style={defaultStyle.headerLeft} onPress={() => this.props.navigation.goBack()}>
                <Image style={defaultStyle.headerLeftIcon} source={require('./../../../../assets/imgs/close-blue-icon.png')} />
              </TouchableOpacity>
              <Text style={defaultStyle.headerTitle}>ACCOUNT SETTINGS</Text>
              <TouchableOpacity style={defaultStyle.headerRight} />
            </View>
            <ScrollView style={[accountStyle.scrollSubTabArea]}>
              <TouchableOpacity activeOpacity={1} style={{ flex: 1 }}>
                <View style={accountStyle.contentSubTab}>
                  <Text style={accountStyle.accountNumberLabel}>{'YOUR Bitmark Account Number'.toUpperCase()}</Text>

                  <TouchableOpacity style={accountStyle.accountNumberArea} onPress={() => {
                    Clipboard.setString(this.state.userInfo.bitmarkAccountNumber);
                    this.setState({ accountNumberCopyText: 'Copied to clipboard!' });
                    setTimeout(() => { this.setState({ accountNumberCopyText: '' }) }, 1000);
                  }}>
                    <Text style={accountStyle.accountNumberValue}>{this.state.userInfo.bitmarkAccountNumber}</Text>
                  </TouchableOpacity>
                  <View style={accountStyle.accountNumberBar}>
                    <Text style={accountStyle.accountNumberCopyButtonText}>{this.state.accountNumberCopyText}</Text>
                  </View>

                  <Text style={accountStyle.accountMessage}>To protect your privacy, you are identified in the Bitmark system by a pseudonymous account number. This number is public. You can safely share it with others without compromising your security.</Text>

                  <TouchableOpacity style={accountStyle.accountWriteDownButton} onPress={() => { this.props.navigation.navigate('AccountRecovery', { isSignOut: false }) }}>
                    <Text style={accountStyle.accountWriteDownButtonText}>{'WRITE DOWN RECOVERY PHRASE »'.toUpperCase()} </Text>
                  </TouchableOpacity>
                  {/* <TouchableOpacity style={accountStyle.accountRemoveButton} onPress={this.props.screenProps.logout}> */}
                  <TouchableOpacity style={accountStyle.accountRemoveButton} onPress={() => { this.props.navigation.navigate('AccountRecovery', { isSignOut: true }) }}>
                    <Text style={accountStyle.accountRemoveButtonText}>{'Remove access from this device »'.toUpperCase()} </Text>
                  </TouchableOpacity>
                </View>

              </TouchableOpacity>
            </ScrollView>
          </View >
        )}
      />
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
    subTab: PropTypes.string,
    homeNavigation: PropTypes.shape({
      navigate: PropTypes.func,
      goBack: PropTypes.func,
    }),
  }),
}
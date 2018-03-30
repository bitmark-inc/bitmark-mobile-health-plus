import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, ScrollView, Image, FlatList,
  Clipboard,
  Platform,
} from 'react-native';

import { EventEmiterService } from "./../../../services";
import accountStyle from './account.component.style';

import { androidDefaultStyle, iosDefaultStyle } from './../../../commons/styles';
import { DataController } from '../../../managers';
import { FullComponent } from '../../../commons/components/bitmark-app-component';
import { BottomTabsComponent } from '../bottom-tabs/bottom-tabs.component';

let defaultStyle = Platform.select({
  ios: iosDefaultStyle,
  android: androidDefaultStyle
});

export class AccountDetailComponent extends React.Component {
  constructor(props) {
    super(props);
    this.handerDonationInformationChange = this.handerDonationInformationChange.bind(this);
    this.handerChangeUserInfo = this.handerChangeUserInfo.bind(this);

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

  render() {
    return (
      <FullComponent
        content={(<View style={accountStyle.body}>
          <View style={accountStyle.header}>
            <TouchableOpacity style={defaultStyle.headerLeft}></TouchableOpacity>
            <Text style={defaultStyle.headerTitle}>ACCOUNT</Text>
            <TouchableOpacity style={defaultStyle.headerRight} onPress={() => {
              this.props.screenProps.homeNavigation.navigate('ApplicationDetail');
            }}>
              <Image style={accountStyle.bitmarkAccountHelpIcon} source={require('./../../../../assets/imgs/icon_help.png')} />
            </TouchableOpacity>
          </View>
          <ScrollView style={[accountStyle.scrollSubTabArea]}>
            <TouchableOpacity activeOpacity={1} style={{ flex: 1 }}>
              <View style={accountStyle.contentSubTab}>
                <Text style={accountStyle.settingLabel}>SETTINGS</Text>
                <Text style={accountStyle.accountNumberLabel}>{'My Bitmark Account Number'.toUpperCase()}</Text>

                <View style={accountStyle.accountNumberArea}>
                  <Text style={accountStyle.accountNumberValue} numberOfLines={1}>{this.state.userInfo.bitmarkAccountNumber}</Text>
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
                <TouchableOpacity style={accountStyle.accountRemoveButton} onPress={this.props.screenProps.logout}>
                  {/* <TouchableOpacity style={accountStyle.accountRemoveButton} onPress={() => { this.props.navigation.navigate('AccountRecovery', { isSignOut: true }) }}> */}
                  <Text style={accountStyle.accountRemoveButtonText}>{'Remove access from this device  »'.toUpperCase()} </Text>
                </TouchableOpacity>

                <Text style={accountStyle.accountDataSourceLabel}>Data Sources</Text>
                <View style={accountStyle.dataSourcesArea}>
                  <Text style={accountStyle.dataSourcesMessage}>
                    Claim ownership over your health data. Connect Bitmark to Apple’s Health app: <Text style={{ color: '#0060F2' }}>{"Health App > Sources > Bitmark."}</Text>  Any data sources that you allow Bitmark to access will be bitmarked automatically. (If you did not grant access or if you did and no data was detected, the status will be inactive.)
                </Text>
                  {(!this.state.donationInformation || !this.state.donationInformation.createdAt) &&
                    <TouchableOpacity style={accountStyle.activeBitmarkHealthDataButton} onPress={() => {
                      this.props.screenProps.homeNavigation.navigate('DoActiveDonation');
                    }}>
                      <Text style={accountStyle.activeBitmarkHealthDataButtonText}>ACCESS MY HEALTH DATA  » </Text>
                    </TouchableOpacity>
                  }
                  {this.state.donationInformation && this.state.donationInformation.createdAt &&
                    <FlatList data={this.state.donationInformation.dataSourceStatuses}
                      extraData={this.state.donationInformation.dataSourceStatuses}
                      style={accountStyle.dataSourcesList}
                      renderItem={({ item }) => {
                        return (<View style={accountStyle.dataSourceRow}>
                          <Text style={accountStyle.dataSourcesName}>{item.title}</Text>
                          <Text style={accountStyle['dataSource' + item.status]}>{item.status.toUpperCase()}</Text>
                        </View>)
                      }}
                    />
                  }
                </View>
              </View >
            </TouchableOpacity>
          </ScrollView>
        </View >)}
        footer={(<BottomTabsComponent mainTab={BottomTabsComponent.MainTabs.account} switchMainTab={this.props.screenProps.switchMainTab} />)}
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
    switchMainTab: PropTypes.func.isRequired,
    logout: PropTypes.func,
    homeNavigation: PropTypes.shape({
      navigate: PropTypes.func,
      goBack: PropTypes.func,
    }),
  }),
}
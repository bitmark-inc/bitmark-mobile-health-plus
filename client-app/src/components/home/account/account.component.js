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

const SubTabs = {
  settings: 'SETTINGS',
  authorized: 'AUTHORIZED',
}

export class AccountDetailComponent extends React.Component {
  constructor(props) {
    super(props);
    this.handerDonationInformationChange = this.handerDonationInformationChange.bind(this);
    this.handerChangeUserInfo = this.handerChangeUserInfo.bind(this);
    this.inactiveBitmarkHealthData = this.inactiveBitmarkHealthData.bind(this);

    let subTab = (this.props.screenProps.subTab &&
      (this.props.screenProps.subTab === SubTabs.settings || this.props.screenProps.subTab === SubTabs.authorized))
      ? this.props.screenProps.subTab : SubTabs.settings;
    console.log('subtab :', subTab);
    this.state = {
      subTab,
      accountNumberCopyText: '',
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

  switchSubtab(subTab) {
    this.setState({
      subTab,
      userInfo: DataController.getUserInformation(),
      donationInformation: DataController.getDonationInformation(),
    });
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
        <View style={accountStyle.subTabArea}>
          {this.state.subTab === SubTabs.settings && <TouchableOpacity style={[accountStyle.subTabButton, {
            shadowOffset: { width: 2 },
            shadowOpacity: 0.15,
          }]}>
            <View style={accountStyle.subTabButtonArea}>
              <View style={[accountStyle.activeSubTabBar, { backgroundColor: '#0060F2' }]}></View>
              <View style={accountStyle.subTabButtonTextArea}>
                <Text style={accountStyle.subTabButtonText}>{SubTabs.settings.toUpperCase()}</Text>
              </View>
            </View>
          </TouchableOpacity>}
          {this.state.subTab !== SubTabs.settings && <TouchableOpacity style={[accountStyle.subTabButton, {
            backgroundColor: '#F5F5F5',
            zIndex: 0,
          }]} onPress={() => this.switchSubtab(SubTabs.settings)}>
            <View style={accountStyle.subTabButtonArea}>
              <View style={[accountStyle.activeSubTabBar, { backgroundColor: '#F5F5F5' }]}></View>
              <View style={accountStyle.subTabButtonTextArea}>
                <Text style={[accountStyle.subTabButtonText, { color: '#C1C1C1' }]}>{SubTabs.settings.toUpperCase()}</Text>
              </View>
            </View>
          </TouchableOpacity>}

          {this.state.subTab === SubTabs.authorized && <TouchableOpacity style={[accountStyle.subTabButton, {
            shadowOffset: { width: -2 },
            shadowOpacity: 0.15,
          }]}>
            <View style={accountStyle.subTabButtonArea}>
              <View style={[accountStyle.activeSubTabBar, { backgroundColor: '#0060F2' }]}></View>
              <View style={accountStyle.subTabButtonTextArea}>
                <Text style={accountStyle.subTabButtonText}>{SubTabs.authorized.toUpperCase()}</Text>
              </View>
            </View>
          </TouchableOpacity>}
          {this.state.subTab !== SubTabs.authorized && <TouchableOpacity style={[accountStyle.subTabButton, {
            backgroundColor: '#F5F5F5',
            zIndex: 0,
          }]} onPress={() => this.switchSubtab(SubTabs.authorized)}>
            <View style={accountStyle.subTabButtonArea}>
              <View style={[accountStyle.activeSubTabBar, { backgroundColor: '#F5F5F5' }]}></View>
              <View style={accountStyle.subTabButtonTextArea}>
                <Text style={[accountStyle.subTabButtonText, { color: '#C1C1C1' }]}>{SubTabs.authorized.toUpperCase()}</Text>
              </View>
            </View>
          </TouchableOpacity>}
        </View>

        <ScrollView style={[accountStyle.scrollSubTabArea]}>
          <TouchableOpacity activeOpacity={1} style={{ flex: 1 }}>
            {this.state.subTab === SubTabs.settings && <View style={accountStyle.contentSubTab}>
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

              <Text style={accountStyle.accountMessage}>To protect your privacy, you are identified in the Bitmark system by an anonymous public account number. You can safely share this public account number with others without compromising your account security.</Text>

              <TouchableOpacity style={accountStyle.accountWriteDownButton} onPress={() => { this.props.navigation.navigate('AccountRecovery', { isSignOut: false }) }}>
                <Text style={accountStyle.accountWriteDownButtonText}>{'WRITE DOWN RECOVERY PHRASE »'.toUpperCase()} </Text>
              </TouchableOpacity>
              {/* <TouchableOpacity style={accountStyle.accountRemoveButton} onPress={this.props.screenProps.logout}> */}
              <TouchableOpacity style={accountStyle.accountRemoveButton} onPress={() => { this.props.navigation.navigate('AccountRecovery', { isSignOut: true }) }}>
                <Text style={accountStyle.accountRemoveButtonText}>{'Remove access from this device »'.toUpperCase()} </Text>
              </TouchableOpacity>
            </View>}

            {this.state.subTab === SubTabs.authorized && <View style={accountStyle.contentSubTab}>
              <View style={accountStyle.dataSourcesArea}>
                <Text style={accountStyle.noAuthorizedMessage}>If you authorize 3rd-party apps to access your Bitmark account, they will appear here. </Text>
                {this.state.donationInformation && this.state.donationInformation.activeBitmarkHealthDataAt && <View style={accountStyle.authorizedItem}>
                  <View style={accountStyle.authorizedItemTitle}>
                    <Text style={accountStyle.authorizedItemTitleText} >HEALTH</Text>
                    <TouchableOpacity style={accountStyle.authorizedItemRemoveButton} onPress={this.inactiveBitmarkHealthData}>
                      <Text style={accountStyle.authorizedItemRemoveButtonText}>REMOVE</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={accountStyle.authorizedItemDescription}>
                    <Image style={accountStyle.authorizedItemDescriptionIcon} source={require('./../../../../assets/imgs/icon_health.png')} />
                    <View style={accountStyle.authorizedItemDescriptionDetail}>
                      <Text style={accountStyle.authorizedItemDescriptionText}>CAN:{'\n'}Extract data from the Health app and register property rights. Repeats weekly (Sunday 11AM).</Text>
                      <TouchableOpacity style={accountStyle.authorizedViewButton} onPress={() => {
                        this.props.screenProps.homeNavigation.navigate('HealthDataDataSource')
                      }}>
                        <Text style={accountStyle.authorizedViewButtonText}>{'VIEW DATA TYPES »'.toUpperCase()} </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>}
              </View>
            </View>}
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
    subTab: PropTypes.string,
    homeNavigation: PropTypes.shape({
      navigate: PropTypes.func,
      goBack: PropTypes.func,
    }),
  }),
}
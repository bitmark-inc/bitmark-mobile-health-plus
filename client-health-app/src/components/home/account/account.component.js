import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, ScrollView, Image,
  Clipboard,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NavigationActions } from 'react-navigation';

import { EventEmitterService } from "./../../../services";
import style from './account.component.style';

import defaultStyle from './../../../commons/styles';
import { DataProcessor, AppProcessor } from '../../../processors';
import { BitmarkComponent } from '../../../commons/components';
import { config } from "./../../../configs";
import { CommonModel } from '../../../models';
import { BitmarkOneTabButtonComponent } from '../../../commons/components/bitmark-button';

let ComponentName = 'AccountDetailComponent';
export class AccountDetailComponent extends React.Component {
  constructor(props) {
    super(props);
    this.logout = this.logout.bind(this);
    this.handerDonationInformationChange = this.handerDonationInformationChange.bind(this);
    this.handerChangeUserInfo = this.handerChangeUserInfo.bind(this);
    this.handerLoadingData = this.handerLoadingData.bind(this);
    this.revokeIFTTT = this.revokeIFTTT.bind(this);
    this.handerChangeIftttInformation = this.handerChangeIftttInformation.bind(this);
    this.doGetScreenData = this.doGetScreenData.bind(this);

    EventEmitterService.remove(EventEmitterService.events.CHANGE_USER_DATA_DONATION_INFORMATION, null, ComponentName);
    EventEmitterService.remove(EventEmitterService.events.CHANGE_USER_DATA_IFTTT_INFORMATION, null, ComponentName);
    EventEmitterService.remove(EventEmitterService.events.CHANGE_USER_INFO, null, ComponentName);
    EventEmitterService.remove(EventEmitterService.events.APP_LOADING_DATA, null, ComponentName);


    this.state = {
      accountNumberCopyText: '',
      notificationUUIDCopyText: 'COPY',
      userInfo: DataProcessor.getUserInformation(),
      appLoadingData: DataProcessor.isAppLoadingData()
    };
    this.doGetScreenData();
  }

  async doGetScreenData() {
    this.setState({
      donationInformation: null,
      gettingData: true
    });

    let donationInformation = await DataProcessor.doGetDonationInformation();

    this.setState({
      donationInformation,
      gettingData: false
    });
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

  logout() {
    AppProcessor.doLogout().then(() => {
      CommonModel.doTrackEvent({
        event_name: 'health_user_remove_access_successful',
        account_number: DataProcessor.getUserInformation() ? DataProcessor.getUserInformation().bitmarkAccountNumber : null,
      });
      const resetMainPage = NavigationActions.reset({
        index: 0,
        actions: [NavigationActions.navigate({ routeName: 'Main', params: {initialRouteName: 'NewAccount'}})]
      });
      this.props.screenProps.rootNavigation.dispatch(resetMainPage);
    }).catch((error) => {
      console.log('log out error :', error);
    });
  }

  render() {
    return (
      <BitmarkComponent
        backgroundColor='#F5F5F5'
        header={(<View style={style.header}>
          <BitmarkOneTabButtonComponent style={defaultStyle.headerLeft} onPress={() => this.props.navigation.goBack()}>
            <Image style={defaultStyle.headerLeftIcon} source={require('./../../../../assets/imgs/close-blue-icon.png')} />
          </BitmarkOneTabButtonComponent>
          <Text style={defaultStyle.headerTitle}>ACCOUNT SETTINGS</Text>
          <BitmarkOneTabButtonComponent style={defaultStyle.headerRight} />
        </View>)}
        content={(
          <View style={style.body}>
            <ScrollView style={[style.scrollSubTabArea]}>
              <BitmarkOneTabButtonComponent activeOpacity={1} style={{ flex: 1 }}>
                <View style={style.contentSubTab}>

                  {/*YOUR BITMARK ACCOUNT NUMBER*/}
                  <View>
                    <View style={[defaultStyle.itemHeaderContainer, defaultStyle.sectionContainer]}>
                      <Text style={defaultStyle.headerText}>YOUR BITMARK ACCOUNT NUMBER</Text>
                    </View>

                    <BitmarkOneTabButtonComponent style={[defaultStyle.itemContainer]} onPress={() => {
                      Clipboard.setString(this.state.userInfo.bitmarkAccountNumber);
                      this.setState({ accountNumberCopyText: 'Copied to clipboard!' });
                      setTimeout(() => { this.setState({ accountNumberCopyText: '' }) }, 1000);
                    }}>
                      <Text style={style.accountNumberValue}>{this.state.userInfo.bitmarkAccountNumber}</Text>
                    </BitmarkOneTabButtonComponent>
                    <Text style={style.accountNumberCopyButtonText}>{this.state.accountNumberCopyText}</Text>
                  </View>

                  <View>
                    <Text style={style.accountMessage}>To protect your privacy, you are identified in the Bitmark system by a pseudonymous account number. This number is public. You can safely share it with others without compromising your security.</Text>
                  </View>

                  {/*SECURITY*/}
                  <View>
                    <View style={[defaultStyle.itemHeaderContainer, defaultStyle.sectionContainer]}>
                      <Text style={defaultStyle.headerText}>SECURITY</Text>
                    </View>

                    {/*Write Down Recovery Phrase*/}
                    <BitmarkOneTabButtonComponent style={[defaultStyle.itemNoBorderContainer, style.itemContainer]} onPress={() => {
                      CommonModel.doTrackEvent({
                        event_name: 'health_user_writedown_recovery_phrases',
                        account_number: DataProcessor.getUserInformation() ? DataProcessor.getUserInformation().bitmarkAccountNumber : null,
                      });
                      this.props.navigation.navigate('AccountRecovery', { isSignOut: false });
                    }}>
                      <Image style={defaultStyle.iconBase} source={require('./../../../../assets/imgs/icon-write-down.png')} />
                      <View style={[defaultStyle.itemBottomBorderContainer, { justifyContent: 'space-between', }]}>
                        <Text style={defaultStyle.text}>Write Down Recovery Phrase</Text>
                        <Image style={defaultStyle.iconArrowRight} source={require('./../../../../assets/imgs/arrow-right.png')} />
                      </View>
                    </BitmarkOneTabButtonComponent>

                    {/*Remove Access*/}
                    {/* <BitmarkOneTabButtonComponent style={[defaultStyle.itemContainer, style.itemContainer]} onPress={this.logout}> */}
                    <BitmarkOneTabButtonComponent style={[defaultStyle.itemNoBorderContainer, style.itemContainer]} onPress={() => {
                      CommonModel.doTrackEvent({
                        event_name: 'health_user_want_remove_access',
                        account_number: DataProcessor.getUserInformation() ? DataProcessor.getUserInformation().bitmarkAccountNumber : null,
                      });
                      this.props.navigation.navigate('AccountRecovery', { isSignOut: true, logout: this.logout });
                    }}>
                      <Image style={defaultStyle.iconBase} source={require('./../../../../assets/imgs/icon-remove.png')} />
                      <View style={[defaultStyle.itemBottomBorderContainer, { justifyContent: 'space-between', }]}>
                        <Text style={defaultStyle.text}>Remove Access</Text>
                        <Image style={defaultStyle.iconArrowRight} source={require('./../../../../assets/imgs/arrow-right.png')} />
                      </View>
                    </BitmarkOneTabButtonComponent>
                  </View>

                  {/*AUTHORIZED APP*/}
                  <View>
                    <View style={[defaultStyle.itemHeaderContainer, defaultStyle.sectionContainer]}>
                      <Text style={defaultStyle.headerText}>AUTHORIZED APP</Text>
                    </View>
                    {this.state.donationInformation && this.state.donationInformation.activeBitmarkHealthDataAt &&
                      <BitmarkOneTabButtonComponent style={[defaultStyle.itemContainer, style.itemContainer]} onPress={() => {
                        this.props.navigation.navigate('Health', { removeHealthAuthCallBack: this.doGetScreenData })
                      }}>
                        <Image style={defaultStyle.iconBase} source={require('./../../../../assets/imgs/icon_health.png')} />
                        <Text style={defaultStyle.text}>iOS Health</Text>
                        <View style={style.itemAlignRight}>
                          <Text style={defaultStyle.text}>Authorized   </Text>
                          <Image style={defaultStyle.iconArrowRight} source={require('./../../../../assets/imgs/arrow-right.png')} />
                        </View>
                      </BitmarkOneTabButtonComponent>
                    }
                    {this.state.gettingData && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}
                  </View>

                  {/*ABOUT BITMARK HEALTH*/}
                  <View>
                    <View style={[defaultStyle.itemHeaderContainer, defaultStyle.sectionContainer]}>
                      <Text style={defaultStyle.headerText}>ABOUT BITMARK HEALTH</Text>
                    </View>

                    {/*Version*/}
                    <View style={[defaultStyle.itemNoBorderContainer, style.itemContainer]}>
                      <View style={[defaultStyle.itemBottomBorderContainer]}>
                        <Text style={defaultStyle.text}>Version</Text>
                        <Text style={defaultStyle.textAlignRight}>{DataProcessor.getApplicationVersion()} ({DataProcessor.getApplicationBuildNumber() + (config.network !== 'livenet' ? '-' + config.network : '')})</Text>
                      </View>
                    </View>

                    {/*Support*/}
                    <BitmarkOneTabButtonComponent style={[defaultStyle.itemNoBorderContainer, style.itemContainer]} onPress={() => { this.props.navigation.navigate('Support') }}>
                      <View style={[defaultStyle.itemBottomBorderContainer, { justifyContent: 'space-between', }]}>
                        <Text style={defaultStyle.text}>Support</Text>
                        <Image style={defaultStyle.iconArrowRight} source={require('./../../../../assets/imgs/arrow-right.png')} />
                      </View>
                    </BitmarkOneTabButtonComponent>
                  </View>
                </View>

              </BitmarkOneTabButtonComponent>
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
    rootNavigation: PropTypes.shape({
      navigate: PropTypes.func,
      dispatch: PropTypes.func,
    })
  }),
}
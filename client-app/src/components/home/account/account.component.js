import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, ScrollView, Image,
  Clipboard,
  Platform,
} from 'react-native';

import { EventEmiterService } from "./../../../services";
import accountStyle from './account.component.style';

import { androidDefaultStyle, iosDefaultStyle } from './../../../commons/styles';
import { DataController } from '../../../managers';

let defaultStyle = Platform.select({
  ios: iosDefaultStyle,
  android: androidDefaultStyle
});

export class AccountDetailComponent extends React.Component {
  constructor(props) {
    super(props);
    this.handerChangeUserInfo = this.handerChangeUserInfo.bind(this);

    this.state = {
      accountNumberCopyText: 'COPY',
      notificationUUIDCopyText: 'COPY',
      userInfo: DataController.getUserInformation(),
    };
  }

  componentDidMount() {
    EventEmiterService.on(EventEmiterService.events.CHANGE_USER_INFO, this.handerChangeUserInfo);
  }

  componentWillUnmount() {
    EventEmiterService.remove(EventEmiterService.events.CHANGE_USER_INFO, this.handerChangeUserInfo);
  }

  handerChangeUserInfo() {
    this.setState({ userInfo: DataController.getUserInformation() });
  }

  render() {
    return (
      <View style={accountStyle.body}>
        <View style={defaultStyle.header}>
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
              {/* <TouchableOpacity style={accountStyle.accountRemoveButton} onPress={this.props.screenProps.logout}> */}
              <TouchableOpacity style={accountStyle.accountRemoveButton} onPress={() => { this.props.navigation.navigate('AccountRecovery', { isSignOut: true }) }}>
                <Text style={accountStyle.accountRemoveButtonText}>{'Remove access from this device  »'.toUpperCase()} </Text>
              </TouchableOpacity>
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
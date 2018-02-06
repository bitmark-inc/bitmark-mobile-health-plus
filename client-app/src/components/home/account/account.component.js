import React from 'react';
import PropTypes from 'prop-types';

import {
  View, Text, TouchableOpacity, ScrollView,
  Clipboard,
  Platform,
} from 'react-native';

import { AppService } from "./../../../services";
import accountStyle from './account.component.style';

import { androidDefaultStyle, iosDefaultStyle } from './../../../commons/styles';

let defaultStyle = Platform.select({
  ios: iosDefaultStyle,
  android: androidDefaultStyle
});

const SubTabs = {
  balance: 'Balance',
  settings: 'Settings',
}
export class AccountDetailComponent extends React.Component {
  constructor(props) {
    super(props);
    this.switchSubtab = this.switchSubtab.bind(this);
    this.state = {
      subtab: SubTabs.balance,
      accountNumber: '',
      copyText: 'COPY'
    };
    AppService.getCurrentUser().then((info) => {
      this.setState({ accountNumber: info.bitmarkAccountNumber });
    }).catch((error) => {
      console.log('get current account error :', error);
    });
  }

  switchSubtab(subtab) {
    this.setState({ subtab });
  }

  render() {
    return (
      <View style={accountStyle.body}>
        <View style={defaultStyle.header}>
          <TouchableOpacity style={defaultStyle.headerLeft}></TouchableOpacity>
          <Text style={defaultStyle.headerTitle}>Account</Text>
          <TouchableOpacity style={defaultStyle.headerRight}></TouchableOpacity>
        </View>
        <View style={accountStyle.subTabArea}>
          <TouchableOpacity style={accountStyle.subTabButton} onPress={() => this.switchSubtab(SubTabs.balance)}>
            <View style={accountStyle.subTabButtonArea}>
              <View style={accountStyle.subTabButtonTextArea}>
                <Text style={accountStyle.subTabButtonText}>{SubTabs.balance}</Text>
              </View>
              <View style={[accountStyle.activeSubTabBar, { backgroundColor: this.state.subtab === SubTabs.balance ? '#0060F2' : 'white' }]}></View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={accountStyle.subTabButton} onPress={() => this.switchSubtab(SubTabs.settings)}>
            <View style={accountStyle.subTabButtonArea}>
              <View style={accountStyle.subTabButtonTextArea}>
                <Text style={accountStyle.subTabButtonText}>{SubTabs.settings}</Text>
              </View>
              <View style={[accountStyle.activeSubTabBar, { backgroundColor: this.state.subtab === SubTabs.settings ? '#0060F2' : 'white' }]}></View>
            </View>
          </TouchableOpacity>
        </View>
        <ScrollView style={[accountStyle.scrollSubTabArea, { backgroundColor: this.state.subtab === SubTabs.balance ? '#E5E5E5' : 'white' }]}>
          {this.state.subtab === SubTabs.balance && <View style={accountStyle.contentSubTab}>
          </View>}

          {this.state.subtab === SubTabs.settings && <View style={accountStyle.contentSubTab}>
            <Text style={accountStyle.accountNumberLabel}>My Bitmark Account Number</Text>
            <View style={accountStyle.accountNumberArea}>
              <Text style={accountStyle.accountNumberValue} numberOfLines={1}>{this.state.accountNumber}</Text>
              <TouchableOpacity style={accountStyle.accountNumberCopyButton} onPress={() => {
                Clipboard.setString(this.state.accountNumber);
                this.setState({ copyText: 'COPIED' });
                setTimeout(() => { this.setState({ copyText: 'COPY' }) }, 1000);
              }}>
                <Text style={accountStyle.accountNumberCopyButtonText}>{this.state.copyText}</Text>
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
          </View >}
        </ScrollView>
      </View>
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
  }),
}
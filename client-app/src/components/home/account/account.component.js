import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
  View, Text, TouchableOpacity, ScrollView, Image,
  Clipboard,
  Platform,
  FlatList,
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
      copyText: 'COPY',
      balance: 0,
      balanceHistories: [],
    };
    AppService.getCurrentUser().then((info) => {
      this.setState({ accountNumber: info.bitmarkAccountNumber });
    }).catch((error) => {
      console.log('get current account error :', error);
    });

    AppService.getUserBalance().then(data => {
      console.log('data :', data);
      let balanceHistories = [];
      data.balanceHistories.forEach((history, index) => {
        balanceHistories.push({ key: index, history });
      });
      this.setState({
        balance: data.balance,
        balanceHistories,
      });
    }).catch((error) => {
      console.log('getUserBalance error :', error);
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
            <Image style={accountStyle.marketCardTitleIcon} source={require('./../../../../assets/imgs/totemic-market.png')} />
            <View style={accountStyle.marketBalance}>
              <View style={accountStyle.marketBalanceLabel}>
                <Image style={accountStyle.marketBalanceIcon} source={require('./../../../../assets/imgs/ETH-alt.png')} />
                <Text style={accountStyle.marketBalanceName}>ETH</Text>
                <Text style={accountStyle.marketBalanceNameFull}>(Ethereum)</Text>
              </View>
              <Text style={accountStyle.marketBalanceValue}>{Math.floor(this.state.balance / 1E4) / 1E5}</Text>
            </View>
            <View style={accountStyle.marketBalanceButtonArea}>
              <TouchableOpacity style={accountStyle.marketBalanceButton} onPress={() => { }}>
                <Text style={accountStyle.marketBalanceButtonText}>DEPOSIT</Text>
              </TouchableOpacity>
              <TouchableOpacity style={accountStyle.marketBalanceButton} onPress={() => { }}>
                <Text style={accountStyle.marketBalanceButtonText}>WITHDRAWAL</Text>
              </TouchableOpacity>
            </View>
            <View style={accountStyle.marketBalanceHistory}>
              <Text style={accountStyle.marketBalanceHistoryLabel}>Balance History </Text>
              <FlatList data={this.state.balanceHistories}
                scrollEnabled={false}
                extraData={this.state}
                renderItem={({ item }) => {
                  console.log('item :', item);
                  return (
                    <View style={accountStyle.marketBalanceHistoryItem}>
                      <Text style={accountStyle.marketBalanceHistoryItemAction}>{item.history.action}</Text>
                      <Text style={accountStyle.marketBalanceHistoryItemAmount}>{item.history.data.currency.toUpperCase() + ' ' + (Math.floor(item.history.data.amount / 1E4) / 1E5)}</Text>
                      <Text style={accountStyle.marketBalanceHistoryItemCreatedAt}>{moment(item.history.createdAt).format('YYYY-MM-DD HH:mm:ss')}</Text>
                      <Text style={accountStyle.marketBalanceHistoryItemStatus}>{item.history.status.toUpperCase()}</Text>
                    </View>
                  )
                }}
              />
            </View>
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
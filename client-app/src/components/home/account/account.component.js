import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
  View, Text, TouchableOpacity, ScrollView, Image,
  Clipboard,
  Platform,
  FlatList,
} from 'react-native';

import { MarketService, EventEmiterService } from "./../../../services";
import accountStyle from './account.component.style';

import { androidDefaultStyle, iosDefaultStyle } from './../../../commons/styles';
import { config } from '../../../configs/index';
import { DataController } from '../../../managers';

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
    this.handerChangeLocalBalance = this.handerChangeLocalBalance.bind(this);
    this.handerChangeMarketBalance = this.handerChangeMarketBalance.bind(this);
    this.handerChangeUserInfo = this.handerChangeUserInfo.bind(this);

    let localBalance = DataController.getUserBalance().localBalance;
    //TODO with local balance
    let marketBalances = DataController.getUserBalance().marketBalances;
    for (let market in marketBalances) {
      marketBalances[market].balanceHistories.forEach((item, index) => {
        item.key = index;
      });
    }
    this.state = {
      subtab: config.disabel_markets ? SubTabs.settings : SubTabs.balance,
      markets: DataController.getUserInformation().markets,
      accountNumberCopyText: 'COPY',
      notificationUUIDCopyText: 'COPY',
      localBalance,
      marketBalances,
      userInfo: DataController.getUserInformation(),
    };
  }

  componentDidMount() {
    EventEmiterService.on(EventEmiterService.events.CHANGE_USER_INFO, this.handerChangeUserInfo);
    EventEmiterService.on(EventEmiterService.events.CHANGE_USER_DATA_LOCAL_BALANCE, this.handerChangeLocalBalance);
    EventEmiterService.on(EventEmiterService.events.CHANGE_USER_DATA_MARKET_BALANCE, this.handerChangeMarketBalance);
  }

  componentWillUnmount() {
    EventEmiterService.remove(EventEmiterService.events.CHANGE_USER_INFO, this.handerChangeUserInfo);
    EventEmiterService.remove(EventEmiterService.events.CHANGE_USER_DATA_LOCAL_BALANCE, this.handerChangeLocalBalance);
    EventEmiterService.remove(EventEmiterService.events.CHANGE_USER_DATA_MARKET_BALANCE, this.handerChangeMarketBalance);
  }

  handerChangeUserInfo() {
    this.setState({ userInfo: DataController.getUserInformation() });
  }
  handerChangeLocalBalance() {
    let localBalance = DataController.getUserBalance().localBalannce || {};
    this.setState({ localBalance });
  }

  handerChangeMarketBalance() {
    let marketBalances = DataController.getUserBalance().marketBalances || [];
    for (let market in marketBalances) {
      marketBalances[market].balanceHistories.forEach((item, index) => {
        item.key = index;
      });
    }
    this.setState({ marketBalances });
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
        {!config.disabel_markets && <View style={accountStyle.subTabArea}>
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
        </View>}
        <ScrollView style={[accountStyle.scrollSubTabArea, { backgroundColor: this.state.subtab === SubTabs.balance ? '#E5E5E5' : 'white' }]}>
          {this.state.subtab === SubTabs.balance && !config.disabel_markets && this.state.marketBalances && this.state.marketBalances.totemic &&
            <View style={accountStyle.contentSubTab}>
              <Image style={accountStyle.marketCardTitleIcon} source={config.markets.totemic.sourceIcon} />
              <View style={accountStyle.marketBalance}>
                <View style={accountStyle.marketBalanceLabel}>
                  <Image style={accountStyle.marketBalanceIcon} source={require('./../../../../assets/imgs/ETH-alt.png')} />
                  <Text style={accountStyle.marketBalanceName}>ETH</Text>
                  <Text style={accountStyle.marketBalanceNameFull}>(Ethereum)</Text>
                </View>
                <Text style={accountStyle.marketBalanceValue}>{Math.floor(this.state.marketBalances.totemic.balance / 1E4) / 1E5}</Text>
              </View>
              <View style={accountStyle.marketBalanceButtonArea}>
                <TouchableOpacity style={accountStyle.marketBalanceButton} onPress={() => {
                  this.props.screenProps.homeNavigation.navigate('MarketViewer', {
                    url: MarketService.getBalancUrl(config.markets.totemic.name),
                    name: config.markets.totemic.name.charAt(0).toUpperCase() + config.markets.totemic.name.slice(1)
                  });
                }}>
                  <Text style={accountStyle.marketBalanceButtonText}>DEPOSIT</Text>
                </TouchableOpacity>
                <TouchableOpacity style={accountStyle.marketBalanceButton} onPress={() => {
                  this.props.screenProps.homeNavigation.navigate('MarketViewer', {
                    url: MarketService.getBalancUrl(config.markets.totemic.name),
                    name: config.markets.totemic.name.charAt(0).toUpperCase() + config.markets.totemic.name.slice(1)
                  });
                }}>
                  <Text style={accountStyle.marketBalanceButtonText}>WITHDRAWAL</Text>
                </TouchableOpacity>
              </View>
              <View style={accountStyle.marketBalanceHistory}>
                <Text style={accountStyle.marketBalanceHistoryLabel}>Balance History </Text>
                <FlatList data={this.state.marketBalances.totemic.balanceHistories}
                  scrollEnabled={false}
                  extraData={this.state}
                  renderItem={({ item }) => {
                    return (
                      <View style={accountStyle.marketBalanceHistoryItem}>
                        <Text style={accountStyle.marketBalanceHistoryItemAction}>{item.action}</Text>
                        <Text style={accountStyle.marketBalanceHistoryItemAmount}>{item.data.currency.toUpperCase() + ' ' + (Math.floor(item.data.amount / 1E4) / 1E5)}</Text>
                        <Text style={accountStyle.marketBalanceHistoryItemCreatedAt}>{moment(item.createdAt).format('YYYY-MM-DD HH:mm:ss')}</Text>
                        <Text style={accountStyle.marketBalanceHistoryItemStatus}>{item.status.toUpperCase()}</Text>
                      </View>
                    )
                  }}
                />
              </View>
            </View>}
          {this.state.subtab === SubTabs.balance && config.disabel_markets && <View style={accountStyle.contentSubTab}>
            <Text style={{
              marginTop: 30,
              marginLeft: 20,
              fontFamily: 'Avenir Black',
              fontWeight: '900',
              fontSize: 16,
              lineHeight: 18,
              color: '#0060F2'
            }}>{'Coming soon...'.toUpperCase()} </Text>
          </View>}

          {this.state.subtab === SubTabs.settings && <View style={accountStyle.contentSubTab}>
            <Text style={accountStyle.accountNumberLabel}>My Bitmark Account Number</Text>
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
          </View >}


          <Text style={accountStyle.accountNumberLabel}>My Device Notification UUID :</Text>
          <View style={accountStyle.accountNumberArea}>
            <Text style={accountStyle.accountNumberValue} numberOfLines={1}>{this.state.userInfo.notificationUID}</Text>
            <TouchableOpacity style={accountStyle.accountNumberCopyButton} onPress={() => {
              Clipboard.setString(this.state.userInfo.notificationUID);
              this.setState({ notificationUUIDCopyText: 'COPIED' });
              setTimeout(() => { this.setState({ notificationUUIDCopyText: 'COPY' }) }, 1000);
            }}>
              <Text style={accountStyle.accountNumberCopyButtonText}>{this.state.notificationUUIDCopyText}</Text>
            </TouchableOpacity>
          </View>
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
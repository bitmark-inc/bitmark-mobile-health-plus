import React from 'react';
import PropTypes from 'prop-types';
import {
  View, TouchableOpacity, Image, Text,
} from 'react-native';
import { NavigationActions } from 'react-navigation';

import { AccountComponent } from './account';
import { MarketsComponent } from './markets';
import { AssetsComponent } from './properties';
import { TransactionsComponent } from './transactions';


import userStyle from './user.component.style';
import { config } from '../../configs';
import { AppController, DataController } from '../../managers';
import { EventEmiterService } from '../../services';

const MainTabs = {
  properties: 'Properties',
  transaction: 'Transactions',
  markets: 'Markets',
  account: 'Account',
};


export class UserComponent extends React.Component {
  constructor(props) {
    super(props);
    this.logout = this.logout.bind(this);
    this.handerChangePendingTransactions = this.handerChangePendingTransactions.bind(this);

    this.state = {
      mainTab: MainTabs.properties,
      transactionNumber: DataController.getSignRequests().pendingTransactions.length,
    };
  }

  componentDidMount() {
    EventEmiterService.on(EventEmiterService.events.CHANGE_USER_DATA_PENDING_TRANSACTIONS, this.handerChangePendingTransactions);
  }

  componentWillUnmount() {
    EventEmiterService.remove(EventEmiterService.events.CHANGE_USER_DATA_PENDING_TRANSACTIONS, this.handerChangePendingTransactions);
  }

  handerChangePendingTransactions() {
    this.setState({ transactionNumber: DataController.getSignRequests().pendingTransactions.length, });
  }


  logout() {
    AppController.doLogout().then(() => {
      const resetMainPage = NavigationActions.reset({
        index: 0,
        actions: [NavigationActions.navigate({ routeName: 'Main', params: { justCreatedBitmarkAccount: true } })]
      });
      this.props.screenProps.rootNavigation.dispatch(resetMainPage);
    }).catch((error) => {
      console.log('log out error :', error);
    });
  }

  render() {
    return (
      <View style={userStyle.body}>
        {this.state.mainTab === MainTabs.properties && <AssetsComponent screenProps={{
          homeNavigation: this.props.navigation,
        }} />}
        {this.state.mainTab === MainTabs.markets && <MarketsComponent screenProps={{
          homeNavigation: this.props.navigation,
        }} />}
        {this.state.mainTab === MainTabs.transaction && <TransactionsComponent screenProps={{
          homeNavigation: this.props.navigation,
        }} />}
        {this.state.mainTab === MainTabs.account && <View style={{ width: '100%', flex: 1, }}>
          <AccountComponent screenProps={{
            homeNavigation: this.props.navigation,
            logout: this.logout
          }} />
        </View>
        }

        <View style={userStyle.bottomTabArea}>
          <TouchableOpacity style={userStyle.bottomTabButton} onPress={() => this.setState({ mainTab: MainTabs.properties })}>
            <Image style={userStyle.bottomTabButtonIcon} source={this.state.mainTab === MainTabs.properties
              ? require('./../../../assets/imgs/properties-icon-enable.png')
              : require('./../../../assets/imgs/properties-icon-disable.png')} />
          </TouchableOpacity>
          <TouchableOpacity style={userStyle.bottomTabButton} onPress={() => this.setState({ mainTab: MainTabs.transaction })}>
            {this.state.transactionNumber > 0 && <View style={userStyle.transactionNumber}>
              <Text style={userStyle.transactionNumberText}>{this.state.transactionNumber}</Text>
            </View>}
            <Image style={userStyle.bottomTabButtonIcon} source={this.state.mainTab === MainTabs.transaction
              ? require('./../../../assets/imgs/transaction-icon-enable.png')
              : require('./../../../assets/imgs/transaction-icon-disable.png')} />
          </TouchableOpacity>
          {!config.disabel_markets && <TouchableOpacity style={userStyle.bottomTabButton} onPress={() => this.setState({ mainTab: MainTabs.markets })}>
            <Image style={userStyle.bottomTabButtonIcon} source={this.state.mainTab === MainTabs.markets
              ? require('./../../../assets/imgs/markets-icon-enable.png')
              : require('./../../../assets/imgs/markets-icon-disable.png')} />
          </TouchableOpacity>}
          <TouchableOpacity style={userStyle.bottomTabButton} onPress={() => this.setState({ mainTab: MainTabs.account })}>
            <Image style={userStyle.bottomTabButtonIcon} source={this.state.mainTab === MainTabs.account
              ? require('./../../../assets/imgs/account-icon-enable.png')
              : require('./../../../assets/imgs/account-icon-disable.png')} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

UserComponent.propTypes = {
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
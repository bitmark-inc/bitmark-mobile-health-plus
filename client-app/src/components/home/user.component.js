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
import { EventEmiterService, TransactionService, BitmarkService } from '../../services';

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
    this.switchMainTab = this.switchMainTab.bind(this);
    this.handerChangeActiveIncomingTransferOffer = this.handerChangeActiveIncomingTransferOffer.bind(this);
    this.handerReceivedNotification = this.handerReceivedNotification.bind(this);

    this.state = {
      displayedTab: {
        mainTab: MainTabs.properties,
        subTab: null,
      },
      transactionNumber: DataController.getTransactionData().activeIncompingTransferOffers.length,
    };
  }

  componentDidMount() {
    EventEmiterService.on(EventEmiterService.events.CHANGE_USER_DATA_ACTIVE_INCOMING_TRANSFER_OFFER, this.handerChangeActiveIncomingTransferOffer);
    EventEmiterService.on(EventEmiterService.events.APP_RECEIVED_NOTIFICATION, this.handerReceivedNotification);
  }

  componentWillUnmount() {
    EventEmiterService.remove(EventEmiterService.events.CHANGE_USER_DATA_ACTIVE_INCOMING_TRANSFER_OFFER, this.handerChangeActiveIncomingTransferOffer);
    EventEmiterService.remove(EventEmiterService.events.APP_RECEIVED_NOTIFICATION, this.handerReceivedNotification);
  }

  handerChangeActiveIncomingTransferOffer() {
    this.setState({ transactionNumber: DataController.getTransactionData().activeIncompingTransferOffers.length, });
  }

  switchMainTab(mainTab) {
    let displayedTab = { mainTab, subTab: null };
    this.setState({ displayedTab });
  }

  handerReceivedNotification(data) {
    console.log('UserComponent handerReceivedNotification data :', data);
    if (data.event === 'transfer_required' && data.bitmark_id) {
      AppController.doGetTransactionData().then(() => {
        return TransactionService.doGetTransferOfferDetail(data.bitmark_id);
      }).then(transferOfferDetail => {
        this.props.navigation.navigate('TransactionDetail', {
          transferOffer: transferOfferDetail,
          refreshTransactionScreen: () => {
            AppController.doGetTransactionData().then(() => {
            }).catch((error) => {
              console.log('AppController.doGetTransactionData error :', error);
            });
            this.switchMainTab(MainTabs.transaction);
          }
        })
      }).catch(error => {
        console.log('handerReceivedNotification transfer_required error :', error);
      });
    } else if (data.event === 'transfer_rejected') {
      AppController.doGetBitmarks().then(() => {
        let bitmarkInformation = DataController.getLocalBitmarkInformation(data.bitmark_id);
        this.props.navigation.navigate('LocalPropertyDetail', { asset: bitmarkInformation.asset, bitmark: bitmarkInformation.bitmark });
      }).catch(error => {
        console.log('handerReceivedNotification transfer_rejected error :', error);
      });
    } else if (data.event === 'transfer_completed') {
      this.setState({ displayedTab: { mainTab: MainTabs.transaction, subTab: 'COMPLETED' } });
    } else if (data.event === 'transfer_failed') {
      AppController.doGetBitmarks().then(() => {
        let bitmarkInformation = DataController.getLocalBitmarkInformation(data.bitmark_id);
        this.props.navigation.navigate('LocalPropertyDetail', { asset: bitmarkInformation.asset, bitmark: bitmarkInformation.bitmark });
      }).catch(error => {
        console.log('handerReceivedNotification transfer_rejected error :', error);
      });
    }
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
        {this.state.displayedTab.mainTab === MainTabs.properties && <AssetsComponent screenProps={{
          homeNavigation: this.props.navigation,
        }} />}
        {this.state.displayedTab.mainTab === MainTabs.markets && <MarketsComponent screenProps={{
          homeNavigation: this.props.navigation,
        }} />}
        {this.state.displayedTab.mainTab === MainTabs.transaction && <TransactionsComponent screenProps={{
          homeNavigation: this.props.navigation,
          subTab: this.state.subTab,
        }} />}
        {this.state.displayedTab.mainTab === MainTabs.account && <View style={{ width: '100%', flex: 1, }}>
          <AccountComponent screenProps={{
            homeNavigation: this.props.navigation,
            logout: this.logout
          }} />
        </View>
        }

        <View style={userStyle.bottomTabArea}>
          <TouchableOpacity style={userStyle.bottomTabButton} onPress={() => this.switchMainTab(MainTabs.properties)}>
            <Image style={userStyle.bottomTabButtonIcon} source={this.state.displayedTab.mainTab === MainTabs.properties
              ? require('./../../../assets/imgs/properties-icon-enable.png')
              : require('./../../../assets/imgs/properties-icon-disable.png')} />
          </TouchableOpacity>
          <TouchableOpacity style={userStyle.bottomTabButton} onPress={() => this.switchMainTab(MainTabs.transaction)}>
            {this.state.transactionNumber > 0 && <View style={userStyle.transactionNumber}>
              <Text style={userStyle.transactionNumberText}>{this.state.transactionNumber}</Text>
            </View>}
            <Image style={userStyle.bottomTabButtonIcon} source={this.state.displayedTab.mainTab === MainTabs.transaction
              ? require('./../../../assets/imgs/transaction-icon-enable.png')
              : require('./../../../assets/imgs/transaction-icon-disable.png')} />
          </TouchableOpacity>
          {!config.disabel_markets && <TouchableOpacity style={userStyle.bottomTabButton} onPress={() => this.switchMainTab(MainTabs.markets)}>
            <Image style={userStyle.bottomTabButtonIcon} source={this.state.displayedTab.mainTab === MainTabs.markets
              ? require('./../../../assets/imgs/markets-icon-enable.png')
              : require('./../../../assets/imgs/markets-icon-disable.png')} />
          </TouchableOpacity>}
          <TouchableOpacity style={userStyle.bottomTabButton} onPress={() => this.switchMainTab(MainTabs.account)}>
            <Image style={userStyle.bottomTabButtonIcon} source={this.state.displayedTab.mainTab === MainTabs.account
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
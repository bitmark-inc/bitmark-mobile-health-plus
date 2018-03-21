import React from 'react';
import PropTypes from 'prop-types';
import {
  View, TouchableOpacity, Image, Text,
} from 'react-native';
import { NavigationActions } from 'react-navigation';

import { AccountComponent } from './account';
import { AssetsComponent } from './properties';
import { TransactionsComponent } from './transactions';
import { DonationComponent } from './donation';


import userStyle from './user.component.style';
import { AppController, DataController } from '../../managers';
import { EventEmiterService } from '../../services';

const MainTabs = {
  properties: 'Properties',
  transaction: 'Transactions',
  donation: 'Donation',
  account: 'Account',
};

export class UserComponent extends React.Component {
  constructor(props) {
    super(props);
    this.logout = this.logout.bind(this);
    this.reloadData = this.reloadData.bind(this);
    this.switchMainTab = this.switchMainTab.bind(this);
    this.handerChangeActiveIncomingTransferOffer = this.handerChangeActiveIncomingTransferOffer.bind(this);
    this.handerReceivedNotification = this.handerReceivedNotification.bind(this);

    let subTab;
    let subTab2;
    let mainTab = MainTabs.properties;
    if (this.props.navigation.state && this.props.navigation.state.params && this.props.navigation.state.params.displayedTab) {
      mainTab = this.props.navigation.state.params.displayedTab.mainTab;
      if (mainTab !== MainTabs.properties && mainTab !== MainTabs.transaction && mainTab !== MainTabs.account && mainTab !== MainTabs.donation) {
        mainTab = MainTabs.properties;
      }
      subTab = this.props.navigation.state.params.displayedTab.subTab;
      subTab2 = this.props.navigation.state.params.displayedTab.subTab2;
      console.log('mainTab , subTab :', mainTab, subTab);
    }
    this.state = {
      displayedTab: {
        mainTab,
        subTab,
        subTab2,
      },
      transactionNumber: DataController.getTransactionData().activeIncompingTransferOffers.length,
    };
  }

  componentDidMount() {
    EventEmiterService.on(EventEmiterService.events.CHANGE_USER_DATA_ACTIVE_INCOMING_TRANSFER_OFFER, this.handerChangeActiveIncomingTransferOffer);
    EventEmiterService.on(EventEmiterService.events.APP_RECEIVED_NOTIFICATION, this.handerReceivedNotification);
    EventEmiterService.on(EventEmiterService.events.NEED_RELOAD_DATA, this.reloadData);
  }

  componentWillUnmount() {
    EventEmiterService.remove(EventEmiterService.events.CHANGE_USER_DATA_ACTIVE_INCOMING_TRANSFER_OFFER, this.handerChangeActiveIncomingTransferOffer);
    EventEmiterService.remove(EventEmiterService.events.APP_RECEIVED_NOTIFICATION, this.handerReceivedNotification);
    EventEmiterService.remove(EventEmiterService.events.NEED_RELOAD_DATA, this.reloadData);
  }

  handerChangeActiveIncomingTransferOffer() {
    this.setState({ transactionNumber: DataController.getTransactionData().activeIncompingTransferOffers.length, });
  }

  reloadData() {
    AppController.doReloadData();
  }

  switchMainTab(mainTab) {
    let displayedTab = { mainTab, subTab: null, subTab2: null };
    this.setState({ displayedTab });
  }

  handerReceivedNotification(data) {
    console.log('UserComponent handerReceivedNotification data :', data);
    if (data.event === 'transfer_request' && data.bitmark_id) {
      AppController.doGetTransactionData().then(() => {
        return AppController.doGetTransferOfferDetail(data.bitmark_id);
      }).then(transferOfferDetail => {
        const resetHomePage = NavigationActions.reset({
          index: 1,
          actions: [
            NavigationActions.navigate({ routeName: 'User' }),
            NavigationActions.navigate({
              routeName: 'TransactionDetail',
              params: {
                transferOffer: transferOfferDetail,
                refreshTransactionScreen: () => {
                  AppController.doGetTransactionData().then(() => {
                  }).catch((error) => {
                    console.log('AppController.doGetTransactionData error :', error);
                  });
                  this.switchMainTab(MainTabs.transaction);
                }
              }
            }),
          ]
        });
        this.props.navigation.dispatch(resetHomePage);
      }).catch(error => {
        console.log('handerReceivedNotification transfer_required error :', error);
      });
    } else if (data.event === 'transfer_rejected') {
      AppController.reloadBitmarks().then(() => {
        let bitmarkInformation = DataController.getLocalBitmarkInformation(data.bitmark_id);
        const resetHomePage = NavigationActions.reset({
          index: 1,
          actions: [
            NavigationActions.navigate({ routeName: 'User' }),
            NavigationActions.navigate({
              routeName: 'LocalPropertyDetail',
              params: { asset: bitmarkInformation.asset, bitmark: bitmarkInformation.bitmark }
            }),
          ]
        });
        this.props.navigation.dispatch(resetHomePage);
      }).catch(error => {
        console.log('handerReceivedNotification transfer_rejected error :', error);
      });
    } else if (data.event === 'transfer_completed' || data.event === 'transfer_accepted') {
      const resetHomePage = NavigationActions.reset({
        index: 0,
        actions: [
          NavigationActions.navigate({
            routeName: 'User', params: {
              displayedTab: { mainTab: MainTabs.transaction, subTab: 'COMPLETED' }
            }
          }),
        ]
      });
      this.props.navigation.dispatch(resetHomePage);
    } else if (data.event === 'transfer_failed') {
      AppController.reloadBitmarks().then(() => {
        let bitmarkInformation = DataController.getLocalBitmarkInformation(data.bitmark_id);
        const resetHomePage = NavigationActions.reset({
          index: 1,
          actions: [
            NavigationActions.navigate({ routeName: 'User' }),
            NavigationActions.navigate({
              routeName: 'LocalPropertyDetail',
              params: { asset: bitmarkInformation.asset, bitmark: bitmarkInformation.bitmark }
            }),
          ]
        });
        this.props.navigation.dispatch(resetHomePage);
      }).catch(error => {
        console.log('handerReceivedNotification transfer_rejected error :', error);
      });
    }
  }

  logout() {
    AppController.doLogout().then(() => {
      const resetMainPage = NavigationActions.reset({
        index: 0,
        actions: [NavigationActions.navigate({ routeName: 'Main' })]
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
        {this.state.displayedTab.mainTab === MainTabs.transaction && <TransactionsComponent screenProps={{
          homeNavigation: this.props.navigation,
          subTab: this.state.displayedTab.subTab,
        }} />}
        {this.state.displayedTab.mainTab === MainTabs.donation && <DonationComponent screenProps={{
          homeNavigation: this.props.navigation,
          subTab: this.state.displayedTab.subTab,
          subTab2: this.state.displayedTab.subTab2,
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
            {this.state.displayedTab.mainTab === MainTabs.properties && <Text style={userStyle.bottomTabButtonText}>{MainTabs.properties}</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={userStyle.bottomTabButton} onPress={() => this.switchMainTab(MainTabs.transaction)}>
            {this.state.transactionNumber > 0 && <View style={[userStyle.transactionNumber, { top: this.state.displayedTab.mainTab === MainTabs.transaction ? 2 : 5 }]}>
              <Text style={userStyle.transactionNumberText}>{this.state.transactionNumber}</Text>
            </View>}
            <Image style={userStyle.bottomTabButtonIcon} source={this.state.displayedTab.mainTab === MainTabs.transaction
              ? require('./../../../assets/imgs/transaction-icon-enable.png')
              : require('./../../../assets/imgs/transaction-icon-disable.png')} />
            {this.state.displayedTab.mainTab === MainTabs.transaction && <Text style={userStyle.bottomTabButtonText}>{MainTabs.transaction}</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={userStyle.bottomTabButton} onPress={() => this.switchMainTab(MainTabs.donation)}>
            {this.state.donationNumber > 0 && <View style={[userStyle.donationNumber, { top: this.state.displayedTab.mainTab === MainTabs.donation ? 2 : 5 }]}>
              <Text style={userStyle.donationNumberText}>{this.state.donationNumber}</Text>
            </View>}
            <Image style={userStyle.bottomTabButtonIcon} source={this.state.displayedTab.mainTab === MainTabs.donation
              ? require('./../../../assets/imgs/donation-icon-enable.png')
              : require('./../../../assets/imgs/donation-icon-disable.png')} />
            {this.state.displayedTab.mainTab === MainTabs.donation && <Text style={userStyle.bottomTabButtonText}>{MainTabs.donation}</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={userStyle.bottomTabButton} onPress={() => this.switchMainTab(MainTabs.account)}>
            <Image style={userStyle.bottomTabButtonIcon} source={this.state.displayedTab.mainTab === MainTabs.account
              ? require('./../../../assets/imgs/account-icon-enable.png')
              : require('./../../../assets/imgs/account-icon-disable.png')} />
            {this.state.displayedTab.mainTab === MainTabs.account && <Text style={userStyle.bottomTabButtonText}>{MainTabs.account}</Text>}
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
    dispatch: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.shape({
        displayedTab: PropTypes.shape({
          mainTab: PropTypes.string,
          subTab: PropTypes.string,
          subTab2: PropTypes.string,
        }),
      }),
    }),
  }),
  screenProps: PropTypes.shape({
    rootNavigation: PropTypes.shape({
      navigate: PropTypes.func,
      dispatch: PropTypes.func,
    })
  }),
}
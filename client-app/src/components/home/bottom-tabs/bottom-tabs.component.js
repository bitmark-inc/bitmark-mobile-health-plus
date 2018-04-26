import React from 'react';
import PropTypes from 'prop-types';
import {
  View, TouchableOpacity, Image, Text,
} from 'react-native';
import { NavigationActions } from 'react-navigation';

import userStyle from './bottom-tabs.component.style';
import { EventEmiterService, NotificationService } from '../../../services';
import { DataController } from '../../../managers';

const MainTabs = {
  properties: 'Properties',
  transaction: 'Transactions',
  donation: 'Donation',
  account: 'Account',
};

export class BottomTabsComponent extends React.Component {
  static MainTabs = MainTabs;

  constructor(props) {
    super(props);
    this.handerChangeActiveIncomingTransferOffer = this.handerChangeActiveIncomingTransferOffer.bind(this);
    this.handerDonationInformationChange = this.handerDonationInformationChange.bind(this);
    this.handerChangeLocalBitmarks = this.handerChangeLocalBitmarks.bind(this);
    this.handerChangeTrackingBitmarks = this.handerChangeTrackingBitmarks.bind(this);
    this.switchMainTab = this.switchMainTab.bind(this);

    let localAssets = DataController.getUserBitmarks().localAssets || [];
    let haveNewBitmark = localAssets.findIndex(asset => !asset.isViewed) >= 0;
    let transactionNumber = (DataController.getTransactionData().activeIncompingTransferOffers ? DataController.getTransactionData().activeIncompingTransferOffers.length : 0) +
      (DataController.getDonationInformation().totalTodoTask ? DataController.getDonationInformation().totalTodoTask : 0) +
      (DataController.getIftttInformation().bitmarkFiles ? DataController.getIftttInformation().bitmarkFiles.length : 0);
    let { trackingBitmarks } = DataController.getTrackingBitmarks();
    this.state = {
      mainTab: this.props.mainTab,
      haveNewBitmark,
      transactionNumber,
      existNewTracking: (trackingBitmarks || []).findIndex(bm => !bm.isViewed) >= 0,
    };
    NotificationService.setApplicationIconBadgeNumber(transactionNumber);
  }

  componentDidMount() {
    EventEmiterService.on(EventEmiterService.events.CHANGE_USER_DATA_ACTIVE_INCOMING_TRANSFER_OFFER, this.handerChangeActiveIncomingTransferOffer);
    EventEmiterService.on(EventEmiterService.events.CHANGE_USER_DATA_DONATION_INFORMATION, this.handerDonationInformationChange);
    EventEmiterService.on(EventEmiterService.events.CHANGE_USER_DATA_LOCAL_BITMARKS, this.handerChangeLocalBitmarks);
    EventEmiterService.on(EventEmiterService.events.CHANGE_USER_DATA_TRACKING_BITMARKS, this.handerChangeTrackingBitmarks);
  }

  componentWillUnmount() {
    EventEmiterService.remove(EventEmiterService.events.CHANGE_USER_DATA_ACTIVE_INCOMING_TRANSFER_OFFER, this.handerChangeActiveIncomingTransferOffer);
    EventEmiterService.remove(EventEmiterService.events.CHANGE_USER_DATA_DONATION_INFORMATION, this.handerDonationInformationChange);
    EventEmiterService.on(EventEmiterService.events.CHANGE_USER_DATA_LOCAL_BITMARKS, this.handerChangeLocalBitmarks);
    EventEmiterService.remove(EventEmiterService.events.CHANGE_USER_DATA_TRACKING_BITMARKS, this.handerChangeTrackingBitmarks);
  }

  handerChangeActiveIncomingTransferOffer() {
    let transactionNumber = (DataController.getTransactionData().activeIncompingTransferOffers ? DataController.getTransactionData().activeIncompingTransferOffers.length : 0) +
      (DataController.getDonationInformation().totalTodoTask ? DataController.getDonationInformation().totalTodoTask : 0) +
      (DataController.getIftttInformation().bitmarkFiles ? DataController.getIftttInformation().bitmarkFiles.length : 0);
    this.setState({ transactionNumber });
    NotificationService.setApplicationIconBadgeNumber(transactionNumber);
  }

  handerDonationInformationChange() {
    let transactionNumber = (DataController.getTransactionData().activeIncompingTransferOffers ? DataController.getTransactionData().activeIncompingTransferOffers.length : 0) +
      (DataController.getDonationInformation().totalTodoTask ? DataController.getDonationInformation().totalTodoTask : 0) +
      (DataController.getIftttInformation().bitmarkFiles ? DataController.getIftttInformation().bitmarkFiles.length : 0);
    this.setState({ transactionNumber });
    NotificationService.setApplicationIconBadgeNumber(transactionNumber);
  }
  handerChangeLocalBitmarks() {
    let localAssets = DataController.getUserBitmarks().localAssets || [];
    let haveNewBitmark = localAssets.findIndex(asset => !asset.isViewed) >= 0;
    this.setState({ haveNewBitmark });
  }
  handerChangeTrackingBitmarks() {
    let { trackingBitmarks } = DataController.getTrackingBitmarks();
    this.setState({ existNewTracking: (trackingBitmarks || []).findIndex(bm => !bm.isViewed) >= 0 });
  }

  switchMainTab(mainTab) {
    const resetHomePage = NavigationActions.reset({
      index: 0,
      actions: [
        NavigationActions.navigate({
          routeName: 'User', params: {
            displayedTab: { mainTab }
          }
        }),
      ]
    });
    this.props.homeNavigation.dispatch(resetHomePage);
  }

  render() {
    return (
      <View style={userStyle.bottomTabArea}>
        <TouchableOpacity style={userStyle.bottomTabButton} onPress={() => this.switchMainTab(MainTabs.properties)}>
          {(this.state.haveNewBitmark || this.state.existNewTracking) && <View style={userStyle.haveNewBitmark} />}
          <Image style={userStyle.bottomTabButtonIcon} source={this.state.mainTab === MainTabs.properties
            ? require('./../../../../assets/imgs/properties-icon-enable.png')
            : require('./../../../../assets/imgs/properties-icon-disable.png')} />
          <Text style={[userStyle.bottomTabButtonText, {
            color: this.state.mainTab === MainTabs.properties ? '#0060F2' : '#A4B5CD'
          }]}>{MainTabs.properties}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={userStyle.bottomTabButton} onPress={() => this.switchMainTab(MainTabs.transaction)}>
          {this.state.transactionNumber > 0 && <View style={userStyle.transactionNumber}>
            <Text style={userStyle.transactionNumberText}>{this.state.transactionNumber < 100 ? this.state.transactionNumber : 99}</Text>
          </View>}
          <Image style={userStyle.bottomTabButtonIcon} source={this.state.mainTab === MainTabs.transaction
            ? require('./../../../../assets/imgs/transaction-icon-enable.png')
            : require('./../../../../assets/imgs/transaction-icon-disable.png')} />
          <Text style={[userStyle.bottomTabButtonText, {
            color: this.state.mainTab === MainTabs.transaction ? '#0060F2' : '#A4B5CD'
          }]}>{MainTabs.transaction}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={userStyle.bottomTabButton} onPress={() => this.switchMainTab(MainTabs.donation)}>
          <Image style={userStyle.bottomTabButtonIcon} source={this.state.mainTab === MainTabs.donation
            ? require('./../../../../assets/imgs/donation-icon-enable.png')
            : require('./../../../../assets/imgs/donation-icon-disable.png')} />
          <Text style={[userStyle.bottomTabButtonText, {
            color: this.state.mainTab === MainTabs.donation ? '#0060F2' : '#A4B5CD'
          }]}>{MainTabs.donation}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={userStyle.bottomTabButton} onPress={() => this.switchMainTab(MainTabs.account)}>
          <Image style={userStyle.bottomTabButtonIcon} source={this.state.mainTab === MainTabs.account
            ? require('./../../../../assets/imgs/account-icon-enable.png')
            : require('./../../../../assets/imgs/account-icon-disable.png')} />
          <Text style={[userStyle.bottomTabButtonText, {
            color: this.state.mainTab === MainTabs.account ? '#0060F2' : '#A4B5CD'
          }]}>{MainTabs.account}</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

BottomTabsComponent.propTypes = {
  mainTab: PropTypes.string,
  switchMainTab: PropTypes.func,
  homeNavigation: PropTypes.shape({
    dispatch: PropTypes.func,
  }),
}
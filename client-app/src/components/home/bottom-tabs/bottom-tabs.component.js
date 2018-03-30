import React from 'react';
import PropTypes from 'prop-types';
import {
  View, TouchableOpacity, Image, Text,
} from 'react-native';

import userStyle from './bottom-tabs.component.style';
import { EventEmiterService } from '../../../services';
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

    this.state = {
      mainTab: this.props.mainTab,
      transactionNumber: DataController.getTransactionData().activeIncompingTransferOffers.length,
      donationInformation: DataController.getDonationInformation(),
    };
  }

  componentDidMount() {
    EventEmiterService.on(EventEmiterService.events.CHANGE_USER_DATA_ACTIVE_INCOMING_TRANSFER_OFFER, this.handerChangeActiveIncomingTransferOffer);
    EventEmiterService.on(EventEmiterService.events.CHANGE_USER_DATA_DONATION_INFORMATION, this.handerDonationInformationChange);

  }

  componentWillUnmount() {
    EventEmiterService.remove(EventEmiterService.events.CHANGE_USER_DATA_ACTIVE_INCOMING_TRANSFER_OFFER, this.handerChangeActiveIncomingTransferOffer);
    EventEmiterService.remove(EventEmiterService.events.CHANGE_USER_DATA_DONATION_INFORMATION, this.handerDonationInformationChange);
  }

  handerChangeActiveIncomingTransferOffer() {
    this.setState({ transactionNumber: DataController.getTransactionData().activeIncompingTransferOffers.length, });
  }

  handerDonationInformationChange() {
    this.setState({ donationInformation: DataController.getDonationInformation() })
  }

  switchMainTab(mainTab) {
    this.setState({ mainTab });
    this.props.switchMainTab(mainTab);
  }

  render() {
    return (
      <View style={userStyle.bottomTabArea}>
        <TouchableOpacity style={userStyle.bottomTabButton} onPress={() => this.switchMainTab(MainTabs.properties)}>
          <Image style={userStyle.bottomTabButtonIcon} source={this.state.mainTab === MainTabs.properties
            ? require('./../../../../assets/imgs/properties-icon-enable.png')
            : require('./../../../../assets/imgs/properties-icon-disable.png')} />
          {this.state.mainTab === MainTabs.properties && <Text style={userStyle.bottomTabButtonText}>{MainTabs.properties}</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={userStyle.bottomTabButton} onPress={() => this.switchMainTab(MainTabs.transaction)}>
          {this.state.transactionNumber > 0 && <View style={[userStyle.transactionNumber, { top: this.state.mainTab === MainTabs.transaction ? 2 : 5 }]}>
            <Text style={userStyle.transactionNumberText}>{this.state.transactionNumber}</Text>
          </View>}
          <Image style={userStyle.bottomTabButtonIcon} source={this.state.mainTab === MainTabs.transaction
            ? require('./../../../../assets/imgs/transaction-icon-enable.png')
            : require('./../../../../assets/imgs/transaction-icon-disable.png')} />
          {this.state.mainTab === MainTabs.transaction && <Text style={userStyle.bottomTabButtonText}>{MainTabs.transaction}</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={userStyle.bottomTabButton} onPress={() => this.switchMainTab(MainTabs.donation)}>
          {this.state.donationInformation.totalTodoTask > 0 && <View style={[userStyle.donationNumber, { top: this.state.mainTab === MainTabs.donation ? 2 : 5 }]}>
            <Text style={userStyle.donationNumberText}>{this.state.donationInformation.totalTodoTask}</Text>
          </View>}
          <Image style={userStyle.bottomTabButtonIcon} source={this.state.mainTab === MainTabs.donation
            ? require('./../../../../assets/imgs/donation-icon-enable.png')
            : require('./../../../../assets/imgs/donation-icon-disable.png')} />
          {this.state.mainTab === MainTabs.donation && <Text style={userStyle.bottomTabButtonText}>{MainTabs.donation}</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={userStyle.bottomTabButton} onPress={() => this.switchMainTab(MainTabs.account)}>
          <Image style={userStyle.bottomTabButtonIcon} source={this.state.mainTab === MainTabs.account
            ? require('./../../../../assets/imgs/account-icon-enable.png')
            : require('./../../../../assets/imgs/account-icon-disable.png')} />
          {this.state.mainTab === MainTabs.account && <Text style={userStyle.bottomTabButtonText}>{MainTabs.account}</Text>}
        </TouchableOpacity>
      </View>
    );
  }
}

BottomTabsComponent.propTypes = {
  mainTab: PropTypes.string,
  switchMainTab: PropTypes.func.isRequired,
}
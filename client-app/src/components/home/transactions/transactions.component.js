import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, ScrollView, FlatList, Image,
  Platform,
} from 'react-native';

import { DataController, AppController } from './../../../managers';

import transactionsStyle from './transactions.component.style';
import { androidDefaultStyle, iosDefaultStyle } from './../../../commons/styles';
import { EventEmiterService } from '../../../services';

let defaultStyle = Platform.select({
  ios: iosDefaultStyle,
  android: androidDefaultStyle
});

const SubTabs = {
  required: 'ACTION REQUIRED',
  completed: 'COMPLETED',
}
export class TransactionsComponent extends React.Component {
  static SubTabs = SubTabs;
  constructor(props) {
    super(props);
    this.switchSubtab = this.switchSubtab.bind(this);
    this.handerChangePendingTransactions = this.handerChangePendingTransactions.bind(this);
    this.handerChangeCompletedTransaction = this.handerChangeCompletedTransaction.bind(this);
    this.refreshTransactionScreen = this.refreshTransactionScreen.bind(this);

    let transactionData = DataController.getTransactionData();
    transactionData.activeIncompingTransferOffers.forEach((item, key) => {
      item.key = key;
    });
    transactionData.transactions.forEach((item, key) => {
      item.key = key;
    });
    this.state = {
      currentUser: DataController.getUserInformation(),
      subtab: (this.props.subtab === SubTabs.required || this.props.subtab === SubTabs.completed) ? this.props.subtab : SubTabs.required,
      activeIncompingTransferOffers: transactionData.activeIncompingTransferOffers,
      transactions: transactionData.transactions,
    };
  }

  componentDidMount() {
    this.switchSubtab(this.state.subtab);
    EventEmiterService.on(EventEmiterService.events.CHANGE_USER_DATA_TRANSACTIONS, this.handerChangeCompletedTransaction);
    EventEmiterService.on(EventEmiterService.events.CHANGE_USER_DATA_ACTIVE_INCOMING_TRANSFER_OFFER, this.handerChangePendingTransactions);
  }

  componentWillUnmount() {
    EventEmiterService.remove(EventEmiterService.events.CHANGE_USER_DATA_TRANSACTIONS, this.handerChangeCompletedTransaction);
    EventEmiterService.remove(EventEmiterService.events.CHANGE_USER_DATA_ACTIVE_INCOMING_TRANSFER_OFFER, this.handerChangePendingTransactions);
  }

  handerChangePendingTransactions() {
    let activeIncompingTransferOffers = DataController.getTransactionData().activeIncompingTransferOffers;
    activeIncompingTransferOffers.forEach((item, index) => {
      item.key = index;
    });
    this.setState({ activeIncompingTransferOffers });
  }
  handerChangeCompletedTransaction() {
    let transactions = DataController.getTransactionData().transactions;
    transactions.forEach((item, index) => {
      item.key = index;
    });
    this.setState({ transactions });
  }

  refreshTransactionScreen() {
    AppController.doGetTransactionData().then(() => {
      let transactionData = DataController.getTransactionData();
      transactionData.activeIncompingTransferOffers.forEach((item, index) => {
        item.key = index;
      });
      transactionData.transactions.forEach((item, index) => {
        item.key = index;
      });
      this.setState({
        activeIncompingTransferOffers: transactionData.activeIncompingTransferOffers,
        transactions: transactionData.transactions,
      });
    }).catch((error) => {
      console.log('getUserBitmark error :', error);
    });
  }

  switchSubtab(subtab) {
    this.setState({ subtab });
  }

  render() {
    return (
      <View style={transactionsStyle.body}>
        <View style={defaultStyle.header}>
          <TouchableOpacity style={defaultStyle.headerLeft}></TouchableOpacity>
          <Text style={defaultStyle.headerTitle}>TRANSACTIONS</Text>
          <TouchableOpacity style={defaultStyle.headerRight}></TouchableOpacity>
        </View>
        <View style={transactionsStyle.subTabArea}>
          <TouchableOpacity style={transactionsStyle.subTabButton} onPress={() => this.switchSubtab(SubTabs.required)}>
            <View style={transactionsStyle.subTabButtonArea}>
              <View style={transactionsStyle.subTabButtonTextArea}>
                <Text style={transactionsStyle.subTabButtonText}>{SubTabs.required}</Text>
              </View>
              <View style={[transactionsStyle.activeSubTabBar, { backgroundColor: this.state.subtab === SubTabs.required ? '#0060F2' : 'white' }]}></View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={transactionsStyle.subTabButton} onPress={() => this.switchSubtab(SubTabs.completed)}>
            <View style={transactionsStyle.subTabButtonArea}>
              <View style={transactionsStyle.subTabButtonTextArea}>
                <Text style={transactionsStyle.subTabButtonText}>{SubTabs.completed}</Text>
              </View>
              <View style={[transactionsStyle.activeSubTabBar, { backgroundColor: this.state.subtab === SubTabs.completed ? '#0060F2' : 'white' }]}></View>
            </View>
          </TouchableOpacity>
        </View>
        <ScrollView style={[transactionsStyle.scrollSubTabArea]}>
          <TouchableOpacity activeOpacity={1} style={{ flex: 1 }}>
            {this.state.subtab === SubTabs.required && <View style={transactionsStyle.contentSubTab}>
              <FlatList data={this.state.activeIncompingTransferOffers}
                extraData={this.state}
                renderItem={({ item }) => {
                  return (
                    <TouchableOpacity style={transactionsStyle.transferOfferRow} onPress={() => this.props.screenProps.homeNavigation.navigate('TransactionDetail', {
                      transferOffer: item,
                      refreshTransactionScreen: this.refreshTransactionScreen,
                    })}>
                      <View style={transactionsStyle.transferOfferTitle}>
                        <Text style={transactionsStyle.transferOfferTitleType}>Property Transfer Request</Text>
                        <Text style={transactionsStyle.transferOfferTitleTime} >{item.created_at}</Text>
                        <Image style={transactionsStyle.transferOfferTitleIcon} source={require('../../../../assets/imgs/sign-request-icon.png')} />
                      </View>
                      <Text style={transactionsStyle.transferOfferContent}>
                        Sign to accept the property
                        <Text style={transactionsStyle.transferOfferAssetName}> {item.asset.name} </Text>
                        transfer request.
                      </Text>
                    </TouchableOpacity>
                  )
                }} />
            </View>}

            {this.state.subtab === SubTabs.completed && <View style={transactionsStyle.contentSubTab}>
              <FlatList data={this.state.transactions}
                extraData={this.state}
                renderItem={({ item }) => {
                  return (
                    <TouchableOpacity style={transactionsStyle.completedTransfer}>
                      <View style={transactionsStyle.completedTransferHeader}>
                        <Text style={[transactionsStyle.completedTransferHeaderTitle, {
                          color: item.status === 'pending' ? '#999999' : '#0060F2'
                        }]}>TRANSFER</Text>
                        <Text style={[transactionsStyle.completedTransferHeaderValue, {
                          color: item.status === 'pending' ? '#999999' : '#0060F2'
                        }]}>{item.status === 'pending' ? 'PENDING' : item.timestamp}</Text>
                      </View>
                      <View style={transactionsStyle.completedTransferContent}>
                        <View style={transactionsStyle.completedTransferContentRow}>
                          <Text style={transactionsStyle.completedTransferContentRowLabel}>PROPERTY</Text>
                          <Text style={[transactionsStyle.completedTransferContentRowValue, { fontWeight: '900' }]}>{item.assetName}</Text>
                        </View>
                        <View style={transactionsStyle.completedTransferContentRow}>
                          <Text style={transactionsStyle.completedTransferContentRowLabel}>FROM</Text>
                          <Text style={transactionsStyle.completedTransferContentRowValue} numberOfLines={1}>{item.from === this.state.currentUser.bitmarkAccountNumber ? 'YOU' : item.from}</Text>
                        </View>
                        <View style={transactionsStyle.completedTransferContentRow}>
                          <Text style={transactionsStyle.completedTransferContentRowLabel}>To</Text>
                          <Text style={transactionsStyle.completedTransferContentRowValue} numberOfLines={1}>{item.to === this.state.currentUser.bitmarkAccountNumber ? 'YOU' : item.to}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  )
                }} />
            </View >}
          </TouchableOpacity>
        </ScrollView>
      </View >
    );
  }
}

TransactionsComponent.propTypes = {
  subtab: PropTypes.string,
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
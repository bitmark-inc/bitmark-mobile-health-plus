import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, ScrollView, FlatList, Image,
  Platform,
} from 'react-native';

import { DataController, AppController } from './../../../managers';

import transactionsStyle from './transactions.component.style';
import { EventEmiterService } from '../../../services';
import { androidDefaultStyle, iosDefaultStyle } from './../../../commons/styles';
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
      subTab: (this.props.screenProps.subTab === SubTabs.required || this.props.screenProps.subTab === SubTabs.completed) ? this.props.screenProps.subTab : SubTabs.required,
      activeIncompingTransferOffers: transactionData.activeIncompingTransferOffers,
      transactions: transactionData.transactions,
    };
  }

  componentWillReceiveProps(nexpProps) {
    this.setState({ subTab: (nexpProps.subTab === SubTabs.required || nexpProps.subTab === SubTabs.completed) ? nexpProps.subTab : this.state.subTab });
  }

  componentDidMount() {
    this.switchSubtab(this.state.subTab);
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

  switchSubtab(subTab) {
    this.setState({ subTab });
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
          {this.state.subTab === SubTabs.required && <TouchableOpacity style={[transactionsStyle.subTabButton, {
            shadowOffset: { width: 2 },
            shadowOpacity: 0.15,
          }]}>
            <View style={transactionsStyle.subTabButtonArea}>
              <View style={[transactionsStyle.activeSubTabBar, { backgroundColor: '#0060F2' }]}></View>
              <View style={transactionsStyle.subTabButtonTextArea}>
                <Text style={transactionsStyle.subTabButtonText}>{SubTabs.required.toUpperCase()}</Text>
              </View>
            </View>
          </TouchableOpacity>}
          {this.state.subTab !== SubTabs.required && <TouchableOpacity style={[transactionsStyle.subTabButton, {
            backgroundColor: '#F5F5F5',
            zIndex: 0,
          }]} onPress={() => this.switchSubtab(SubTabs.required)}>
            <View style={transactionsStyle.subTabButtonArea}>
              <View style={[transactionsStyle.activeSubTabBar, { backgroundColor: '#F5F5F5' }]}></View>
              <View style={transactionsStyle.subTabButtonTextArea}>
                <Text style={[transactionsStyle.subTabButtonText, { color: '#C1C1C1' }]}>{SubTabs.required.toUpperCase()}</Text>
              </View>
            </View>
          </TouchableOpacity>}

          {this.state.subTab === SubTabs.completed && <TouchableOpacity style={[transactionsStyle.subTabButton, {
            shadowOffset: { width: -2 },
            shadowOpacity: 0.15,
          }]}>
            <View style={transactionsStyle.subTabButtonArea}>
              <View style={[transactionsStyle.activeSubTabBar, { backgroundColor: '#0060F2' }]}></View>
              <View style={transactionsStyle.subTabButtonTextArea}>
                <Text style={transactionsStyle.subTabButtonText}>{SubTabs.completed.toUpperCase()}</Text>
              </View>
            </View>
          </TouchableOpacity>}
          {this.state.subTab !== SubTabs.completed && <TouchableOpacity style={[transactionsStyle.subTabButton, {
            backgroundColor: '#F5F5F5',
            zIndex: 0,
          }]} onPress={() => this.switchSubtab(SubTabs.completed)}>
            <View style={transactionsStyle.subTabButtonArea}>
              <View style={[transactionsStyle.activeSubTabBar, { backgroundColor: '#F5F5F5' }]}></View>
              <View style={transactionsStyle.subTabButtonTextArea}>
                <Text style={[transactionsStyle.subTabButtonText, { color: '#C1C1C1' }]}>{SubTabs.completed.toUpperCase()}</Text>
              </View>
            </View>
          </TouchableOpacity>}
        </View>
        <ScrollView style={[transactionsStyle.scrollSubTabArea]}>
          <TouchableOpacity activeOpacity={1} style={{ flex: 1 }}>
            {this.state.subTab === SubTabs.required && this.state.activeIncompingTransferOffers.length === 0 && <View style={transactionsStyle.contentSubTab}>
              <Text style={transactionsStyle.titleNoRequiredTransferOffer}>NO ACTIONS REQUIRED.</Text>
              <Text style={transactionsStyle.messageNoRequiredTransferOffer}>This is where you will receive any requests that require your signature.</Text>
            </View>}

            {this.state.subTab === SubTabs.required && this.state.activeIncompingTransferOffers.length > 0 && <View style={transactionsStyle.contentSubTab}>
              <FlatList data={this.state.activeIncompingTransferOffers}
                extraData={this.state}
                renderItem={({ item }) => {
                  return (
                    <TouchableOpacity style={transactionsStyle.transferOfferRow} onPress={() => this.props.screenProps.homeNavigation.navigate('TransactionDetail', {
                      transferOffer: item,
                      refreshTransactionScreen: this.refreshTransactionScreen,
                    })}>
                      <View style={transactionsStyle.transferOfferTitle}>
                        <Text style={transactionsStyle.transferOfferTitleType}>{'Property Transfer Request'.toUpperCase()}</Text>
                        <Text style={transactionsStyle.transferOfferTitleTime} >{item.created_at.toUpperCase()}</Text>
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

            {this.state.subTab === SubTabs.completed && this.state.transactions.length === 0 && <View style={transactionsStyle.contentSubTab}>
              <Text style={transactionsStyle.titleNoRequiredTransferOffer}>NO TRANSACTION HISTORY</Text>
              <Text style={transactionsStyle.messageNoRequiredTransferOffer}>This is where your history of completed transaction will be stored.</Text>
            </View>}
            {this.state.subTab === SubTabs.completed && this.state.transactions.length > 0 && <View style={transactionsStyle.contentSubTab}>
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
                        }]}>{item.status === 'pending' ? 'PENDING' : item.timestamp.toUpperCase()}</Text>
                      </View>
                      <View style={transactionsStyle.completedTransferContent}>
                        <View style={transactionsStyle.completedTransferContentRow}>
                          <Text style={[transactionsStyle.completedTransferContentRowLabel, { marginTop: 1, }]}>PROPERTY</Text>
                          <Text style={[transactionsStyle.completedTransferContentRowPropertyName]}>{item.assetName}</Text>
                        </View>
                        <View style={[transactionsStyle.completedTransferContentRow, { marginTop: 1, }]}>
                          <Text style={transactionsStyle.completedTransferContentRowLabel}>FROM</Text>
                          <Text style={transactionsStyle.completedTransferContentRowValue} numberOfLines={1}>{item.from === this.state.currentUser.bitmarkAccountNumber ? 'YOU' : item.from}</Text>
                        </View>
                        <View style={transactionsStyle.completedTransferContentRow}>
                          <Text style={transactionsStyle.completedTransferContentRowLabel}>TO</Text>
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
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
  }),
  screenProps: PropTypes.shape({
    subTab: PropTypes.string,
    logout: PropTypes.func,
    homeNavigation: PropTypes.shape({
      navigate: PropTypes.func,
      goBack: PropTypes.func,
    }),
  }),
}
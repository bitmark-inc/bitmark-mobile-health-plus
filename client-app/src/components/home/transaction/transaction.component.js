import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, ScrollView, FlatList,
  Platform,
} from 'react-native';

import { DataController } from './../../../managers';

import transactionStyle from './transaction.component.style';
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
export class TransactionComponent extends React.Component {
  constructor(props) {
    super(props);
    this.switchSubtab = this.switchSubtab.bind(this);
    this.handerChangePendingTransactions = this.handerChangePendingTransactions.bind(this);
    this.handerChangeCompletedTransaction = this.handerChangeCompletedTransaction.bind(this);

    let signRequests = DataController.getSignRequests();
    signRequests.pendingTransactions.forEach((item, key) => {
      item.key = key;
    });
    signRequests.completedTransactions.forEach((item, key) => {
      item.key = key;
    });
    this.state = {
      subtab: SubTabs.required,
      pendingTransactions: signRequests.pendingTransactions,
      completedTransactions: signRequests.completedTransactions,
    };
  }

  componentDidMount() {
    EventEmiterService.on(EventEmiterService.events.CHANGE_USER_DATA_COMPLETED_TRANSACTIONS, this.handerChangeCompletedTransaction);
    EventEmiterService.on(EventEmiterService.events.CHANGE_USER_DATA_PENDING_TRANSACTIONS, this.handerChangePendingTransactions);
    this.switchSubtab(this.state.subtab);
  }

  componentWillUnmount() {
    EventEmiterService.remove(EventEmiterService.events.CHANGE_USER_DATA_COMPLETED_TRANSACTIONS, this.handerChangeCompletedTransaction);
    EventEmiterService.remove(EventEmiterService.events.CHANGE_USER_DATA_PENDING_TRANSACTIONS, this.handerChangePendingTransactions);
  }

  handerChangePendingTransactions() {
    let pendingTransactions = DataController.getSignRequests().pendingTransactions;
    pendingTransactions.forEach((item, key) => {
      item.key = key;
    });
    this.setState({ pendingTransactions });
  }
  handerChangeCompletedTransaction() {
    let completedTransactions = DataController.getSignRequests().completedTransactions;
    completedTransactions.forEach((item, key) => {
      item.key = key;
    });
    this.setState({ completedTransactions });
  }

  switchSubtab(subtab) {
    this.setState({ subtab });
  }

  render() {
    return (
      <View style={transactionStyle.body}>
        <View style={defaultStyle.header}>
          <TouchableOpacity style={defaultStyle.headerLeft}></TouchableOpacity>
          <Text style={defaultStyle.headerTitle}>TRANSACTIONS</Text>
          <TouchableOpacity style={defaultStyle.headerRight}></TouchableOpacity>
        </View>
        <View style={transactionStyle.subTabArea}>
          <TouchableOpacity style={transactionStyle.subTabButton} onPress={() => this.switchSubtab(SubTabs.required)}>
            <View style={transactionStyle.subTabButtonArea}>
              <View style={transactionStyle.subTabButtonTextArea}>
                <Text style={transactionStyle.subTabButtonText}>{SubTabs.required}</Text>
              </View>
              <View style={[transactionStyle.activeSubTabBar, { backgroundColor: this.state.subtab === SubTabs.required ? '#0060F2' : 'white' }]}></View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={transactionStyle.subTabButton} onPress={() => this.switchSubtab(SubTabs.completed)}>
            <View style={transactionStyle.subTabButtonArea}>
              <View style={transactionStyle.subTabButtonTextArea}>
                <Text style={transactionStyle.subTabButtonText}>{SubTabs.completed}</Text>
              </View>
              <View style={[transactionStyle.activeSubTabBar, { backgroundColor: this.state.subtab === SubTabs.completed ? '#0060F2' : 'white' }]}></View>
            </View>
          </TouchableOpacity>
        </View>
        <ScrollView style={[transactionStyle.scrollSubTabArea]}>
          {this.state.subtab === SubTabs.required && <View style={transactionStyle.contentSubTab}>
            <FlatList data={this.state.pendingTransactions}
              extraData={this.state}
              renderItem={({ item }) => {
                return (
                  <View style={{}}>
                    <View>
                      <Text>{item.type}</Text>
                      <Text>{item.time}</Text>
                    </View>
                    <View style={{}}>
                      <Text>[</Text>
                      <Text>{item.sender}</Text>
                      <Text>]</Text>
                      <Text> has transferred the property </Text>
                      <Text>{item.assetName}</Text>
                      <Text> to you. Please sign for receipt to accept the property transfer. </Text>
                    </View>
                  </View>
                )
              }} />
          </View>}

          {this.state.subtab === SubTabs.completed && <View style={transactionStyle.contentSubTab}>
            <FlatList data={this.state.completedTransactions}
              extraData={this.state}
              renderItem={({ item }) => {
                return (
                  <View style={{}}>
                    <View>
                      <Text>{item.type}</Text>
                      <Text>{item.time || item.status}</Text>
                    </View>
                    <View style={{}}>
                      <View>
                        <Text>PROPERTY</Text>
                        <Text>{item.assetName}</Text>
                      </View>
                      <View>
                        <Text>FROM</Text>
                        <Text>{item.sender}</Text>
                      </View>
                      <View>
                        <Text>To</Text>
                        <Text>{item.recipient}</Text>
                      </View>
                    </View>
                  </View>
                )
              }} />
          </View >}
        </ScrollView>
      </View >
    );
  }
}

TransactionComponent.propTypes = {
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
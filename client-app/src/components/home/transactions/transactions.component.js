import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, ScrollView, FlatList, Image,
  Platform,
} from 'react-native';
import moment from 'moment';

import { DataController } from './../../../managers';

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
              <FlatList data={this.state.pendingTransactions}
                extraData={this.state}
                renderItem={({ item }) => {
                  return (
                    <TouchableOpacity style={transactionsStyle.signRequestRow}>
                      <View style={transactionsStyle.signRequestTitle}>
                        <Text style={transactionsStyle.signRequestTitleType}>{item.type}</Text>
                        <Text style={transactionsStyle.signRequestTitleTime} >{item.time}</Text>
                        <Image style={transactionsStyle.signRequestTitleIcon} source={require('../../../../assets/imgs/sign-request-icon.png')} />
                      </View>
                      <Text style={transactionsStyle.signRequestContent}>
                        <Text style={transactionsStyle.signRequestSenderFix}>[</Text>
                        <Text style={transactionsStyle.signRequestSenderName} numberOfLines={1}>{item.sender.substring(0, 12)}...</Text>
                        <Text style={transactionsStyle.signRequestSenderFix}>]</Text>
                        has transferred the property
                      <Text style={transactionsStyle.signRequestAssetName}> {item.assetName} </Text>
                        to you. Please sign for receipt to accept the property transfer.
                    </Text>
                    </TouchableOpacity>
                  )
                }} />
            </View>}

            {this.state.subtab === SubTabs.completed && <View style={transactionsStyle.contentSubTab}>
              <FlatList data={this.state.completedTransactions}
                extraData={this.state}
                renderItem={({ item }) => {
                  return (
                    <TouchableOpacity style={{}}>
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
    logout: PropTypes.func,
    homeNavigation: PropTypes.shape({
      navigate: PropTypes.func,
      goBack: PropTypes.func,
    }),
  }),
}
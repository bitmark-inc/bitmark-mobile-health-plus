import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, ScrollView,
  Platform,
} from 'react-native';

import transactionStyle from './transaction.component.style';

import { androidDefaultStyle, iosDefaultStyle } from './../../../commons/styles';

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

    this.state = {
      subtab: SubTabs.required,
    };
  }

  componentDidMount() {
  }

  componentWillUnmount() {
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
            <Text>required</Text>
          </View>}

          {this.state.subtab === SubTabs.completed && <View style={transactionStyle.contentSubTab}>
            <Text>completed</Text>
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
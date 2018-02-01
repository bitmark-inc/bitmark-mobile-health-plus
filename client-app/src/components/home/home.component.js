import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, Image,
  Platform,
} from 'react-native';
import { NavigationActions } from 'react-navigation';

import { AccountComponent } from './account';

import homeStyle from './home.component.style';
import { androidDefaultStyle, iosDefaultStyle } from './../../commons/styles';

import { AppService } from "./../../services";

let defaultStyle = Platform.select({
  ios: iosDefaultStyle,
  android: androidDefaultStyle
});

const MainTabs = {
  properties: 'Properties',
  markets: 'Markets',
  account: 'Account',
};


export class HomeComponent extends React.Component {
  constructor(props) {
    super(props);
    this.logOut = this.logOut.bind(this);
    this.state = {
      mainTab: MainTabs.properties,
    };
  }

  logOut() {
    AppService.logOut().then(() => {
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
      <View style={homeStyle.body}>
        <View style={defaultStyle.header}>
          <TouchableOpacity style={defaultStyle.headerLeft}></TouchableOpacity>
          <Text style={defaultStyle.headerTitle}>{this.state.mainTab}</Text>
          <TouchableOpacity style={defaultStyle.headerRight}></TouchableOpacity>
        </View>

        {/* {this.state.mainTab === MainTabs.properties}
        {this.state.mainTab === MainTabs.markets} */}
        {this.state.mainTab === MainTabs.account && <AccountComponent screenProps={{
          logOut: this.logOut
        }} />}

        <View style={homeStyle.bottomTabArea}>
          <TouchableOpacity style={homeStyle.bottomTabButton} onPress={() => this.setState({ mainTab: MainTabs.properties })}>
            <Image style={homeStyle.bottomTabButtonIcon} source={this.state.mainTab === MainTabs.properties
              ? require('./../../../assets/imgs/properties-icon-enable.png')
              : require('./../../../assets/imgs/properties-icon-disable.png')} />
            <Text style={[homeStyle.bottomTabButtonText, { color: this.state.mainTab === MainTabs.properties ? '#0060F2' : '#999999' }]}>{MainTabs.properties}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={homeStyle.bottomTabButton} onPress={() => this.setState({ mainTab: MainTabs.markets })}>
            <Image style={homeStyle.bottomTabButtonIcon} source={this.state.mainTab === MainTabs.markets
              ? require('./../../../assets/imgs/markets-icon-enable.png')
              : require('./../../../assets/imgs/markets-icon-disable.png')} />
            <Text style={[homeStyle.bottomTabButtonText, { color: this.state.mainTab === MainTabs.markets ? '#0060F2' : '#999999' }]}>{MainTabs.markets}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={homeStyle.bottomTabButton} onPress={() => this.setState({ mainTab: MainTabs.account })}>
            <Image style={homeStyle.bottomTabButtonIcon} source={this.state.mainTab === MainTabs.account
              ? require('./../../../assets/imgs/account-icon-enable.png')
              : require('./../../../assets/imgs/account-icon-disable.png')} />
            <Text style={[homeStyle.bottomTabButtonText, { color: this.state.mainTab === MainTabs.account ? '#0060F2' : '#999999' }]}>{MainTabs.account}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

HomeComponent.propTypes = {
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
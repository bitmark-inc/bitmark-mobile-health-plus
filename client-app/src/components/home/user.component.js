import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, Image,
} from 'react-native';
import { NavigationActions } from 'react-navigation';

import { AccountComponent } from './account';
import { MarketsComponent } from './markets';
import { AssetsComponent } from './properties';


import userStyle from './user.component.style';
import { config } from '../../configs';
import { AppController } from '../../controllers';

const MainTabs = {
  properties: 'Properties',
  markets: 'Markets',
  account: 'Account',
};


export class UserComponent extends React.Component {
  constructor(props) {
    super(props);
    this.logout = this.logout.bind(this);
    this.state = {
      mainTab: MainTabs.properties,
    };
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
        {this.state.mainTab === MainTabs.properties && <AssetsComponent screenProps={{
          homeNavigation: this.props.navigation,
        }} />}
        {this.state.mainTab === MainTabs.markets && <MarketsComponent screenProps={{
          homeNavigation: this.props.navigation,
        }} />}
        {this.state.mainTab === MainTabs.account && <View style={{ width: '100%', flex: 1, }}>
          <AccountComponent screenProps={{
            homeNavigation: this.props.navigation,
            logout: this.logout
          }} />
        </View>
        }

        <View style={userStyle.bottomTabArea}>
          <TouchableOpacity style={userStyle.bottomTabButton} onPress={() => this.setState({ mainTab: MainTabs.properties })}>
            <Image style={userStyle.bottomTabButtonIcon} source={this.state.mainTab === MainTabs.properties
              ? require('./../../../assets/imgs/properties-icon-enable.png')
              : require('./../../../assets/imgs/properties-icon-disable.png')} />
            <Text style={[userStyle.bottomTabButtonText, { color: this.state.mainTab === MainTabs.properties ? '#0060F2' : '#999999' }]}>{MainTabs.properties}</Text>
          </TouchableOpacity>
          {!config.disabel_markets && <TouchableOpacity style={userStyle.bottomTabButton} onPress={() => this.setState({ mainTab: MainTabs.markets })}>
            <Image style={userStyle.bottomTabButtonIcon} source={this.state.mainTab === MainTabs.markets
              ? require('./../../../assets/imgs/markets-icon-enable.png')
              : require('./../../../assets/imgs/markets-icon-disable.png')} />
            <Text style={[userStyle.bottomTabButtonText, { color: this.state.mainTab === MainTabs.markets ? '#0060F2' : '#999999' }]}>{MainTabs.markets}</Text>
          </TouchableOpacity>}
          <TouchableOpacity style={userStyle.bottomTabButton} onPress={() => this.setState({ mainTab: MainTabs.account })}>
            <Image style={userStyle.bottomTabButtonIcon} source={this.state.mainTab === MainTabs.account
              ? require('./../../../assets/imgs/account-icon-enable.png')
              : require('./../../../assets/imgs/account-icon-disable.png')} />
            <Text style={[userStyle.bottomTabButtonText, { color: this.state.mainTab === MainTabs.account ? '#0060F2' : '#999999' }]}>{MainTabs.account}</Text>
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
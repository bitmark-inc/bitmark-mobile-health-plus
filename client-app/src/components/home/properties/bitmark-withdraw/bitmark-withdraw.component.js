import React from 'react';
import PropTypes from 'prop-types';
import { NavigationActions } from 'react-navigation';
import {
  View, Text, TouchableOpacity, Image,
  Platform,
} from 'react-native';


import { AppService, EventEmiterService } from './../../../../services';

import { config } from './../../../../configs';
import bitmarkWithdrawStyle from './bitmark-withdraw.component.style';
import { androidDefaultStyle, iosDefaultStyle } from './../../../../commons/styles';

let defaultStyle = Platform.select({
  ios: iosDefaultStyle,
  android: androidDefaultStyle
});


export class BitmarkWithdrawComponent extends React.Component {
  constructor(props) {
    super(props);

    this.doWithdraw = this.doWithdraw.bind(this);
    this.withdrawSuccess = this.withdrawSuccess.bind(this);

    let asset = this.props.navigation.state.params.asset;
    let bitmark = this.props.navigation.state.params.bitmark;
    let marketList = [];
    let index = 0;
    for (let market in config.markets) {
      marketList.push({ key: index, market });
    }
    this.state = {
      asset,
      bitmark,
      marketList,
    };
  }

  withdrawSuccess() {
    const resetMainPage = NavigationActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: 'User' })]
    });
    this.props.navigation.dispatch(resetMainPage);
  }

  doWithdraw() {
    EventEmiterService.emit(EventEmiterService.events.APP_PROCESSING, true);
    AppService.doWithdrawBitmark(this.state.bitmark).then((data) => {
      console.log('doWithdrawBitmark success :', data);
      EventEmiterService.emit(EventEmiterService.events.APP_PROCESSING, false);
      if (data) {
        this.withdrawSuccess();
      }
    }).catch(error => {
      console.error('doWithdrawBitmark error:', error);
      EventEmiterService.emit(EventEmiterService.events.APP_PROCESSING, false);
    });
  }
  render() {
    return (
      <View style={bitmarkWithdrawStyle.body}>
        <View style={defaultStyle.header}>
          <TouchableOpacity style={defaultStyle.headerLeft}></TouchableOpacity>
          <Text style={defaultStyle.headerTitle}>List to Market</Text>
          <TouchableOpacity style={defaultStyle.headerRight} onPress={() => this.props.navigation.goBack()}>
            <Text style={defaultStyle.headerRightText}>Cancel</Text>
          </TouchableOpacity>
        </View>
        <Image style={bitmarkWithdrawStyle.assetImage} source={{ uri: config.preive_asset_url + '/' + this.state.asset.asset_id }} />
        <Text style={bitmarkWithdrawStyle.assetName}>{this.state.asset.name}</Text>
        <Text style={bitmarkWithdrawStyle.withdrawMessage}>Are you sure you want to remove this property from market? Once the property transfer back to yours, you can’t list it for sale on the market unless you list it on the market again.</Text>
        <TouchableOpacity style={bitmarkWithdrawStyle.continueButton} onPress={this.doWithdraw}>
          <Text style={bitmarkWithdrawStyle.continueButtonText}>CONTINUE</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

BitmarkWithdrawComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
    dispatch: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.shape({
        asset: PropTypes.object,
        bitmark: PropTypes.object,
      }),
    }),
  }),
}
import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, Image,
  Platform,
} from 'react-native';
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
        <TouchableOpacity style={bitmarkWithdrawStyle.continueButton} onPress={() => {
          // TODO call withdraw
        }}>
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
    state: PropTypes.shape({
      params: PropTypes.shape({
        asset: PropTypes.object,
        bitmark: PropTypes.object,
      }),
    }),
  }),
}
import React from 'react';
import PropTypes from 'prop-types';
import { NavigationActions } from 'react-navigation';
import {
  View, Text, TouchableOpacity, Image, ScrollView,
  Platform,
  FlatList,
} from 'react-native';
import { config } from './../../../../configs';
import bitmarkDepositStyle from './bitmark-deposit.component.style';
import { androidDefaultStyle, iosDefaultStyle } from './../../../../commons/styles';
import bitmarkDepositComponentStyle from './bitmark-deposit.component.style';
import { AppService, EventEmiterService } from '../../../../services';

let defaultStyle = Platform.select({
  ios: iosDefaultStyle,
  android: androidDefaultStyle
});

const Steps = {
  chooseMarket: 1,
  depost: 2,
}

export class BitmarkDepositComponent extends React.Component {
  constructor(props) {
    super(props);
    this.selectMarket = this.selectMarket.bind(this);
    this.doDeposit = this.doDeposit.bind(this);
    this.depositSuccess = this.depositSuccess.bind(this);


    let asset = this.props.navigation.state.params.asset;
    let bitmark = this.props.navigation.state.params.bitmark;
    this.state = {
      asset,
      bitmark,
      marketList: [],
      step: Steps.chooseMarket,
      selectedmMarket: '',
    };

    AppService.getCurrentUser().then(user => {
      let index = 0;
      let marketList = [];
      for (let market in user.markets) {
        marketList.push({ key: index, market });
        index++;
      }
      this.setState({ marketList });
    }).catch(error => console.log('BitmarkDepositComponent error :', error));
  }

  selectMarket(selectedmMarket) {
    this.setState({ selectedmMarket, step: Steps.depost });
  }

  depositSuccess() {
    const resetMainPage = NavigationActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: 'User' })]
    });
    this.props.navigation.dispatch(resetMainPage);
  }

  doDeposit() {
    EventEmiterService.emit(EventEmiterService.events.APP_PROCESSING, true);
    AppService.doDepositBitmark(this.state.selectedmMarket, this.state.bitmark).then(() => {
      EventEmiterService.emit(EventEmiterService.events.APP_PROCESSING, false);
      this.depositSuccess();
    }).catch(error => {
      console.error('doDepositBitmark error:', error);
      EventEmiterService.emit(EventEmiterService.events.APP_PROCESSING, false);
    });
  }

  render() {
    return (
      <ScrollView style={bitmarkDepositComponentStyle.scroll}>
        <View style={bitmarkDepositStyle.body}>
          <View style={defaultStyle.header}>
            <TouchableOpacity style={defaultStyle.headerLeft}></TouchableOpacity>
            <Text style={defaultStyle.headerTitle}>List to Market</Text>
            <TouchableOpacity style={defaultStyle.headerRight} onPress={() => this.props.navigation.goBack()}>
              <Text style={defaultStyle.headerRightText}>Cancel</Text>
            </TouchableOpacity>
          </View>
          {this.state.step === Steps.chooseMarket && <View style={bitmarkDepositStyle.chooseMarketArea}>
            <Text style={bitmarkDepositStyle.stepLabel}>Choose a market to list</Text>
            <Text style={bitmarkDepositStyle.stepMessage}>We found one market that accepts listings for this property. Tap the market’s logo to continue.</Text>
            <View style={bitmarkDepositStyle.martketListArea}>
              <FlatList
                scrollEnabled={false}
                extraData={this.state}
                data={this.state.marketList || []}
                renderItem={({ item }) => {
                  return (<TouchableOpacity style={[bitmarkDepositStyle.marketButton,]} onPress={() => this.selectMarket(item.market)} >
                    <Image style={bitmarkDepositStyle.marketButtonIcon} source={config.markets[item.market].sourceIcon} />
                  </TouchableOpacity>)
                }}
              />
            </View>
          </View>}
          {this.state.step === Steps.depost && <View style={bitmarkDepositStyle.depositArea}>
            <Text style={bitmarkDepositStyle.stepLabel}>By continuing...</Text>
            <Text style={bitmarkDepositStyle.stepMessage}>You are transferring your bitmark to the market you chose.</Text>
            <Image style={bitmarkDepositStyle.assetImage} source={{ uri: config.preive_asset_url + '/' + this.state.asset.asset_id }} />
            <Text style={bitmarkDepositStyle.assetName}>{this.state.asset.name}</Text>
            <Text style={bitmarkDepositStyle.depositMessage}>Your bitmark will be listed on the market.{'\n'}You can remove it from the market anytime.</Text>
            <TouchableOpacity style={bitmarkDepositStyle.continueButton} onPress={this.doDeposit}>
              <Text style={bitmarkDepositStyle.continueButtonText}>CONTINUE</Text>
            </TouchableOpacity>
          </View>}
        </View>
      </ScrollView>
    );
  }
}

BitmarkDepositComponent.propTypes = {
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
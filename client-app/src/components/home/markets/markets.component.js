import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, ScrollView, Image,
  Platform,
} from 'react-native';

import { AppService } from './../../../services';
import { config } from './../../../configs';

import marketsStyle from './markets.component.style';
import { androidDefaultStyle, iosDefaultStyle } from './../../../commons/styles';

let defaultStyle = Platform.select({
  ios: iosDefaultStyle,
  android: androidDefaultStyle
});



export class MarketsComponent extends React.Component {
  constructor(props) {
    super(props);
    this.reload = this.reload.bind(this);
    this.openMarket = this.openMarket.bind(this);
    this.state = { user: null };
    this.reload();
  }

  reload() {
    AppService.getCurrentUser().then((user) => {
      this.setState({ user });
    }).catch(error => {
      console.log('getCurrentUser error :', error);
    });
  }

  openMarket() {
    this.props.screenProps.homeNavigation.navigate('MarketViewer', {
      name: config.markets.totemic.name.charAt(0).toUpperCase() + config.markets.totemic.name.slice(1),
      url: config.market_urls.totemic
    });
  }

  render() {
    return (
      <View style={marketsStyle.body}>
        <View style={defaultStyle.header}>
          <TouchableOpacity style={defaultStyle.headerLeft}></TouchableOpacity>
          <Text style={defaultStyle.headerTitle}>Markets</Text>
          <TouchableOpacity style={defaultStyle.headerRight}></TouchableOpacity>
        </View>
        <ScrollView style={[marketsStyle.scrollSubTabArea]}>
          <View style={marketsStyle.contentSubTab}>
            <View style={marketsStyle.marketCardArea}>
              <View style={marketsStyle.marketCardTitleArea}>
                <Image style={marketsStyle.marketCardTitleIcon} source={config.markets.totemic.sourceIcon} />
                <View style={marketsStyle.marketCardTitleMaketInfo}>
                  <Text style={marketsStyle.marketCardTitleMaketFeature}>Digital Card Trading</Text>
                  <Text style={marketsStyle.marketCardTitleMaketLink}>https://totemic.co</Text>
                </View>
              </View>
              {(!this.state.user || !this.state.user.markets || !this.state.user.markets.totemic ||
                !this.state.user.markets.totemic.account_number) && <Text style={marketsStyle.marketCardMessage}>
                  Blockchain-based, limited edition, collector cards. Totemic empowers content creators, fans and collectors with a completely new kind of digital asset.
              </Text>}
              {(!this.state.user || !this.state.user.markets || !this.state.user.markets.totemic ||
                !this.state.user.markets.totemic.account_number) && <View style={marketsStyle.marketCardButtonArea}>
                  <TouchableOpacity style={marketsStyle.marketCardButtonItem} onPress={() => { this.props.screenProps.homeNavigation.navigate('MarketLogin') }}>
                    <Image style={marketsStyle.marketCardButtonItemIcon} source={require('./../../../../assets/imgs/market-create-account.png')} />
                    <Text style={marketsStyle.marketCardButtonItemText}>CREATE TOTEMIC ACCOUNT</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={marketsStyle.marketCardButtonItem} onPress={() => {
                    this.props.screenProps.homeNavigation.navigate('MarketPair', {
                      reloadMarketsScreen: this.reload,
                      market: config.markets.totemic.name,
                    });
                  }}>
                    <Image style={marketsStyle.marketCardButtonItemIcon} source={require('./../../../../assets/imgs/market-pair-account.png')} />
                    <Text style={marketsStyle.marketCardButtonItemText}>PAIR WITH EXISTING TOTEMIC ACCOUNT</Text>
                  </TouchableOpacity>
                </View>}
              {this.state.user && this.state.user.markets && this.state.user.markets.totemic.account_number && <TouchableOpacity style={marketsStyle.marketCardButtonArea}
                onPress={this.openMarket}>
                <View style={marketsStyle.pairedInfoArea}>
                  <View style={marketsStyle.pairedAccountInfoArea}>
                    <Text style={marketsStyle.pairedLabel}>{'WEB ACCOUNT PAIRED'}</Text>
                    <Text style={marketsStyle.pairedEmail}>{this.state.user.markets.totemic.email}</Text>
                  </View>
                  <View style={marketsStyle.pairedIconArea}>
                    <Image style={marketsStyle.pairedIcon} source={require('./../../../../assets/imgs/open-market-icon.png')} />
                  </View>
                </View>

              </TouchableOpacity>}
            </View>
          </View>
        </ScrollView>
      </View >
    );
  }
}

MarketsComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
  }),
  screenProps: PropTypes.shape({
    homeNavigation: PropTypes.shape({
      navigate: PropTypes.func,
    }),
    logout: PropTypes.func,
  }),

}
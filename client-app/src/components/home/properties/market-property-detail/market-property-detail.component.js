import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, Image, FlatList, ScrollView,
  Platform,
  Clipboard,
  TouchableWithoutFeedback,
} from 'react-native';

import { MarketService } from './../../../../services';
import { convertWidth } from './../../../../utils';

import { config } from './../../../../configs';
import propertyDetailStyle from './market-property-detail.component.style';
import { androidDefaultStyle, iosDefaultStyle } from './../../../../commons/styles';

let defaultStyle = Platform.select({
  ios: iosDefaultStyle,
  android: androidDefaultStyle
});

export class MarketPropertyDetailComponent extends React.Component {
  constructor(props) {
    super(props);
    let asset = this.props.navigation.state.params.asset;
    let bitmark = this.props.navigation.state.params.bitmark;
    let histories = [];
    this.state = {
      asset,
      histories,
      bitmark,
      copied: false,
      displayTopButton: false,
    };
    MarketService.getProvenance(bitmark).then(provenance => {
      console.log('getProvenance :', provenance);
      let histories = [];
      provenance.forEach((history, key) => {
        histories.push({ key, history });
      });
      this.setState({ histories });
    }).catch(error => console.log('getProvenance error', error));
  }

  render() {
    return (
      <TouchableWithoutFeedback style={propertyDetailStyle.body} onPress={() => this.setState({ displayTopButton: false })}>
        <View style={propertyDetailStyle.body}>
          <View style={defaultStyle.header}>
            <TouchableOpacity style={defaultStyle.headerLeft} onPress={() => this.props.navigation.goBack()}>
              <Image style={defaultStyle.headerLeftIcon} source={require('../../../../../assets/imgs/header_back_icon_study_setting.png')} />
            </TouchableOpacity>
            <View style={defaultStyle.headerCenter}>
              <Text style={[defaultStyle.headerTitle, { maxWidth: convertWidth(180), }]} numberOfLines={1}>{this.state.asset.name}</Text>
              <Text style={[defaultStyle.headerTitle]}>({this.state.asset.bitmarks.indexOf(this.state.bitmark) + 1}/{this.state.asset.bitmarks.length})</Text>
            </View>
            <TouchableOpacity style={defaultStyle.headerRight} onPress={() => this.setState({ displayTopButton: !this.state.displayTopButton })}>
              <Image style={propertyDetailStyle.threeDotIcon} source={this.state.displayTopButton
                ? require('../../../../../assets/imgs/three-dot-blue.png')
                : require('../../../../../assets/imgs/three-dot-black.png')} />
            </TouchableOpacity>
          </View>
          <ScrollView style={propertyDetailStyle.content}>
            <View style={propertyDetailStyle.topArea}>
              <Image style={propertyDetailStyle.assetImage} source={{ uri: config.preive_asset_url + '/' + this.state.asset.asset_id }} />
              {this.state.displayTopButton && <View style={propertyDetailStyle.topButtonsArea}>
                <TouchableOpacity style={propertyDetailStyle.copyBitmarkIddButton} onPress={() => {
                  Clipboard.setString(this.state.asset.asset_id);
                  this.setState({ copied: true });
                  setTimeout(() => { this.setState({ copied: false }) }, 1000);
                }}>
                  <Text style={propertyDetailStyle.copyBitmarkIddButtonText}>Copy Bitmark ID</Text>
                  {this.state.copied && <Text style={propertyDetailStyle.copiedAssetIddButtonText}>Copied to clipboard!</Text>}
                </TouchableOpacity>
              </View>}
            </View>
            <View style={propertyDetailStyle.bottomImageBar}></View>
            <Text style={propertyDetailStyle.assetName}>{this.state.asset.name}</Text>
            <Text style={propertyDetailStyle.assetCreateAt} numberOfLines={1}>Issued on {this.state.asset.created_at} by {this.state.asset.issuer}</Text>
            <View style={propertyDetailStyle.bottomAssetNameBar}></View>
            <Text style={propertyDetailStyle.provenanceLabel}>Provenance</Text>
            <View style={propertyDetailStyle.provenancesArea}>
              <View style={propertyDetailStyle.provenancesHeader}>
                <Text style={propertyDetailStyle.provenancesHeaderLabel}>TIMESTAMP</Text>
                <Text style={propertyDetailStyle.provenancesHeaderLabel}>OWNER</Text>
              </View>
              <View style={propertyDetailStyle.provenanceListArea}>
                <FlatList
                  scrollEnabled={false}
                  extraData={this.state}
                  data={this.state.histories || []}
                  renderItem={({ item }) => {
                    return (<View style={propertyDetailStyle.provenancesRow}>
                      <Text style={propertyDetailStyle.provenancesHeaderLabel}>{item.history.created_at}</Text>
                      <Text style={propertyDetailStyle.provenancesHeaderLabel}>{item.history.owner}</Text>
                    </View>);
                  }}
                />
              </View>
            </View>
            <View style={propertyDetailStyle.listingButtonArea}>
              <TouchableOpacity style={[propertyDetailStyle.listingButton, {
                backgroundColor: this.state.bitmark.status === 'pending' ? '#CCCCCC' : '#0060F2'
              }]}
                disabled={this.state.bitmark.status === 'pending'}
                onPress={() => {
                  let url = MarketService.getListingUrl(this.state.bitmark);
                  this.props.navigation.navigate('MarketViewer', { url, name: this.state.bitmark.market.charAt(0).toUpperCase() + this.state.bitmark.market.slice(1) });
                }}>
                <Text style={propertyDetailStyle.listingButtonText}>LIST FOR SALE</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[propertyDetailStyle.listingButton, {
                marginTop: 10,
                backgroundColor: this.state.bitmark.status === 'pending' ? '#CCCCCC' : '#0060F2'
              }]}
                disabled={this.state.bitmark.status === 'pending'}
                onPress={() => {
                  this.props.navigation.navigate('BitmarkWithdraw', {
                    asset: this.state.asset,
                    bitamrk: this.state.bitmark,
                  });
                }}>
                <Text style={propertyDetailStyle.listingButtonText}>REMOVE FROM MARKET</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

MarketPropertyDetailComponent.propTypes = {
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
  screenProps: PropTypes.shape({
    logout: PropTypes.func,
  }),

}
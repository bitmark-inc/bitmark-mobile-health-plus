import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, Image, ScrollView, TouchableWithoutFeedback,
  Clipboard,
  Platform,
  FlatList,
} from 'react-native';
import { config } from './../../../../configs';
import { MarketService } from './../../../../services';
import assetDetailStyle from './market-asset-detail.component.style';
import { androidDefaultStyle, iosDefaultStyle } from './../../../../commons/styles';

let defaultStyle = Platform.select({
  ios: iosDefaultStyle,
  android: androidDefaultStyle
});


export class MarketAssetDetailComponent extends React.Component {
  constructor(props) {
    super(props);
    this.viewOnMarket = this.viewOnMarket.bind(this);
    this.goToWithdraw = this.goToWithdraw.bind(this);

    let asset;
    asset = this.props.navigation.state.params.asset;
    let bitmarks = [];
    asset.bitmarks.forEach((bitmark, index) => {
      bitmarks.push({ key: index, bitmark });
    });
    let metadata = [];
    for (let key in asset.metadata) {
      metadata.push({ key, value: asset.metadata[key] });
    }
    this.state = {
      asset,
      metadata,
      bitmarks,
      displayTopButton: false,
      copied: false,
    };
  }

  viewOnMarket(bitmark) {
    let url = MarketService.getListingUrl(bitmark);
    this.props.navigation.navigate('MarketViewer', {
      url, name: bitmark.market.charAt(0).toUpperCase() + bitmark.market.slice(1)
    });
  }

  goToWithdraw(bitmark) {
    this.props.navigation.navigate('BitmarkWithdraw', {
      asset: this.state.asset,
      bitmark: bitmark,
    });
  }


  render() {

    return (
      <TouchableWithoutFeedback style={assetDetailStyle.body} onPress={() => this.setState({ displayTopButton: false })}>
        <View style={assetDetailStyle.body}>
          <View style={defaultStyle.header}>
            <TouchableOpacity style={defaultStyle.headerLeft} onPress={() => this.props.navigation.goBack()}>
              <Image style={defaultStyle.headerLeftIcon} source={require('../../../../../assets/imgs/header_back_icon_study_setting.png')} />
            </TouchableOpacity>
            <Text style={[defaultStyle.headerTitle]} numberOfLines={1}>{this.state.asset.name}</Text>
            <TouchableOpacity style={defaultStyle.headerRight} onPress={() => this.setState({ displayTopButton: !this.state.displayTopButton })}>
              <Image style={assetDetailStyle.threeDotIcon} source={this.state.displayTopButton
                ? require('../../../../../assets/imgs/three-dot-blue.png')
                : require('../../../../../assets/imgs/three-dot-black.png')} />
            </TouchableOpacity>
          </View>
          <ScrollView style={assetDetailStyle.content}>
            <View style={assetDetailStyle.topArea}>
              <Image style={assetDetailStyle.assetImage} source={{ uri: config.preive_asset_url + '/' + this.state.asset.asset_id }} />
              {this.state.displayTopButton && <View style={assetDetailStyle.topButtonsArea}>
                <TouchableOpacity style={assetDetailStyle.downloadAssetButton}>
                  <Text style={assetDetailStyle.downloadAssetButtonText}>Download Asset</Text>
                </TouchableOpacity>
                <TouchableOpacity style={assetDetailStyle.copyAssetIddButton} onPress={() => {
                  Clipboard.setString(this.state.asset.asset_id);
                  this.setState({ copied: true });
                  setTimeout(() => { this.setState({ copied: false }) }, 1000);
                }}>
                  <Text style={assetDetailStyle.copyAssetIddButtonText}>Copy Asset ID</Text>
                  {this.state.copied && <Text style={assetDetailStyle.copiedAssetIddButtonText}>Copied to clipboard!</Text>}
                </TouchableOpacity>
              </View>}
            </View>
            <View style={assetDetailStyle.bottomImageBar}></View>
            <Text style={assetDetailStyle.assetName}>{this.state.asset.name}</Text>
            <Text style={assetDetailStyle.assetCreateAt} numberOfLines={1}>Issued on {this.state.asset.created_at} by {this.state.asset.issuer}</Text>
            <View style={assetDetailStyle.bottomAssetNameBar}></View>
            <View style={assetDetailStyle.marketArea}>
              <Text style={assetDetailStyle.marketLabel}>The property is currently listed on:</Text>
              <Image style={assetDetailStyle.marketIcon} source={config.markets.totemic.sourceIcon} />
            </View>
            <Text style={assetDetailStyle.bitmarkLabel}>BITMARKS ({this.state.bitmarks.length})</Text>
            <View style={assetDetailStyle.bitmarksArea}>
              <View style={assetDetailStyle.bitmarksHeader}>
                <Text style={assetDetailStyle.bitmarksHeaderLabelNo}>No.</Text>
                <Text style={assetDetailStyle.bitmarksHeaderLabelOnSale}>ON SALE</Text>
                <Text style={assetDetailStyle.bitmarksHeaderLabelOnAction}>ACTION</Text>
              </View>
              <View style={assetDetailStyle.bitmarkListArea}>
                <FlatList
                  scrollEnabled={false}
                  extraData={this.state}
                  data={this.state.bitmarks || []}
                  renderItem={({ item }) => {
                    return (<TouchableOpacity style={assetDetailStyle.bitmarksRow} onPress={() => {
                      this.props.navigation.navigate('MarketPropertyDetail', { asset: this.state.asset, bitmark: item.bitmark });
                    }}>
                      <Text style={item.bitmark.status === 'pending' ? assetDetailStyle.bitmarksRowNoPending : assetDetailStyle.bitmarksRowNo}>{(item.key + 1)}/{this.state.bitmarks.length}</Text>

                      {item.bitmark.status !== 'pending' && item.bitmark.order_price && <Text style={assetDetailStyle.bitmarksListedPrice}>
                        {Math.floor(item.bitmark.order_price / 1E4) / 1E5} ETH
                      </Text>}
                      {!(item.bitmark.status !== 'pending' && item.bitmark.order_price) &&
                        <TouchableOpacity style={assetDetailStyle.bitmarksRowListingButton} disabled={item.bitmark.status === 'pending'} onPress={() => this.viewOnMarket(item.bitmark)}>
                          {item.bitmark.status !== 'pending' && !item.bitmark.order_price && <Text style={assetDetailStyle.bitmarksButtonText}>
                            LIST FOR SALE
                        </Text>}
                          {item.bitmark.status === 'pending' && <Text style={assetDetailStyle.bitmarkPending}>PENDING...</Text>}
                        </TouchableOpacity>
                      }
                      <TouchableOpacity style={assetDetailStyle.bitmarksRowWithdrawButton} disabled={item.bitmark.status === 'pending'} onPress={() => {
                        if (item.bitmark.status !== 'pending' && item.bitmark.order_price) {
                          this.viewOnMarket(item.bitmark);
                        } else {
                          this.goToWithdraw(item.bitmark);
                        }
                      }}>
                        {item.bitmark.status !== 'pending' && !item.bitmark.order_price && <Text style={assetDetailStyle.bitmarksButtonText}>
                          REMOVE FROM MARKET
                        </Text>}
                        {item.bitmark.status !== 'pending' && item.bitmark.order_price && <Text style={assetDetailStyle.bitmarksButtonText}>
                          VIEW
                        </Text>}
                        {item.bitmark.status === 'pending' && <Text style={assetDetailStyle.bitmarkPending}>PENDING...</Text>}
                      </TouchableOpacity>
                    </TouchableOpacity>);
                  }}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </ TouchableWithoutFeedback>
    );
  }
}

MarketAssetDetailComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.shape({
        asset: PropTypes.object,
      }),
    }),
  }),
  screenProps: PropTypes.shape({
    logout: PropTypes.func,
  }),

}
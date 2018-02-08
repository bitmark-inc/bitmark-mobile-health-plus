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
import assetDetailStyle from './local-asset-detail.component.style';
import { androidDefaultStyle, iosDefaultStyle } from './../../../../commons/styles';

let defaultStyle = Platform.select({
  ios: iosDefaultStyle,
  android: androidDefaultStyle
});


export class LocalAssetDetailComponent extends React.Component {
  constructor(props) {
    super(props);
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
            <View style={assetDetailStyle.metadataArea}>
              <FlatList
                scrollEnabled={false}
                extraData={this.state}
                data={this.state.metadata || []}
                renderItem={({ item }) => {
                  return (<View style={assetDetailStyle.metadataItem}>
                    <Text style={assetDetailStyle.metadataItemLabel}>{item.key}:</Text>
                    <Text style={assetDetailStyle.metadataItemValue}>{item.value}</Text>
                  </View>);
                }}
              />
            </View>
            <Text style={assetDetailStyle.bitmarkLabel}>BITMARKS ({this.state.bitmarks.length})</Text>
            <View style={assetDetailStyle.bitmarksArea}>
              <View style={assetDetailStyle.bitmarksHeader}>
                <Text style={assetDetailStyle.bitmarksHeaderLabel}>No.</Text>
                <Text style={assetDetailStyle.bitmarksHeaderLabel}>ACTION</Text>
              </View>
              <View style={assetDetailStyle.bitmarkListArea}>
                <FlatList
                  scrollEnabled={false}
                  extraData={this.state}
                  data={this.state.bitmarks || []}
                  renderItem={({ item }) => {
                    return (<TouchableOpacity style={assetDetailStyle.bitmarksRow} onPress={() => {
                      this.props.navigation.navigate('LocalPropertyDetail', { asset: this.state.asset, bitmark: item.bitmark });
                    }}>
                      <Text style={item.bitmark.status === 'pending' ? assetDetailStyle.bitmarksRowNoPending : assetDetailStyle.bitmarksRowNo}>{(item.key + 1)}/{this.state.bitmarks.length}</Text>
                      <TouchableOpacity style={assetDetailStyle.bitmarksRowListingButton} disabled={item.bitmark.status === 'pending'} onPress={() => {
                        this.props.navigation.navigate('BitmarkDeposit', {
                          asset: this.state.asset,
                          bitmark: item.bitmark
                        });
                      }}>
                        {item.bitmark.status !== 'pending' && <Text style={assetDetailStyle.bitmarksRowListingButtonText}>{'List to Market'.toUpperCase()}</Text>}
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

LocalAssetDetailComponent.propTypes = {
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
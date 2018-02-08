import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, ScrollView, FlatList, Image,
  Platform,
  WebView,
} from 'react-native';

import { config } from './../../../configs';
import { AppService } from "./../../../services";

import assetsStyle from './assets.component.style';
import { androidDefaultStyle, iosDefaultStyle } from './../../../commons/styles';

let defaultStyle = Platform.select({
  ios: iosDefaultStyle,
  android: androidDefaultStyle
});


const SubTabs = {
  local: 'Yours',
  market: 'On Market',
  global: 'Global',
}
export class AssetsComponent extends React.Component {
  constructor(props) {
    super(props);
    this.switchSubtab = this.switchSubtab.bind(this);
    this.convertToFlatListData = this.convertToFlatListData.bind(this);

    this.state = {
      subtab: SubTabs.local,
      accountNumber: '',
      copyText: 'COPY',
      assets: [],
      data: {
        localAssets: [],
        marketAssets: [],
      }
    };
    AppService.getUserBitamrk().then((data) => {
      this.setState({ data });
      this.switchSubtab(this.state.subtab);
    }).catch((error) => {
      console.log('getUserBitamrk error :', error);
    });
  }

  convertToFlatListData(assets) {
    let tempBitmarks = [];
    assets.forEach((asset, key) => {
      tempBitmarks.push({ key, asset })
    });
    return tempBitmarks;
  }

  switchSubtab(subtab) {
    let assets = [];
    if (subtab === SubTabs.local) {
      assets = this.convertToFlatListData(this.state.data.localAssets);
    } else if (subtab === SubTabs.market) {
      assets = this.convertToFlatListData(this.state.data.marketAssets);
    } else if (subtab === SubTabs.global) {
      assets = this.convertToFlatListData(this.state.data.localAssets.concat(this.state.data.marketAssets));
    }
    this.setState({ subtab, assets });
  }

  render() {
    return (
      <View style={assetsStyle.body}>
        <View style={defaultStyle.header}>
          <TouchableOpacity style={defaultStyle.headerLeft}></TouchableOpacity>
          <Text style={defaultStyle.headerTitle}>Simplebar</Text>
          <TouchableOpacity style={defaultStyle.headerRight}></TouchableOpacity>
        </View>
        <View style={assetsStyle.subTabArea}>
          <TouchableOpacity style={assetsStyle.subTabButton} onPress={() => this.switchSubtab(SubTabs.local)}>
            <View style={assetsStyle.subTabButtonArea}>
              <View style={assetsStyle.subTabButtonTextArea}>
                <Text style={assetsStyle.subTabButtonText}>{SubTabs.local}({this.state.data.localAssets.length})</Text>
              </View>
              <View style={[assetsStyle.activeSubTabBar, { backgroundColor: this.state.subtab === SubTabs.local ? '#0060F2' : 'white' }]}></View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={assetsStyle.subTabButton} onPress={() => this.switchSubtab(SubTabs.market)}>
            <View style={assetsStyle.subTabButtonArea}>
              <View style={assetsStyle.subTabButtonTextArea}>
                <Text style={assetsStyle.subTabButtonText}>{SubTabs.market}({this.state.data.marketAssets.length})</Text>
              </View>
              <View style={[assetsStyle.activeSubTabBar, { backgroundColor: this.state.subtab === SubTabs.market ? '#0060F2' : 'white' }]}></View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={assetsStyle.subTabButton} onPress={() => this.switchSubtab(SubTabs.global)}>
            <View style={assetsStyle.subTabButtonArea}>
              <View style={assetsStyle.subTabButtonTextArea}>
                <Text style={assetsStyle.subTabButtonText}>{SubTabs.global}</Text>
              </View>
              <View style={[assetsStyle.activeSubTabBar, { backgroundColor: this.state.subtab === SubTabs.global ? '#0060F2' : 'white' }]}></View>
            </View>
          </TouchableOpacity>
        </View>
        <ScrollView style={[assetsStyle.scrollSubTabArea]}>
          <View style={assetsStyle.contentSubTab}>
            {(!this.state.assets || this.state.assets.length === 0) && <View style={assetsStyle.messageNoAssetArea}>
              {(this.state.subtab === SubTabs.local) && <Text style={assetsStyle.messageNoAssetLabel}>
                {'YOu DO not owned any property currently YET.'.toUpperCase()}
              </Text>}
              {(this.state.subtab === SubTabs.market) && <Text style={assetsStyle.messageNoAssetLabel}>
                {'YOu have not paired any markets.'.toUpperCase()}
              </Text>}
              {(this.state.subtab === SubTabs.local) && <Text style={assetsStyle.messageNoAssetContent}>
                Once you pair your market account with mobile app, you can remove the property from the market and the property will transfer to yours.
                </Text>}
              {(this.state.subtab === SubTabs.market) && <Text style={assetsStyle.messageNoAssetContent}>
                You can pair your market account in the “Market” section with Bitmark app to easily access every markets in the Bitmark system.
                </Text>}
            </View>}
            {(this.state.assets && this.state.assets.length > 0 && (this.state.subtab === SubTabs.local || this.state.subtab === SubTabs.market)) && <FlatList
              ref={(ref) => this.listViewElement = ref}
              extraData={this.state}
              data={this.state.assets || []}
              renderItem={({ item }) => {
                return (<TouchableOpacity style={[assetsStyle.assetRowArea,]} onPress={() => {
                  if (item.asset.market) {
                    this.props.screenProps.homeNavigation.navigate('MarketAssetDetail', { asset: item.asset });
                  } else {
                    this.props.screenProps.homeNavigation.navigate('LocalAssetDetail', { asset: item.asset });
                  }
                }} >
                  <Image style={assetsStyle.assetImage} source={{ uri: config.preive_asset_url + '/' + item.asset.asset_id }} />
                  <View style={assetsStyle.assetInfoArea}>
                    <Text style={assetsStyle.assetCreatedDate} >{item.asset.created_at}</Text>
                    <Text style={assetsStyle.assetName} numberOfLines={1}>{item.asset.name}</Text>
                    <Text style={assetsStyle.assetCreator} numberOfLines={1}>{item.asset.issuer}</Text>
                  </View>
                  <View style={assetsStyle.assetBitmark}>
                    {(item.asset.totalPending > 0) && <Text style={assetsStyle.assetBitmarkPending}>Pending...({item.asset.totalPending + '/' + item.asset.bitmarks.length})</Text>}
                    {item.asset.totalPending === 0 && <View style={assetsStyle.assetBitmarkNormal}>
                      <Text style={assetsStyle.assetBitamrksNumber}>{item.asset.bitmarks.length}</Text>
                      <Image style={assetsStyle.assetBitamrksDetail} source={require('./../../../../assets/imgs/next-icon.png')} />
                      <Image style={assetsStyle.assetBitamrksDetail} source={require('./../../../../assets/imgs/next-icon.png')} />
                    </View>}
                  </View>
                </TouchableOpacity>)
              }}
            />}
            {this.state.subtab === SubTabs.global && <View style={assetsStyle.globalArea}>
              <WebView source={{ uri: config.registry_server_url }} />
            </View>}
          </View>
        </ScrollView>
      </View>
    );
  }
}

AssetsComponent.propTypes = {
  screenProps: PropTypes.shape({
    logout: PropTypes.func,
    homeNavigation: PropTypes.shape({
      navigate: PropTypes.func,
      goBack: PropTypes.func,
    }),
  }),

}
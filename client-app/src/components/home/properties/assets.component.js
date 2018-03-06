import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, ScrollView, FlatList, Image,
  Platform,
  WebView,
} from 'react-native';

import { config } from './../../../configs';
import assetsStyle from './assets.component.style';
import { androidDefaultStyle, iosDefaultStyle } from './../../../commons/styles';
import { AppController, DataController } from '../../../managers';
import { EventEmiterService } from '../../../services';

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
    this.addProperty = this.addProperty.bind(this);
    this.convertToFlatListData = this.convertToFlatListData.bind(this);
    this.refreshPropertiesScreen = this.refreshPropertiesScreen.bind(this);
    this.handerChangeLocalBitmarks = this.handerChangeLocalBitmarks.bind(this);
    this.handerChangeMarketBitmarks = this.handerChangeMarketBitmarks.bind(this);

    this.state = {
      subtab: SubTabs.local,
      accountNumber: '',
      copyText: 'COPY',
      assets: [],
      data: {
        localAssets: DataController.getUserBitmarks().localAssets || [],
        marketAssets: DataController.getUserBitmarks().marketAssets || [],
      }
    };
  }
  componentDidMount() {
    EventEmiterService.on(EventEmiterService.events.CHANGE_USER_DATA_LOCAL_BITMARKS, this.handerChangeLocalBitmarks);
    EventEmiterService.on(EventEmiterService.events.CHANGE_USER_DATA_MARKET_BITMARKS, this.handerChangeMarketBitmarks);
    this.switchSubtab(this.state.subtab);
  }

  componentWillUnmount() {
    EventEmiterService.remove(EventEmiterService.events.CHANGE_USER_DATA_LOCAL_BITMARKS, this.handerChangeLocalBitmarks);
    EventEmiterService.remove(EventEmiterService.events.CHANGE_USER_DATA_MARKET_BITMARKS, this.handerChangeMarketBitmarks);
  }

  handerChangeLocalBitmarks() {
    this.switchSubtab(this.state.subtab);
  }

  handerChangeMarketBitmarks() {
    this.switchSubtab(this.state.subtab);
  }

  refreshPropertiesScreen() {
    AppController.doGetBitmarks().then(() => {
      this.switchSubtab(this.state.subtab);
    }).catch((error) => {
      console.log('getUserBitmark error :', error);
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
    let marketAssets = DataController.getUserBitmarks().marketAssets || [];
    let localAssets = DataController.getUserBitmarks().localAssets || [];
    let assets = [];
    if (subtab === SubTabs.local) {
      assets = this.convertToFlatListData(localAssets);
    } else if (subtab === SubTabs.market) {
      assets = this.convertToFlatListData(marketAssets);
    }
    this.setState({ subtab, assets, data: { localAssets, marketAssets } });
  }

  addProperty() {
    this.props.screenProps.homeNavigation.navigate('LocalAddProperty', {
      refreshPropertiesScreen: this.refreshPropertiesScreen,
    });
  }

  render() {
    return (
      <View style={assetsStyle.body}>
        <View style={defaultStyle.header}>
          <TouchableOpacity style={defaultStyle.headerLeft}></TouchableOpacity>
          <Text style={defaultStyle.headerTitle}>Properties</Text>
          <TouchableOpacity style={defaultStyle.headerRight} onPress={this.addProperty}>
            <Image style={assetsStyle.addPropertyIcon} source={require('./../../../../assets/imgs/plus-icon.png')} />
          </TouchableOpacity>
        </View>
        <View style={assetsStyle.subTabArea}>
          <TouchableOpacity style={assetsStyle.subTabButton} onPress={() => this.switchSubtab(SubTabs.local)}>
            <View style={assetsStyle.subTabButtonArea}>
              <View style={assetsStyle.subTabButtonTextArea}>
                <Text style={assetsStyle.subTabButtonText}>{SubTabs.local} ({this.state.data.localAssets.length})</Text>
              </View>
              <View style={[assetsStyle.activeSubTabBar, { backgroundColor: this.state.subtab === SubTabs.local ? '#0060F2' : 'white' }]}></View>
            </View>
          </TouchableOpacity>
          {!config.disabel_markets && <TouchableOpacity style={assetsStyle.subTabButton} onPress={() => this.switchSubtab(SubTabs.market)}>
            <View style={assetsStyle.subTabButtonArea}>
              <View style={assetsStyle.subTabButtonTextArea}>
                <Text style={assetsStyle.subTabButtonText}>{SubTabs.market} ({this.state.data.marketAssets.length})</Text>
              </View>
              <View style={[assetsStyle.activeSubTabBar, { backgroundColor: this.state.subtab === SubTabs.market ? '#0060F2' : 'white' }]}></View>
            </View>
          </TouchableOpacity>}
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
          <TouchableOpacity activeOpacity={1} style={assetsStyle.contentSubTab}>
            {(!this.state.assets || this.state.assets.length === 0) && <View style={assetsStyle.messageNoAssetArea}>
              {(this.state.subtab === SubTabs.local) && <Text style={assetsStyle.messageNoAssetLabel}>
                {'currently you own no property.'.toUpperCase()}
              </Text>}
              {(!config.disabel_markets && this.state.subtab === SubTabs.market) && <Text style={assetsStyle.messageNoAssetLabel}>
                {(config.disabel_markets ? 'Coming soon...' : 'YOu have not paired any markets.').toUpperCase()}
              </Text>}
              {(this.state.subtab === SubTabs.local) && <Text style={assetsStyle.messageNoAssetContent}>
                Here you will issue property titles (bitmarks), view and manage your properties, and have general account access and control.
                </Text>}
              {(this.state.subtab === SubTabs.local) && <TouchableOpacity style={assetsStyle.addFirstPropertyButton} onPress={this.addProperty}>
                <Text style={assetsStyle.addFirstPropertyButtonText}>{'create first property'.toUpperCase()}</Text>
              </TouchableOpacity>}
              {(this.state.subtab === SubTabs.market && !config.disabel_markets) && <Text style={assetsStyle.messageNoAssetContent}>
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
                  {!!item.asset.market && <Image style={assetsStyle.assetImage} source={{ uri: config.preive_asset_url + '/' + item.asset.asset_id }} />}
                  <View style={assetsStyle.assetBitmarkTitle}>
                    <Text style={assetsStyle.assetBitmarkPending}>{item.asset.totalPending === 0 ? '' : 'PENDING...'}</Text>
                    <Text style={[assetsStyle.assetBitmarksNumber, { color: item.asset.totalPending > 0 ? '#999999' : '#0060F2' }]}>{(item.asset.totalPending > 0 ? (item.asset.totalPending + '/') : '') + item.asset.bitmarks.length}</Text>
                    <Image style={assetsStyle.assetBitmarksDetail} source={item.asset.totalPending > 0 ? require('./../../../../assets/imgs/next-icon.png') : require('./../../../../assets/imgs/next-icon-blue.png')} />
                    <Image style={[assetsStyle.assetBitmarksDetail, { right: 7 }]} source={item.asset.totalPending > 0 ? require('./../../../../assets/imgs/next-icon.png') : require('./../../../../assets/imgs/next-icon-blue.png')} />
                  </View>
                  <View style={assetsStyle.assetInfoArea}>
                    <Text style={[assetsStyle.assetName, { color: item.asset.totalPending > 0 ? '#999999' : 'black' }]} numberOfLines={1}>{item.asset.name}</Text>
                    <View style={assetsStyle.assetCreatorRow}>
                      <Text style={[assetsStyle.assetCreatorBound, { color: item.asset.totalPending > 0 ? '#999999' : 'black' }]}>[</Text>
                      <Text style={[assetsStyle.assetCreator, { color: item.asset.totalPending > 0 ? '#999999' : 'black' }]} numberOfLines={1}>{item.asset.registrant}</Text>
                      <Text style={[assetsStyle.assetCreatorBound, { color: item.asset.totalPending > 0 ? '#999999' : 'black' }]}>]</Text>
                    </View>
                  </View>
                </TouchableOpacity>)
              }}
            />}
            {this.state.subtab === SubTabs.global && <View style={assetsStyle.globalArea}>
              <WebView source={{ uri: config.registry_server_url }} />
            </View>}
          </TouchableOpacity>
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
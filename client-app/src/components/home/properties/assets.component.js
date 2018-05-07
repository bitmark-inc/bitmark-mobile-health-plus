import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
  View, Text, TouchableOpacity, ScrollView, FlatList, Image, ActivityIndicator,
} from 'react-native';

import { config } from './../../../configs';
import assetsStyle from './assets.component.style';
import { AppController, DataController } from '../../../managers';
import { EventEmiterService } from '../../../services';

import defaultStyle from './../../../commons/styles';
import { BitmarkWebViewComponent } from '../../../commons/components/bitmark-web-view/bitmark-web-view.component';

const SubTabs = {
  local: 'Yours',
  tracking: 'TRACKED',
  global: 'Global',
}
export class AssetsComponent extends React.Component {
  constructor(props) {
    super(props);
    this.switchSubtab = this.switchSubtab.bind(this);
    this.addProperty = this.addProperty.bind(this);
    this.reloadData = this.reloadData.bind(this);
    this.handerChangeLocalBitmarks = this.handerChangeLocalBitmarks.bind(this);
    this.handerChangeTrackingBitmarks = this.handerChangeTrackingBitmarks.bind(this);
    this.handerLoadingData = this.handerLoadingData.bind(this);

    let subtab = SubTabs.local;
    let assets = DataController.getUserBitmarks().localAssets;

    let { trackingBitmarks } = DataController.getTrackingBitmarks();
    if (trackingBitmarks) {
      trackingBitmarks.forEach((trackingBitmark, index) => trackingBitmark.key = index);
    }
    this.state = {
      subtab,
      accountNumber: '',
      copyText: 'COPY',
      assets,
      existNew: (assets || []).findIndex(asset => !asset.isViewed) >= 0,
      trackingBitmarks,
      existNewTracking: (trackingBitmarks || []).findIndex(bm => !bm.isViewed) >= 0,
      isLoadingData: DataController.isLoadingData(),
      lengthDisplayAssets: 10,
      shoudlLoadMoreAsset: false,
    };
  }
  componentDidMount() {
    EventEmiterService.on(EventEmiterService.events.CHANGE_USER_DATA_LOCAL_BITMARKS, this.handerChangeLocalBitmarks);
    EventEmiterService.on(EventEmiterService.events.CHANGE_USER_DATA_TRACKING_BITMARKS, this.handerChangeTrackingBitmarks);
    EventEmiterService.on(EventEmiterService.events.APP_LOADING_DATA, this.handerLoadingData);
    if (this.props.screenProps.needReloadData) {
      this.reloadData();
      if (this.props.screenProps.doneReloadData) {
        this.props.screenProps.doneReloadData()
      }
    }
  }

  componentWillUnmount() {
    EventEmiterService.remove(EventEmiterService.events.CHANGE_USER_DATA_LOCAL_BITMARKS, this.handerChangeLocalBitmarks);
    EventEmiterService.remove(EventEmiterService.events.CHANGE_USER_DATA_TRACKING_BITMARKS, this.handerChangeTrackingBitmarks);
    EventEmiterService.remove(EventEmiterService.events.APP_LOADING_DATA, this.handerLoadingData);
  }

  handerChangeLocalBitmarks() {
    this.switchSubtab(this.state.subtab);
  }

  handerLoadingData() {
    this.setState({ isLoadingData: DataController.isLoadingData() });
  }
  handerChangeTrackingBitmarks() {
    this.switchSubtab(this.state.subtab);
  }

  reloadData() {
    AppController.doReloadUserData().then(() => {
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
    let assets = DataController.getUserBitmarks().localAssets;
    let { trackingBitmarks } = DataController.getTrackingBitmarks();
    if (trackingBitmarks) {
      trackingBitmarks.forEach((trackingBitmark, index) => trackingBitmark.key = index);
    }
    this.setState({
      subtab,
      assets,
      existNewAsset: (assets || []).findIndex(asset => !asset.isViewed) >= 0,
      trackingBitmarks,
      existNewTracking: (trackingBitmarks || []).findIndex(bm => !bm.isViewed) >= 0,
    });
  }

  addProperty() {
    this.props.navigation.navigate('LocalIssuance');
  }

  render() {
    return (
      <View style={assetsStyle.body}>
        <View style={[assetsStyle.header, { zIndex: 1 }]}>
          <TouchableOpacity style={defaultStyle.headerLeft}></TouchableOpacity>
          <Text style={defaultStyle.headerTitle}>{'Properties'.toUpperCase()}</Text>
          <TouchableOpacity style={defaultStyle.headerRight} onPress={this.addProperty}>
            <Image style={assetsStyle.addPropertyIcon} source={require('./../../../../assets/imgs/plus-icon.png')} />
          </TouchableOpacity>
        </View>

        <View style={assetsStyle.subTabArea}>
          {this.state.subtab === SubTabs.local && <TouchableOpacity style={[assetsStyle.subTabButton, {
            shadowOffset: { width: 2 },
            shadowOpacity: 0.15,
          }]}>
            <View style={assetsStyle.subTabButtonArea}>
              <View style={[assetsStyle.activeSubTabBar, { backgroundColor: '#0060F2' }]}></View>
              <View style={assetsStyle.subTabButtonTextArea}>
                {this.state.existNew && <View style={{
                  backgroundColor: '#0060F2',
                  width: 10, height: 10,
                  position: 'absolute', left: 9,
                  borderWidth: 1, borderRadius: 5, borderColor: '#0060F2'
                }}></View>}
                <Text style={assetsStyle.subTabButtonText}>{SubTabs.local.toUpperCase()} ({this.state.assets ? this.state.assets.length : 0})</Text>
              </View>
            </View>
          </TouchableOpacity>}
          {this.state.subtab !== SubTabs.local && <TouchableOpacity style={[assetsStyle.subTabButton, {
            backgroundColor: '#F5F5F5',
            zIndex: 0,
          }]} onPress={() => this.switchSubtab(SubTabs.local)}>
            <View style={assetsStyle.subTabButtonArea}>
              <View style={[assetsStyle.activeSubTabBar, { backgroundColor: '#F5F5F5' }]}></View>
              <View style={assetsStyle.subTabButtonTextArea}>
                <Text style={[assetsStyle.subTabButtonText, { color: '#C1C1C1' }]}>{SubTabs.local.toUpperCase()} ({this.state.assets ? this.state.assets.length : 0})</Text>
              </View>
            </View>
          </TouchableOpacity>}

          {this.state.subtab === SubTabs.tracking && <TouchableOpacity style={[assetsStyle.subTabButton, {
            shadowOffset: { width: -2 },
            shadowOpacity: 0.15,
          }]}>
            <View style={assetsStyle.subTabButtonArea}>
              <View style={[assetsStyle.activeSubTabBar, { backgroundColor: '#0060F2' }]}></View>
              <View style={assetsStyle.subTabButtonTextArea}>
                {this.state.existNewTracking && <View style={assetsStyle.newItem}></View>}
                <Text style={assetsStyle.subTabButtonText}>{SubTabs.tracking.toUpperCase()}</Text>
              </View>
            </View>
          </TouchableOpacity>}
          {this.state.subtab !== SubTabs.tracking && <TouchableOpacity style={[assetsStyle.subTabButton, {
            backgroundColor: '#F5F5F5',
            zIndex: 0,
          }]} onPress={() => this.switchSubtab(SubTabs.tracking)}>
            <View style={assetsStyle.subTabButtonArea}>
              <View style={[assetsStyle.activeSubTabBar, { backgroundColor: '#F5F5F5' }]}></View>
              <View style={assetsStyle.subTabButtonTextArea}>
                {this.state.existNewTracking && <View style={assetsStyle.newItem}></View>}
                <Text style={[assetsStyle.subTabButtonText, { color: '#C1C1C1' }]}>{SubTabs.tracking.toUpperCase()}</Text>
              </View>
            </View>
          </TouchableOpacity>}

          {this.state.subtab === SubTabs.global && <TouchableOpacity style={[assetsStyle.subTabButton, {
            shadowOffset: { width: -2 },
            shadowOpacity: 0.15,
          }]}>
            <View style={assetsStyle.subTabButtonArea}>
              <View style={[assetsStyle.activeSubTabBar, { backgroundColor: '#0060F2' }]}></View>
              <View style={assetsStyle.subTabButtonTextArea}>
                <Text style={assetsStyle.subTabButtonText}>{SubTabs.global.toUpperCase()}</Text>
              </View>
            </View>
          </TouchableOpacity>}
          {this.state.subtab !== SubTabs.global && <TouchableOpacity style={[assetsStyle.subTabButton, {
            backgroundColor: '#F5F5F5',
            zIndex: 0,
          }]} onPress={() => this.switchSubtab(SubTabs.global)}>
            <View style={assetsStyle.subTabButtonArea}>
              <View style={[assetsStyle.activeSubTabBar, { backgroundColor: '#F5F5F5' }]}></View>
              <View style={assetsStyle.subTabButtonTextArea}>
                <Text style={[assetsStyle.subTabButtonText, { color: '#C1C1C1' }]}>{SubTabs.global.toUpperCase()}</Text>
              </View>
            </View>
          </TouchableOpacity>}
        </View>

        {this.state.subtab == SubTabs.local && <ScrollView style={[assetsStyle.scrollSubTabArea]}
          onScroll={(scrollEvent) => {
            if (!this.spaceNeedLoadMore) {
              this.spaceNeedLoadMore = scrollEvent.nativeEvent.contentSize.height / 2;
            }
            if (scrollEvent.nativeEvent.contentOffset.y >= (scrollEvent.nativeEvent.contentSize.height - this.spaceNeedLoadMore) && this.state.lengthDisplayAssets < this.state.assets.length) {
              this.setState({ lengthDisplayAssets: this.state.lengthDisplayAssets + 10 });
            }
          }}
          scrollEventThrottle={1}
        >
          <TouchableOpacity activeOpacity={1} style={assetsStyle.contentSubTab}>
            {(this.state.isLoadingData && this.state.assets && this.state.assets.length === 0) && <View style={assetsStyle.messageNoAssetArea}>
              {(this.state.subtab === SubTabs.local) && <Text style={assetsStyle.messageNoAssetLabel}>
                {'YOU DO NOT OWN ANY PROPERTY.'.toUpperCase()}
              </Text>}
              {(this.state.subtab === SubTabs.local) && <Text style={assetsStyle.messageNoAssetContent}>
                Here you will issue property titles (bitmarks), view and manage your properties, and have general account access and control.
                </Text>}
              {(this.state.subtab === SubTabs.local) && <TouchableOpacity style={assetsStyle.addFirstPropertyButton} onPress={this.addProperty}>
                <Text style={assetsStyle.addFirstPropertyButtonText}>{'create first property'.toUpperCase()}</Text>
              </TouchableOpacity>}
            </View>}
            {(this.state.assets && this.state.assets.length > 0 && this.state.subtab === SubTabs.local) && <FlatList
              ref={(ref) => this.listViewElement = ref}
              extraData={this.state}
              data={(this.state.assets || []).slice(0, Math.min(this.state.lengthDisplayAssets, this.state.assets.length))}
              keyExtractor={item => item.id}
              renderItem={({ item }) => {
                return (<TouchableOpacity style={[assetsStyle.assetRowArea]} onPress={() => {
                  this.props.screenProps.homeNavigation.navigate('LocalAssetDetail', { asset: item });
                }} >
                  {!item.isViewed && <View style={{
                    backgroundColor: '#0060F2',
                    width: 10, height: 10,
                    position: 'absolute', left: 9, top: 22,
                    borderWidth: 1, borderRadius: 5, borderColor: '#0060F2'
                  }}></View>}

                  {/* {item.totalPending === 0 && <View style={assetsStyle.assetBitmarkTitle}>
                    <Text style={[assetsStyle.assetBitmarksNumber, { color: '#0060F2' }]}>{item.bitmarks.length}</Text>
                    <Image style={assetsStyle.assetBitmarksDetail} source={require('./../../../../assets/imgs/next-icon-blue.png')} />
                    <Image style={[assetsStyle.assetBitmarksDetail, { marginRight: 7 }]} source={require('./../../../../assets/imgs/next-icon-blue.png')} />
                  </View>}
                  {item.totalPending > 0 && <View style={assetsStyle.assetBitmarkTitle}>
                    <Text style={assetsStyle.assetBitmarkPending}>PENDING... ({item.totalPending + '/' + item.bitmarks.length})</Text>
                  </View>} */}

                  <View style={assetsStyle.assetInfoArea}>
                    <Text style={[assetsStyle.assetName, { color: item.totalPending > 0 ? '#999999' : 'black' }]} numberOfLines={1}>{item.name}</Text>
                    <View style={assetsStyle.assetCreatorRow}>
                      <Text style={[assetsStyle.assetCreator, { color: item.totalPending > 0 ? '#999999' : 'black' }]} numberOfLines={1}>
                        ISSUER: {'[' + item.registrant.substring(0, 4) + '...' + item.registrant.substring(item.registrant.length - 4, item.registrant.length) + ']'}
                      </Text>
                    </View>
                    <View style={assetsStyle.assetQuantityArea}>
                      {item.totalPending === 0 && <Text style={assetsStyle.assetQuantity}>QUANTITY: {item.bitmarks.length}</Text>}
                      {item.totalPending > 0 && <Text style={assetsStyle.assetQuantityPending}>QUANTITY: {item.totalPending + '/' + item.bitmarks.length} PENDING...</Text>}
                      {item.totalPending > 0 && <Image style={assetsStyle.assetQuantityPendingIcon} source={require('./../../../../assets/imgs/pending-status.png')} />}
                    </View>
                  </View>
                </TouchableOpacity>)
              }}
            />}
            {(!this.state.isLoadingData || this.state.lengthDisplayAssets < this.state.assets.length) && <View style={assetsStyle.messageNoAssetArea}>
              <ActivityIndicator size="large" style={{ marginTop: 46, }} />
            </View>}
          </TouchableOpacity>
        </ScrollView>}

        {this.state.subtab === SubTabs.tracking && <ScrollView style={[assetsStyle.scrollSubTabArea]}>
          <TouchableOpacity activeOpacity={1} style={assetsStyle.contentSubTab}>
            {(this.state.trackingBitmarks && this.state.trackingBitmarks.length === 0) && <View style={assetsStyle.messageNoAssetArea}>
              <Text style={assetsStyle.messageNoAssetLabel}>
                {'NO TRACKING PROPERTY.'.toUpperCase()}
              </Text>
              <Text style={assetsStyle.messageNoAssetContent}>
                By tracking a bitmark you can always view the latest bitmarks status and this is where all your tracking bitmarks will be displayed.
              </Text>
            </View>}
            {(this.state.trackingBitmarks && this.state.trackingBitmarks.length > 0 && this.state.subtab === SubTabs.tracking) && <FlatList
              ref={(ref) => this.listViewElement = ref}
              extraData={this.state}
              data={this.state.trackingBitmarks || []}
              renderItem={({ item }) => {
                return (<TouchableOpacity style={[assetsStyle.trackingRow]} onPress={() => {
                  this.props.screenProps.homeNavigation.navigate('LocalPropertyDetail', { asset: item.asset, bitmark: item });
                }} >
                  {!item.isViewed && <View style={[assetsStyle.newItem, { top: 20 }]}></View>}
                  <Text style={assetsStyle.trackingRowAssetName}>{item.asset.name}</Text>
                  <Text style={assetsStyle.trackingRowUpdated}>
                    {item.status === 'pending' ? 'PENDING...' : ('UPDATED: ' + moment(item.created_at).format('YYYY MM DD HH:mm:ss').toUpperCase())}
                  </Text>
                  <Text style={assetsStyle.trackingRowCurrentOwner}>CURRENT OWNER: {item.owner === DataController.getUserInformation().bitmarkAccountNumber ? ' YOU' : (
                    '[' + item.owner.substring(0, 4) + '...' + item.owner.substring(item.owner.length - 4, item.owner.length) + ']'
                  )}</Text>
                </TouchableOpacity>)
              }}
            />}
            {!this.state.isLoadingData && <View style={assetsStyle.messageNoAssetArea}>
              <ActivityIndicator size="large" style={{ marginTop: 46, }} />
            </View>}
          </TouchableOpacity>
        </ScrollView>}

        {this.state.subtab === SubTabs.global && <View style={assetsStyle.globalArea}>
          <BitmarkWebViewComponent screenProps={{ sourceUrl: config.registry_server_url + '?env=app', heightButtomController: 38 }} />
        </View>}
      </View>
    );
  }
}

AssetsComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
  }),
  screenProps: PropTypes.shape({
    logout: PropTypes.func,
    switchMainTab: PropTypes.func,
    homeNavigation: PropTypes.shape({
      navigate: PropTypes.func,
      goBack: PropTypes.func,
    }),
    needReloadData: PropTypes.bool,
    doneReloadData: PropTypes.func,
  }),

}
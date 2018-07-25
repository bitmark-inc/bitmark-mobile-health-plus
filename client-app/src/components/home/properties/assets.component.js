import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
  View, Text, TouchableOpacity, ScrollView, FlatList, Image, ActivityIndicator,
  Dimensions,
} from 'react-native';

import { config } from './../../../configs';
import assetsStyle from './assets.component.style';
import { AppProcessor, DataProcessor } from '../../../processors';
import { EventEmitterService } from '../../../services';

import defaultStyle from './../../../commons/styles';
import { BitmarkWebViewComponent } from './../../../commons/components';
import { CommonModel } from '../../../models';

let currentSize = Dimensions.get('window');

const SubTabs = {
  local: 'Yours',
  tracking: 'TRACKED',
  global: 'Global',
};
let ComponentName = 'AssetsComponent';
export class AssetsComponent extends React.Component {
  constructor(props) {
    super(props);
    this.switchSubTab = this.switchSubTab.bind(this);
    this.addProperty = this.addProperty.bind(this);
    this.reloadData = this.reloadData.bind(this);
    this.handerChangeLocalBitmarks = this.handerChangeLocalBitmarks.bind(this);
    this.handerChangeTrackingBitmarks = this.handerChangeTrackingBitmarks.bind(this);
    this.handerLoadingData = this.handerLoadingData.bind(this);

    EventEmitterService.remove(EventEmitterService.events.CHANGE_USER_DATA_LOCAL_BITMARKS, null, ComponentName);
    EventEmitterService.remove(EventEmitterService.events.CHANGE_USER_DATA_TRACKING_BITMARKS, null, ComponentName);
    EventEmitterService.remove(EventEmitterService.events.APP_LOADING_DATA, null, ComponentName);

    let subTab = SubTabs.local;

    this.state = {
      totalAssets: 0,
      totalBitmark: 0,
      totalTrackingBitmarks: 0,
      subTab,
      accountNumber: '',
      copyText: 'COPY',
      assets: null,
      existNewAsset: false,
      trackingBitmarks: null,
      existNewTracking: false,
      appLoadingData: DataProcessor.isAppLoadingData(),
      gettingData: true,
      lengthDisplayAssets: 0,

    };

    const doGetScreenData = async () => {
      let { localAssets, totalAssets, totalBitmarks, existNewAsset } = await DataProcessor.doGetLocalBitmarks(0);
      let { trackingBitmarks, existNewTrackingBitmark, totalTrackingBitmarks } = await DataProcessor.doGetTrackingBitmarks(0);
      if (trackingBitmarks) {
        trackingBitmarks.forEach((trackingBitmark, index) => trackingBitmark.key = index);
      }
      console.log('localAssets :', localAssets);
      this.setState({
        totalAssets,
        totalBitmarks,
        totalTrackingBitmarks,
        assets: localAssets,
        existNewAsset,
        trackingBitmarks,
        existNewTracking: existNewTrackingBitmark,
        gettingData: false,
        lengthDisplayAssets: localAssets.length,
      });
    }
    doGetScreenData();
  }
  componentDidMount() {
    EventEmitterService.on(EventEmitterService.events.CHANGE_USER_DATA_LOCAL_BITMARKS, this.handerChangeLocalBitmarks, ComponentName);
    EventEmitterService.on(EventEmitterService.events.CHANGE_USER_DATA_TRACKING_BITMARKS, this.handerChangeTrackingBitmarks, ComponentName);
    EventEmitterService.on(EventEmitterService.events.APP_LOADING_DATA, this.handerLoadingData, ComponentName);
    if (this.props.screenProps.needReloadData) {
      this.reloadData();
      if (this.props.screenProps.doneReloadData) {
        this.props.screenProps.doneReloadData()
      }
    }
  }

  handerChangeLocalBitmarks() {
    DataProcessor.doGetLocalBitmarks(this.state.lengthDisplayAssets).then(({ localAssets, totalAssets, totalBitmarks, existNewAsset }) => {
      this.setState({
        totalBitmarks,
        totalAssets,
        assets: localAssets,
        existNewAsset,
        lengthDisplayAssets: localAssets.length,
      });
    }).catch(error => {
      console.log('doGetLocalBitmarks error:', error);
    });
  }

  handerLoadingData() {
    this.setState({ appLoadingData: DataProcessor.isAppLoadingData() });
  }
  handerChangeTrackingBitmarks() {
    DataProcessor.doGetTrackingBitmarks(1).then(({ trackingBitmarks, existNewTrackingBitmark, totalTrackingBitmarks }) => {
      this.setState({
        trackingBitmarks,
        totalTrackingBitmarks,
        existNewTracking: existNewTrackingBitmark,
      });
    }).catch(error => {
      console.log('doGetTrackingBitmarks error:', error);
    });
  }

  reloadData() {
    AppProcessor.doReloadUserData().then(() => {
      this.switchSubTab(this.state.subTab);
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

  switchSubTab(subTab) {
    this.setState({ subTab, });
  }

  addProperty() {
    CommonModel.doTrackEvent({
      event_name: 'app_user_want_issue',
      account_number: DataProcessor.getUserInformation().bitmarkAccountNumber,
    });
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
          {this.state.subTab === SubTabs.local && <TouchableOpacity style={[assetsStyle.subTabButton, {
            shadowOffset: { width: 2 },
            shadowOpacity: 0.15,
          }]}>
            <View style={assetsStyle.subTabButtonArea}>
              <View style={[assetsStyle.activeSubTabBar, { backgroundColor: '#0060F2' }]}></View>
              <View style={assetsStyle.subTabButtonTextArea}>
                {this.state.existNewAsset && <View style={assetsStyle.newItem}></View>}
                <Text style={[assetsStyle.subTabButtonText, { marginLeft: this.state.totalBitmarks > 9 ? 8 : 0 }]}>
                  {SubTabs.local.toUpperCase()}
                  <Text style={{ fontSize: this.state.totalBitmarks > 9 ? 10 : 14 }}>{(this.state.totalBitmarks > 0 ? ` (${this.state.totalBitmarks > 99 ? '99+' : this.state.totalBitmarks})` : '')}</Text>
                </Text>
              </View>
            </View>
          </TouchableOpacity>}
          {this.state.subTab !== SubTabs.local && <TouchableOpacity style={[assetsStyle.subTabButton, {
            backgroundColor: '#F5F5F5',
            zIndex: 0,
          }]} onPress={() => this.switchSubTab(SubTabs.local)}>
            <View style={assetsStyle.subTabButtonArea}>
              <View style={[assetsStyle.activeSubTabBar, { backgroundColor: '#F5F5F5' }]}></View>
              <View style={assetsStyle.subTabButtonTextArea}>
                {this.state.existNewAsset && <View style={assetsStyle.newItem}></View>}
                <Text style={[assetsStyle.subTabButtonText, { color: '#C1C1C1', marginLeft: this.state.totalBitmarks > 9 ? 10 : 0 }]}>{SubTabs.local.toUpperCase()}<Text style={{ fontSize: this.state.totalBitmarks > 9 ? 8 : 14 }}>{(this.state.totalBitmarks > 0 ? ` (${this.state.totalBitmarks > 99 ? '99+' : this.state.totalBitmarks})` : '')}</Text></Text>
              </View>
            </View>
          </TouchableOpacity>}

          {this.state.subTab === SubTabs.tracking && <TouchableOpacity style={[assetsStyle.subTabButton, {
            shadowOffset: { width: -2 },
            shadowOpacity: 0.15,
          }]}>
            <View style={assetsStyle.subTabButtonArea}>
              <View style={[assetsStyle.activeSubTabBar, { backgroundColor: '#0060F2' }]}></View>
              <View style={assetsStyle.subTabButtonTextArea}>
                {this.existNewTracking && <View style={assetsStyle.newItem}></View>}
                <Text style={[assetsStyle.subTabButtonText, { marginLeft: this.state.totalTrackingBitmarks > 9 ? 10 : 0 }]}>{SubTabs.tracking.toUpperCase()}<Text style={{ fontSize: this.state.totalTrackingBitmarks > 9 ? 8 : 14 }}>{(this.state.totalTrackingBitmarks > 0 ? ` (${this.state.totalTrackingBitmarks > 99 ? '99+' : this.state.totalTrackingBitmarks})` : '')}</Text></Text>
              </View>
            </View>
          </TouchableOpacity>}
          {this.state.subTab !== SubTabs.tracking && <TouchableOpacity style={[assetsStyle.subTabButton, {
            backgroundColor: '#F5F5F5',
            zIndex: 0,
          }]} onPress={() => this.switchSubTab(SubTabs.tracking)}>
            <View style={assetsStyle.subTabButtonArea}>
              <View style={[assetsStyle.activeSubTabBar, { backgroundColor: '#F5F5F5' }]}></View>
              <View style={assetsStyle.subTabButtonTextArea}>
                {this.existNewTracking && <View style={assetsStyle.newItem}></View>}
                <Text style={[assetsStyle.subTabButtonText, { color: '#C1C1C1', marginLeft: this.state.totalTrackingBitmarks > 9 ? 10 : 0 }]}>{SubTabs.tracking.toUpperCase()}<Text style={{ fontSize: this.state.totalTrackingBitmarks > 9 ? 8 : 14 }}>{(this.state.totalTrackingBitmarks > 0 ? ` (${this.state.totalTrackingBitmarks > 99 ? '99+' : this.state.totalTrackingBitmarks})` : '')}</Text></Text>
              </View>
            </View>
          </TouchableOpacity>}

          {this.state.subTab === SubTabs.global && <TouchableOpacity style={[assetsStyle.subTabButton, {
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
          {this.state.subTab !== SubTabs.global && <TouchableOpacity style={[assetsStyle.subTabButton, {
            backgroundColor: '#F5F5F5',
            zIndex: 0,
          }]} onPress={() => this.switchSubTab(SubTabs.global)}>
            <View style={assetsStyle.subTabButtonArea}>
              <View style={[assetsStyle.activeSubTabBar, { backgroundColor: '#F5F5F5' }]}></View>
              <View style={assetsStyle.subTabButtonTextArea}>
                <Text style={[assetsStyle.subTabButtonText, { color: '#C1C1C1' }]}>{SubTabs.global.toUpperCase()}</Text>
              </View>
            </View>
          </TouchableOpacity>}
        </View>

        {this.state.subTab == SubTabs.local && <ScrollView style={[assetsStyle.scrollSubTabArea]}
          onScroll={async (scrollEvent) => {
            if (this.loadingDataWhenScroll) {
              return;
            }
            if (scrollEvent.nativeEvent.contentOffset.y >= (scrollEvent.nativeEvent.contentSize.height - currentSize.height) && (this.state.lengthDisplayAssets < this.state.totalAssets)) {
              this.loadingDataWhenScroll = true;
              let lengthDisplayAssets = Math.min(this.state.totalAssets, this.state.lengthDisplayAssets + 20);
              let { localAssets } = await DataProcessor.doGetLocalBitmarks(lengthDisplayAssets);
              this.setState({ lengthDisplayAssets: localAssets.length, assets: localAssets });
            }
            this.loadingDataWhenScroll = false;
          }}
          scrollEventThrottle={1}
        >
          <TouchableOpacity activeOpacity={1} style={assetsStyle.contentSubTab}>
            {(!this.state.appLoadingData && this.state.assets && this.state.assets.length === 0) && <View style={assetsStyle.messageNoAssetArea}>
              {(this.state.subTab === SubTabs.local) && <Text style={assetsStyle.messageNoAssetLabel}>
                {'Welcome to Bitmark!'.toUpperCase()}
              </Text>}
              {(this.state.subTab === SubTabs.local) && <Text style={assetsStyle.messageNoAssetContent}>
                Register, track, and trade property rights for your digital assets.
                </Text>}
            </View>}
            {(this.state.assets && this.state.assets.length > 0 && this.state.subTab === SubTabs.local) && <FlatList
              ref={(ref) => this.listViewElement = ref}
              extraData={this.state}
              data={this.state.assets || []}
              keyExtractor={item => item.id}
              renderItem={({ item }) => {
                return (<TouchableOpacity style={[assetsStyle.assetRowArea]} onPress={() => {
                  this.props.screenProps.homeNavigation.navigate('LocalAssetDetail', { asset: item });
                }} >
                  {!item.isViewed && <View style={[assetsStyle.newItem, { top: 22 }]}></View>}

                  <View style={assetsStyle.assetInfoArea}>
                    <Text style={[assetsStyle.assetCreatedAt, {
                      color: item.created_at ? 'black' : '#999999'
                    }]}>
                      {item.created_at ? moment(item.created_at).format('YYYY MMM DD HH:mm:ss').toUpperCase() : 'REGISTERING...'}
                    </Text>
                    <Text style={[assetsStyle.assetName, { color: item.created_at ? 'black' : '#999999' }]} numberOfLines={1}>{item.name}</Text>
                    <View style={assetsStyle.assetCreatorRow}>
                      <Text style={[assetsStyle.assetCreator, { color: item.created_at ? 'black' : '#999999' }]} numberOfLines={1}>
                        {item.registrant === DataProcessor.getUserInformation().bitmarkAccountNumber ? 'YOU' : '[' + item.registrant.substring(0, 4) + '...' + item.registrant.substring(item.registrant.length - 4, item.registrant.length) + ']'}
                      </Text>
                    </View>
                    <View style={assetsStyle.assetQuantityArea}>
                      {item.created_at && <Text style={assetsStyle.assetQuantity}>QUANTITY: {item.bitmarks.length}</Text>}
                      {!item.created_at && <Text style={assetsStyle.assetQuantityPending}>QUANTITY: {item.bitmarks.length}</Text>}
                      {!item.created_at && <Image style={assetsStyle.assetQuantityPendingIcon} source={require('./../../../../assets/imgs/pending-status.png')} />}
                    </View>
                  </View>
                </TouchableOpacity>)
              }}
            />}
            {(this.state.gettingData || this.state.appLoadingData || (this.state.assets && this.state.lengthDisplayAssets < this.state.totalAssets)) && <View style={assetsStyle.messageNoAssetArea}>
              <ActivityIndicator size="large" style={{ marginTop: 46, }} />
            </View>}
          </TouchableOpacity>
        </ScrollView>}

        {this.state.subTab === SubTabs.tracking && <ScrollView style={[assetsStyle.scrollSubTabArea]}>
          <TouchableOpacity activeOpacity={1} style={assetsStyle.contentSubTab}>
            {(this.state.trackingBitmarks && this.state.trackingBitmarks.length === 0) && <View style={assetsStyle.messageNoAssetArea}>
              <Text style={assetsStyle.messageNoAssetLabel}>
                {'Welcome to Bitmark!'.toUpperCase()}
              </Text>
              <Text style={assetsStyle.messageNoAssetContent}>
                Register, track, and trade property rights for your digital assets.
              </Text>
            </View>}
            {(this.state.trackingBitmarks && this.state.trackingBitmarks.length > 0 && this.state.subTab === SubTabs.tracking) && <FlatList
              ref={(ref) => this.listViewElement = ref}
              extraData={this.state}
              data={this.state.trackingBitmarks || []}
              renderItem={({ item }) => {
                return (<TouchableOpacity style={[assetsStyle.trackingRow]} onPress={() => {
                  this.props.screenProps.homeNavigation.navigate('LocalPropertyDetail', { asset: item.asset, bitmark: item });
                }} >
                  {!item.isViewed && <View style={[assetsStyle.newItem, { top: 22 }]}></View>}
                  <Text style={assetsStyle.trackingRowAssetName}>{item.asset.name}</Text>
                  <Text style={[assetsStyle.trackingRowUpdated, {
                    color: item.status === 'pending' ? '#999999' : '#0060F2'
                  }]}>
                    {item.status === 'pending' ? 'PENDING...' : ('UPDATED: ' + moment(item.created_at).format('YYYY MMM DD HH:mm:ss').toUpperCase())}
                  </Text>
                  <View style={assetsStyle.trackingRowCurrentOwner}>
                    <Text style={[assetsStyle.trackingRowCurrentOwnerText, {
                      color: item.status === 'pending' ? '#999999' : '#0060F2'
                    }]}>CURRENT OWNER: {item.owner === DataProcessor.getUserInformation().bitmarkAccountNumber ? ' YOU' : (
                      '[' + item.owner.substring(0, 4) + '...' + item.owner.substring(item.owner.length - 4, item.owner.length) + ']'
                    )}
                    </Text>
                    {item.status === 'pending' && <Image style={assetsStyle.assetQuantityPendingIcon} source={require('./../../../../assets/imgs/pending-status.png')} />}
                  </View>
                </TouchableOpacity>)
              }}
            />}
            {this.state.gettingData || this.state.appLoadingData && <View style={assetsStyle.messageNoAssetArea}>
              <ActivityIndicator size="large" style={{ marginTop: 46, }} />
            </View>}
          </TouchableOpacity>
        </ScrollView>}

        {this.state.subTab === SubTabs.global && <View style={assetsStyle.globalArea}>
          <BitmarkWebViewComponent screenProps={{ sourceUrl: config.registry_server_url + '?env=app', heightButtonController: 38 }} />
        </View>}

        {(!this.state.appLoadingData && this.state.assets && this.state.assets.length === 0 && this.state.subTab === SubTabs.local) &&
          <TouchableOpacity style={assetsStyle.addFirstPropertyButton} onPress={this.addProperty}>
            <Text style={assetsStyle.addFirstPropertyButtonText}>{'create first property'.toUpperCase()}</Text>
          </TouchableOpacity>
        }
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
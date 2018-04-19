import React from 'react';
import PropTypes from 'prop-types';
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
    this.convertToFlatListData = this.convertToFlatListData.bind(this);
    this.reloadData = this.reloadData.bind(this);
    this.handerChangeLocalBitmarks = this.handerChangeLocalBitmarks.bind(this);
    this.handerChangeTrackingBitmarks = this.handerChangeTrackingBitmarks.bind(this);
    this.handerLoadingData = this.handerLoadingData.bind(this);

    let subtab = SubTabs.local;
    let localAssets = DataController.getUserBitmarks().localAssets;
    let assets = null;
    if (subtab === SubTabs.local && localAssets) {
      assets = this.convertToFlatListData(localAssets);
    }
    let { trackingBitmarks } = DataController.getTrackingBitmarks();
    if (trackingBitmarks) {
      trackingBitmarks.forEach((trackingBitmark, index) => trackingBitmark.key = index);
    }
    this.state = {
      subtab,
      accountNumber: '',
      copyText: 'COPY',
      assets,
      existNewAsset: (localAssets || []).findIndex(asset => !asset.isViewed) >= 0,
      doneLoadDataFirstTime: DataController.isDoneFirstimeLoadData(),
      trackingBitmarks,
      existNewTracking: (trackingBitmarks || []).findIndex(bm => !bm.isViewed) >= 0,
      isLoadingData: DataController.isLoadingData(),
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
  handerLoadFistData() {
    this.setState({ doneLoadDataFirstTime: DataController.isDoneFirstimeLoadData(), });
  }
  handerChangeTrackingBitmarks() {
    this.switchSubtab(this.state.subtab);
  }

  handerLoadingData() {
    this.setState({ isLoadingData: DataController.isLoadingData() });
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
    let localAssets = DataController.getUserBitmarks().localAssets;
    let assets = null;
    if (localAssets) {
      assets = this.convertToFlatListData(localAssets);
    }
    let { trackingBitmarks } = DataController.getTrackingBitmarks();
    if (trackingBitmarks) {
      trackingBitmarks.forEach((trackingBitmark, index) => trackingBitmark.key = index);
    }
    this.setState({
      subtab,
      assets,
      existNewAsset: (localAssets || []).findIndex(asset => !asset.isViewed) >= 0,
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
                {this.state.existNewAsset && <View style={assetsStyle.newItem}></View>}
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
                {this.state.existNewAsset && <View style={assetsStyle.newItem}></View>}
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

        {this.state.subtab === SubTabs.local && <ScrollView style={[assetsStyle.scrollSubTabArea]}>
          <TouchableOpacity activeOpacity={1} style={assetsStyle.contentSubTab}>
            {(this.state.assets && this.state.assets.length === 0) && <View style={assetsStyle.messageNoAssetArea}>
              <Text style={assetsStyle.messageNoAssetLabel}>
                {'YOU DO NOT OWN ANY PROPERTY.'.toUpperCase()}
              </Text>
              <Text style={assetsStyle.messageNoAssetContent}>
                Here you will issue property titles (bitmarks), view and manage your properties, and have general account access and control.
                </Text>
              <TouchableOpacity style={assetsStyle.addFirstPropertyButton} onPress={this.addProperty}>
                <Text style={assetsStyle.addFirstPropertyButtonText}>{'create first property'.toUpperCase()}</Text>
              </TouchableOpacity>
            </View>}
            {(this.state.assets && this.state.assets.length > 0 && this.state.subtab === SubTabs.local) && <FlatList
              ref={(ref) => this.listViewElement = ref}
              extraData={this.state}
              data={this.state.assets || []}
              renderItem={({ item }) => {
                return (<TouchableOpacity style={[assetsStyle.assetRowArea]} onPress={() => {
                  this.props.screenProps.homeNavigation.navigate('LocalAssetDetail', { asset: item.asset });
                }} >
                  {!item.asset.isViewed && <View style={[assetsStyle.newItem, { top: 22 }]}></View>}

                  {/* {item.asset.totalPending === 0 && <View style={assetsStyle.assetBitmarkTitle}>
                    <Text style={[assetsStyle.assetBitmarksNumber, { color: '#0060F2' }]}>{item.asset.bitmarks.length}</Text>
                    <Image style={assetsStyle.assetBitmarksDetail} source={require('./../../../../assets/imgs/next-icon-blue.png')} />
                    <Image style={[assetsStyle.assetBitmarksDetail, { marginRight: 7 }]} source={require('./../../../../assets/imgs/next-icon-blue.png')} />
                  </View>}
                  {item.asset.totalPending > 0 && <View style={assetsStyle.assetBitmarkTitle}>
                    <Text style={assetsStyle.assetBitmarkPending}>PENDING... ({item.asset.totalPending + '/' + item.asset.bitmarks.length})</Text>
                  </View>} */}

                  <View style={assetsStyle.assetInfoArea}>
                    <Text style={[assetsStyle.assetName, { color: item.asset.totalPending > 0 ? '#999999' : 'black' }]} numberOfLines={1}>{item.asset.name}</Text>
                    <View style={assetsStyle.assetCreatorRow}>
                      <Text style={[assetsStyle.assetCreator, { color: item.asset.totalPending > 0 ? '#999999' : 'black' }]} numberOfLines={1}>
                        ISSUER: {item.asset.registrant === DataController.getUserInformation().bitmarkAccountNumber ? ' YOU' :
                          ('[' + item.asset.registrant.substring(0, 4) + '...' + item.asset.registrant.substring(item.asset.registrant.length - 4, item.asset.registrant.length) + ']')}
                      </Text>
                    </View>
                    <View style={assetsStyle.assetQuantityArea}>
                      {item.asset.totalPending === 0 && <Text style={assetsStyle.assetQuantity}>QUANTITY: {item.asset.bitmarks.length}</Text>}
                      {item.asset.totalPending > 0 && <Text style={assetsStyle.assetQuantityPending}>QUANTITY: {item.asset.totalPending + '/' + item.asset.bitmarks.length} PENDING...</Text>}
                      {item.asset.totalPending > 0 && <Image style={assetsStyle.assetQuantityPendingIcon} source={require('./../../../../assets/imgs/pending-status.png')} />}
                    </View>
                  </View>
                </TouchableOpacity>)
              }}
            />}
            {!this.state.isLoadingData && <View style={assetsStyle.messageNoAssetArea}>
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
                    {item.provenance[0].status === 'pending' ? 'PENDING...' : ('UPDATED: ' + item.provenance[0].created_at.toUpperCase())}
                  </Text>
                  <Text style={assetsStyle.trackingRowCurrentOwner}>CURRENT OWNER: {item.provenance[0].owner === DataController.getUserInformation().bitmarkAccountNumber ? ' YOU' : (
                    '[' + item.provenance[0].owner.substring(0, 4) + '...' + item.provenance[0].owner.substring(item.provenance[0].owner.length - 4, item.provenance[0].owner.length) + ']'
                  )}</Text>
                </TouchableOpacity>)
              }}
            />}
            {!this.state.doneLoadDataFirstTime && <View style={assetsStyle.messageNoAssetArea}>
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
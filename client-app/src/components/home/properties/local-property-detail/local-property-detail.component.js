import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
  View, Text, TouchableOpacity, Image, FlatList, ScrollView, ActivityIndicator, TouchableWithoutFeedback,
  Clipboard,
  Share,
  Alert,
} from 'react-native';

import { FullComponent } from './../../../../commons/components';
import { convertWidth } from './../../../../utils';

import propertyDetailStyle from './local-property-detail.component.style';
import defaultStyle from './../../../../commons/styles';
import { AppController } from '../../../../managers/app-controller';
import { EventEmiterService } from '../../../../services';
import { config } from '../../../../configs';
import { DataController } from '../../../../managers/data-controller';

let ComponentName = 'LocalPropertyDetailComponent';
export class LocalPropertyDetailComponent extends React.Component {
  constructor(props) {
    super(props);
    this.downloadAsset = this.downloadAsset.bind(this);
    this.clickOnProvenance = this.clickOnProvenance.bind(this);
    this.changeTrackingBitmark = this.changeTrackingBitmark.bind(this);
    this.handerChangeTrackingBitmarks = this.handerChangeTrackingBitmarks.bind(this);

    EventEmiterService.remove(EventEmiterService.events.CHANGE_USER_DATA_TRACKING_BITMARKS, null, ComponentName);

    let asset = this.props.navigation.state.params.asset;
    let bitmark = this.props.navigation.state.params.bitmark;
    let trackingBitmark = DataController.getTrackingBitmarkInformation(bitmark.id);
    let provenanceViewed = {};
    this.state = {
      provenanceViewed,
      isTracking: !!trackingBitmark,
      asset,
      bitmark,
      copied: false,
      displayTopButton: false,
      provenance: [],
      loading: true,
    };
    DataController.doGetProvenance(bitmark.id).then(provenance => {
      let provenanceViewed = {};
      provenance.forEach((history, index) => {
        history.key = index;
        provenanceViewed[history.tx_id] = history.isViewed;
      });
      this.setState({ provenance, provenanceViewed, loading: false });
      if (DataController.getUserInformation().bitmarkAccountNumber === this.state.bitmark.owner) {
        DataController.doUpdateViewStatus(this.state.asset.id, this.state.bitmark.id);
      } else {
        DataController.doUpdateViewStatus(null, this.state.bitmark.id);
      }
    }).catch(error => {
      this.setState({ loading: false });
      EventEmiterService.emit(EventEmiterService.events.APP_PROCESS_ERROR);
      console.log('error 2:', error);
    });
  }

  componentDidMount() {
    EventEmiterService.on(EventEmiterService.events.CHANGE_USER_DATA_TRACKING_BITMARKS, this.handerChangeTrackingBitmarks, ComponentName);
  }


  handerChangeTrackingBitmarks() {
    this.setState({ loading: true });
    DataController.doGetProvenance(this.state.bitmark.id).then(provenance => {
      let trackingBitmark = DataController.getTrackingBitmarkInformation(this.state.bitmark.id);
      console.log('trackingBitmark :', trackingBitmark);
      provenance.forEach((history, index) => {
        history.key = index;
      });
      this.setState({ provenance, isTracking: !!trackingBitmark, loading: false });
      if (DataController.getUserInformation().bitmarkAccountNumber === this.state.bitmark.owner) {
        DataController.doUpdateViewStatus(this.state.asset.id, this.state.bitmark.id);
      } else {
        DataController.doUpdateViewStatus(null, this.state.bitmark.id);
      }
    }).catch(error => {
      this.setState({ loading: false });
      console.log('error 1 :', error);
    });
  }

  downloadAsset() {
    AppController.doDownloadBitmark(this.state.bitmark, {
      indicator: true, title: 'Preparing to export...', message: `Downloading “${this.state.asset.name}”...`
    }).then(filePath => {
      Share.share({ title: this.state.asset.name, message: '', url: filePath });
    }).catch(error => {
      EventEmiterService.emit(EventEmiterService.events.APP_PROCESS_ERROR, { title: "Your bitmark isn't ready to download.\nPlease try again later." });
      console.log('doDownload asset error :', error);
    });
  }

  clickOnProvenance(item) {
    let sourceUrl = config.registry_server_url + `/account/${item.owner}?env=app`;
    this.props.navigation.navigate('BitmarkWebView', { title: 'Registry', sourceUrl, isFullScreen: true });
  }

  changeTrackingBitmark() {
    //TODO
    if (!this.state.isTracking) {
      Alert.alert('Track This Bitmark', 'By tracking a bitmark you can always view the latest bitmarks status in the tracked properties list, are you sure you want to do it?', [{
        text: 'NO', style: 'cancel',
      }, {
        text: 'YES',
        onPress: () => {
          AppController.doTrackingBitmark(this.state.asset, this.state.bitmark).catch(error => {
            EventEmiterService.emit(EventEmiterService.events.APP_PROCESS_ERROR);
            console.log('doTrackingBitmark error :', error);
          });
        }
      }]);
    } else {
      Alert.alert('Stop Tracking', 'By stop tracking a bitmark, the bitmark will be removed from the tracked list, are you sure you want to do it?', [{
        text: 'NO', style: 'cancel',
      }, {
        text: 'YES',
        onPress: () => {
          AppController.doStopTrackingBitmark(this.state.bitmark).catch(error => {
            EventEmiterService.emit(EventEmiterService.events.APP_PROCESS_ERROR);
            console.log('doTrackingBitmark error :', error);
          });
        }
      }]);
    }
  }

  render() {
    return (
      <FullComponent
        header={(<TouchableWithoutFeedback onPress={() => this.setState({ displayTopButton: false })}><View style={defaultStyle.header}>
          <TouchableOpacity style={defaultStyle.headerLeft} onPress={() => this.props.navigation.goBack()}>
            <Image style={defaultStyle.headerLeftIcon} source={require('../../../../../assets/imgs/header_blue_icon.png')} />
          </TouchableOpacity>
          <View style={defaultStyle.headerCenter}>
            <Text style={[defaultStyle.headerTitle, { maxWidth: convertWidth(180), }]} numberOfLines={1}>{this.state.asset.name} </Text>
            {this.state.asset.bitmarks && this.state.asset.bitmarks.length > 0 && <Text style={[defaultStyle.headerTitle]}>({this.state.asset.bitmarks.indexOf(this.state.bitmark) + 1}/{this.state.asset.bitmarks.length})</Text>}
          </View>
          <TouchableOpacity style={[defaultStyle.headerRight, { padding: 4 }]} onPress={() => this.setState({ displayTopButton: !this.state.displayTopButton })}>
            <Image style={propertyDetailStyle.threeDotIcon} source={this.state.displayTopButton
              ? require('../../../../../assets/imgs/three-dot-active.png')
              : require('../../../../../assets/imgs/three-dot-deactive.png')} />
          </TouchableOpacity>
        </View></TouchableWithoutFeedback>)}
        content={(<TouchableWithoutFeedback onPress={() => this.setState({ displayTopButton: false })}><View style={propertyDetailStyle.body}>
          {this.state.displayTopButton && <View style={propertyDetailStyle.topButtonsArea}>
            <TouchableOpacity style={propertyDetailStyle.downloadAssetButton} disabled={this.state.bitmark.displayStatus !== 'confirmed'} onPress={this.downloadAsset}>
              <Text style={[propertyDetailStyle.downloadAssetButtonText, { color: this.state.bitmark.displayStatus === 'confirmed' ? '#0060F2' : '#A4B5CD', }]}>DOWNLOAD ASSET</Text>
            </TouchableOpacity>
            <TouchableOpacity style={propertyDetailStyle.topButton} onPress={() => {
              Clipboard.setString(this.state.bitmark.id);
              this.setState({ copied: true });
              setTimeout(() => { this.setState({ copied: false }) }, 1000);
            }}>
              <Text style={propertyDetailStyle.topButtonText}>COPY BITMARK ID</Text>
              {this.state.copied && <Text style={propertyDetailStyle.copiedAssetIddButtonText}>Copied to clipboard!</Text>}
            </TouchableOpacity>
            {config.network === config.NETWORKS.testnet && <TouchableOpacity style={propertyDetailStyle.topButton}
              disabled={this.state.bitmark.displayStatus !== 'confirmed'}
              onPress={() => this.props.navigation.navigate('LocalPropertyTransfer', { bitmark: this.state.bitmark, asset: this.state.asset })}>
              <Text style={[propertyDetailStyle.topButtonText, {
                color: this.state.bitmark.displayStatus === 'confirmed' ? '#0060F2' : '#C2C2C2'
              }]}>TRANSFER</Text>
            </TouchableOpacity>}
            <TouchableOpacity style={propertyDetailStyle.topButton} onPress={this.changeTrackingBitmark}>
              <Text style={[propertyDetailStyle.topButtonText]}>{this.state.isTracking ? 'STOP TRACKING' : 'TRACK'}</Text>
            </TouchableOpacity>

          </View>}
          <ScrollView style={propertyDetailStyle.content}>
            <TouchableOpacity activeOpacity={1} style={{ flex: 1 }} onPress={() => this.setState({ displayTopButton: false })}>
              <View style={propertyDetailStyle.bottomImageBar}></View>
              <Text style={[propertyDetailStyle.assetName, { color: this.state.bitmark.displayStatus === 'pending' ? '#999999' : 'black' }]}>{this.state.asset.name}</Text>
              <Text style={[propertyDetailStyle.assetCreateAt, { color: this.state.bitmark.displayStatus === 'pending' ? '#999999' : 'black' }]}>
                ISSUED {this.state.bitmark.displayStatus === 'pending' ? '' : ('ON ' + moment(this.state.bitmark.created_at).format('YYYY MMM DD HH:mm:ss').toUpperCase())}{'\n'}BY {'[' + this.state.asset.registrant.substring(0, 4) + '...' + this.state.asset.registrant.substring(this.state.asset.registrant.length - 4, this.state.asset.registrant.length) + ']'}
              </Text>
              <Text style={[propertyDetailStyle.provenanceLabel, { color: this.state.bitmark.displayStatus === 'pending' ? '#999999' : 'black' }]}>PROVENANCE</Text>
              <View style={propertyDetailStyle.provenancesArea}>
                <View style={propertyDetailStyle.provenancesHeader}>
                  <Text style={propertyDetailStyle.provenancesHeaderLabelTimestamp}>TIMESTAMP</Text>
                  <Text style={propertyDetailStyle.provenancesHeaderLabelOwner}>OWNER</Text>
                </View>
                <View style={propertyDetailStyle.provenanceListArea}>
                  <FlatList
                    scrollEnabled={false}
                    extraData={this.state}
                    data={this.state.provenance || []}
                    renderItem={({ item }) => {
                      return (<TouchableOpacity style={propertyDetailStyle.provenancesRow} onPress={() => this.clickOnProvenance(item)}>
                        {this.state.isTracking && !this.state.provenanceViewed[item.tx_id] && !item.isViewed && <View style={propertyDetailStyle.provenancesNotView}></View>}
                        <Text style={[propertyDetailStyle.provenancesRowTimestamp, { color: item.status === 'pending' ? '#999999' : '#0060F2' }]} numberOfLines={1}>
                          {item.status === 'pending' ? 'PENDING…' : item.created_at.toUpperCase()}
                        </Text>
                        <View style={propertyDetailStyle.provenancesRowOwnerRow}>
                          <Text style={[propertyDetailStyle.provenancesRowOwner, { color: item.status === 'pending' ? '#999999' : '#0060F2' }]} numberOfLines={1}>
                            {item.owner === DataController.getUserInformation().bitmarkAccountNumber ? 'YOU' : '[' + item.owner.substring(0, 4) + '...' + item.owner.substring(item.owner.length - 4, item.owner.length) + ']'}
                          </Text>
                        </View>
                      </TouchableOpacity>);
                    }}
                  />
                  {this.state.loading && <ActivityIndicator style={{ marginTop: 42 }} size="large" />}
                </View>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View></TouchableWithoutFeedback>)}
      />
    );
  }
}

LocalPropertyDetailComponent.propTypes = {
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
}
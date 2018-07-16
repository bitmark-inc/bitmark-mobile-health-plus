import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
  View, Text, TouchableOpacity, Image, FlatList, ScrollView, ActivityIndicator, TouchableWithoutFeedback,
  Clipboard,
  Share,
  Alert,
} from 'react-native';
import Hyperlink from 'react-native-hyperlink';

import { BitmarkComponent } from './../../../../commons/components';
import { convertWidth } from './../../../../utils';

import propertyDetailStyle from './local-property-detail.component.style';
import defaultStyle from './../../../../commons/styles';
import { AppProcessor } from '../../../../processors/app-processor';
import { EventEmitterService } from '../../../../services';
import { config } from '../../../../configs';
import { DataProcessor } from '../../../../processors/data-processor';
import { BitmarkModel } from '../../../../models';

let ComponentName = 'LocalPropertyDetailComponent';
export class LocalPropertyDetailComponent extends React.Component {
  constructor(props) {
    super(props);
    this.downloadAsset = this.downloadAsset.bind(this);
    this.clickOnProvenance = this.clickOnProvenance.bind(this);
    this.changeTrackingBitmark = this.changeTrackingBitmark.bind(this);
    this.handerChangeTrackingBitmarks = this.handerChangeTrackingBitmarks.bind(this);
    this.handerChangeLocalBitmarks = this.handerChangeLocalBitmarks.bind(this);
    this.doGetScreenData = this.doGetScreenData.bind(this);

    EventEmitterService.remove(EventEmitterService.events.CHANGE_USER_DATA_TRACKING_BITMARKS, null, ComponentName);
    EventEmitterService.remove(EventEmitterService.events.CHANGE_USER_DATA_LOCAL_BITMARKS, null, ComponentName);

    let asset = this.props.navigation.state.params.asset;
    let bitmark = this.props.navigation.state.params.bitmark;

    let provenanceViewed = {};
    let metadata = [];
    let index = 0;
    for (let label in asset.metadata) {
      metadata.push({ key: index, label, value: asset.metadata[label] });
      index++;
    }
    this.state = {
      metadata,
      provenanceViewed,
      isTracking: false,
      asset,
      bitmark,
      copied: false,
      displayTopButton: false,
      provenance: [],
      gettingData: true,
    };
    this.doGetScreenData(bitmark);
  }
  async doGetScreenData(bitmark) {
    let trackingBitmark = await DataProcessor.doGetTrackingBitmarkInformation(bitmark.id);
    let provenance = await DataProcessor.doGetProvenance(bitmark.id);
    let provenanceViewed = {};
    provenance.forEach((history, index) => {
      history.key = index;
      provenanceViewed[history.tx_id] = history.isViewed;
    });

    if (DataProcessor.getUserInformation().bitmarkAccountNumber === this.state.bitmark.owner) {
      DataProcessor.doUpdateViewStatus(this.state.asset.id, this.state.bitmark.id);
    } else {
      DataProcessor.doUpdateViewStatus(null, this.state.bitmark.id);
    }

    // Augment info for asset preview
    let contentType = await BitmarkModel.doGetAssetTextContentType(this.state.asset.id);
    let assetTextContent;
    if (contentType && contentType === 'text') {
      assetTextContent = await BitmarkModel.doGetAssetTextContent(this.state.asset.id);
    }

    this.setState({
      contentType,
      assetTextContent,
      provenance, provenanceViewed, gettingData: false,
      isTracking: !!trackingBitmark,
    });
  }

  componentDidMount() {
    EventEmitterService.on(EventEmitterService.events.CHANGE_USER_DATA_TRACKING_BITMARKS, this.handerChangeTrackingBitmarks, ComponentName);
    EventEmitterService.on(EventEmitterService.events.CHANGE_USER_DATA_LOCAL_BITMARKS, this.handerChangeLocalBitmarks, ComponentName);
  }

  handerChangeLocalBitmarks() {
    DataProcessor.doGetLocalBitmarkInformation(this.state.bitmark.id, this.state.asset.id).then(data => {
      if (data && data.bitmark && data.asset &&
        (JSON.stringify(this.state.bitmark) !== JSON.stringify(data.bitmark) || JSON.stringify(this.state.asset) !== JSON.stringify(data.asset))) {
        this.setState({
          bitmark: data.bitmark,
          asset: data.asset,
        });
        this.doGetScreenData(data.bitmark);
      }
    });
  }

  handerChangeTrackingBitmarks() {
    this.setState({ gettingData: true });
    this.doGetScreenData(this.state.bitmark);
  }

  downloadAsset() {
    AppProcessor.doDownloadBitmark(this.state.bitmark, {
      indicator: true, title: 'Preparing to export...', message: `Downloading “${this.state.asset.name}”...`
    }).then(filePath => {
      if (filePath) {
        Share.share({ title: this.state.asset.name, message: '', url: filePath });
      }
    }).catch(error => {
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { title: "Your bitmark isn't ready to download.\nPlease try again later." });
      console.log('doDownload asset error :', error);
    });
  }

  clickOnProvenance(item) {
    let sourceUrl = config.registry_server_url + `/account/${item.owner}?env=app`;
    this.props.navigation.navigate('BitmarkWebView', { title: 'Registry', sourceUrl, isFullScreen: true });
  }

  changeTrackingBitmark() {
    if (!this.state.isTracking) {
      Alert.alert('Track This Bitmark', 'By tracking a bitmark you can always view the latest bitmarks status in the tracked properties list, are you sure you want to do it?', [{
        text: 'Cancel', style: 'cancel',
      }, {
        text: 'YES',
        onPress: () => {
          AppProcessor.doTrackingBitmark(this.state.asset, this.state.bitmark).catch(error => {
            EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, {error});
            console.log('doTrackingBitmark error :', error);
          });
        }
      }]);
    } else {
      Alert.alert('Stop Tracking', 'If you stop tracking a bitmark, the bitmark will be removed from the tracked list, are you sure you want to do it?', [{
        text: 'Cancel', style: 'cancel',
      }, {
        text: 'YES',
        onPress: () => {
          AppProcessor.doStopTrackingBitmark(this.state.bitmark).catch(error => {
            EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, {error});
            console.log('doTrackingBitmark error :', error);
          });
        }
      }]);
    }
  }

  render() {
    return (
      <BitmarkComponent
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
            {this.state.bitmark.owner === DataProcessor.getUserInformation().bitmarkAccountNumber && <TouchableOpacity style={propertyDetailStyle.downloadAssetButton} disabled={this.state.bitmark.status !== 'confirmed'} onPress={this.downloadAsset}>
              <Text style={[propertyDetailStyle.downloadAssetButtonText, { color: this.state.bitmark.status === 'confirmed' ? '#0060F2' : '#A4B5CD', }]}>DOWNLOAD ASSET</Text>
            </TouchableOpacity>}
            <TouchableOpacity style={propertyDetailStyle.topButton} onPress={() => {
              Clipboard.setString(this.state.bitmark.id);
              this.setState({ copied: true });
              setTimeout(() => { this.setState({ copied: false }) }, 1000);
            }}>
              <Text style={propertyDetailStyle.topButtonText}>COPY BITMARK ID</Text>
              {this.state.copied && <Text style={propertyDetailStyle.copiedAssetIddButtonText}>Copied to clipboard!</Text>}
            </TouchableOpacity>
            {this.state.bitmark.owner === DataProcessor.getUserInformation().bitmarkAccountNumber && !this.state.bitmark.transferOfferId &&
              <TouchableOpacity style={propertyDetailStyle.topButton}
                disabled={this.state.bitmark.status !== 'confirmed'}
                onPress={() => this.props.navigation.navigate('LocalPropertyTransfer', { bitmark: this.state.bitmark, asset: this.state.asset })}>
                <Text style={[propertyDetailStyle.topButtonText, {
                  color: this.state.bitmark.status === 'confirmed' ? '#0060F2' : '#C2C2C2'
                }]}>SEND BITMARK</Text>
              </TouchableOpacity>
            }
            <TouchableOpacity style={propertyDetailStyle.topButton} onPress={this.changeTrackingBitmark}>
              <Text style={[propertyDetailStyle.topButtonText]}>{this.state.isTracking ? 'STOP TRACKING' : 'TRACK BITMARK'}</Text>
            </TouchableOpacity>

          </View>}
          <ScrollView style={propertyDetailStyle.content}>
            <TouchableOpacity activeOpacity={1} style={{ flex: 1 }} onPress={() => this.setState({ displayTopButton: false })}>
              <View style={propertyDetailStyle.bottomImageBar}></View>
              <Text style={[propertyDetailStyle.assetName, { color: this.state.bitmark.status === 'pending' ? '#999999' : 'black' }]}>{this.state.asset.name}</Text>

              {this.state.bitmark.status !== 'pending' && <Hyperlink
                onPress={(url) => {
                  if (this.state.bitmark.status === 'confirmed') {
                    this.props.navigation.navigate('BitmarkWebView', { title: 'REGISTRY', sourceUrl: url, isFullScreen: true, });
                  }
                }}
                linkStyle={{ color: this.state.bitmark.status === 'pending' ? '#999999' : '#0060F2' }}
                linkText={url => {
                  if (url === `${config.registry_server_url}/account/${this.state.bitmark.issuer}`) {
                    if (this.state.bitmark.issuer === DataProcessor.getUserInformation().bitmarkAccountNumber) {
                      return 'YOU';
                    }
                    return `[${this.state.bitmark.issuer.substring(0, 4)}...${this.state.bitmark.issuer.substring(this.state.bitmark.issuer.length - 4, this.state.bitmark.issuer.length)}]`;
                  }
                  return '';
                }}>
                <Text style={[propertyDetailStyle.assetCreateAt]}>
                  ISSUED ON {moment(this.state.bitmark.created_at).format('YYYY MMM DD HH:mm:ss').toUpperCase()}{'\n'}BY {`${config.registry_server_url}/account/${this.state.bitmark.issuer}`}
                </Text>
              </Hyperlink>}

              {this.state.bitmark.status === 'pending' && <Text style={[propertyDetailStyle.assetCreateAt, { color: '#999999' }]}>
                PENDING....
              </Text>}

              {this.state.metadata && this.state.metadata.length > 0 && <View style={propertyDetailStyle.metadataArea}>
                <FlatList
                  scrollEnabled={false}
                  extraData={this.state}
                  data={this.state.metadata || []}
                  renderItem={({ item }) => {
                    return (<View style={[propertyDetailStyle.metadataItem, { marginBottom: item.key === this.state.metadata.length ? 0 : 15 }]}>
                      <Text style={[propertyDetailStyle.metadataItemLabel, { color: this.state.bitmark.status === 'pending' ? '#999999' : 'black' }]}>{item.label.toUpperCase()}:</Text>
                      <Text style={[propertyDetailStyle.metadataItemValue, { color: this.state.bitmark.status === 'pending' ? '#999999' : 'black' }]}>{item.value}</Text>
                    </View>);
                  }}
                />
              </View>}

              {/*Preview*/}
              {/*Text preview*/}
              {this.state.contentType && this.state.contentType === 'text' &&
                <ScrollView style={propertyDetailStyle.assetPreview}>
                  <TouchableOpacity style={{ flex: 1 }}>
                    {this.state.assetTextContent &&
                      <Text>{this.state.assetTextContent}</Text>
                    }
                  </TouchableOpacity>
                </ScrollView>
              }
              {/*Image preview*/}
              {this.state.contentType && this.state.contentType === 'image' &&
                <View style={propertyDetailStyle.assetPreview}>
                  <Image
                    style={{ width: 125, height: 125 }}
                    source={{ uri: `${config.preview_asset_url}/${this.state.asset.id}` }}
                  />
                </View>
              }


              <Text style={[propertyDetailStyle.provenanceLabel]}>PROVENANCE</Text>
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
                      return (<TouchableOpacity style={propertyDetailStyle.provenancesRow} onPress={() => this.clickOnProvenance(item)} disabled={item.status === 'pending'}>
                        {this.state.isTracking && !this.state.provenanceViewed[item.tx_id] && !item.isViewed && <View style={propertyDetailStyle.provenancesNotView}></View>}
                        <Text style={[propertyDetailStyle.provenancesRowTimestamp, { color: item.status === 'pending' ? '#999999' : '#0060F2' }]} numberOfLines={1}>
                          {item.status === 'pending' ? 'PENDING…' : item.created_at.toUpperCase()}
                        </Text>
                        <View style={propertyDetailStyle.provenancesRowOwnerRow}>
                          <Text style={[propertyDetailStyle.provenancesRowOwner, { color: item.status === 'pending' ? '#999999' : '#0060F2' }]} numberOfLines={1}>
                            {item.owner === DataProcessor.getUserInformation().bitmarkAccountNumber ? 'YOU' : '[' + item.owner.substring(0, 4) + '...' + item.owner.substring(item.owner.length - 4, item.owner.length) + ']'}
                          </Text>
                        </View>
                      </TouchableOpacity>);
                    }}
                  />
                  {this.state.gettingData && <ActivityIndicator style={{ marginTop: 42 }} size="large" />}
                </View>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View></ TouchableWithoutFeedback>)}
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
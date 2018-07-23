import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, Image, ScrollView, TouchableWithoutFeedback,
  Clipboard,
  FlatList,
  Share,
  Alert,
} from 'react-native';
import Hyperlink from 'react-native-hyperlink';

import { BitmarkComponent } from './../../../../commons/components';

import assetDetailStyle from './local-asset-detail.component.style';
import defaultStyle from './../../../../commons/styles';
import { AppProcessor, DataProcessor } from '../../../../processors';
import { EventEmitterService } from '../../../../services';
import { config } from './../../../../configs';
import { BitmarkModel } from "../../../../models";
import { convertWidth } from '../../../../utils';
import moment from 'moment';

let ComponentName = 'LocalAssetDetailComponent';
export class LocalAssetDetailComponent extends React.Component {
  constructor(props) {
    super(props);
    this.cancelTransferring = this.cancelTransferring.bind(this);
    this.handerChangeLocalBitmarks = this.handerChangeLocalBitmarks.bind(this);
    this.downloadAsset = this.downloadAsset.bind(this);

    EventEmitterService.remove(EventEmitterService.events.CHANGE_USER_DATA_LOCAL_BITMARKS, null, ComponentName);

    let asset;
    asset = this.props.navigation.state.params.asset;

    let bitmarks = [];
    let bitmarkCanDownload;
    asset.bitmarks.forEach((bitmark, index) => {
      if (!bitmarkCanDownload && bitmark.status === 'confirmed') {
        bitmarkCanDownload = bitmark;
      }
      bitmarks.push({ key: index, bitmark });
    });
    let metadata = [];
    let index = 0;
    for (let label in asset.metadata) {
      metadata.push({ key: index, label, value: asset.metadata[label] });
      index++;
    }
    this.state = {
      asset,
      metadata,
      bitmarks,
      displayTopButton: false,
      copied: false,
      bitmarkCanDownload,
    };
  }

  async componentDidMount() {
    EventEmitterService.on(EventEmitterService.events.CHANGE_USER_DATA_LOCAL_BITMARKS, this.handerChangeLocalBitmarks, ComponentName);
    DataProcessor.doUpdateViewStatus(this.state.asset);

    // Augment info for asset preview
    let contentType = await BitmarkModel.doGetAssetTextContentType(this.state.asset.id);
    if (contentType && contentType === 'text') {
      let text = await BitmarkModel.doGetAssetTextContent(this.state.asset.id);
      this.setState({ assetTextContent: text });
    }

    this.setState({ contentType });
  }

  handerChangeLocalBitmarks() {
    DataProcessor.doGetLocalBitmarkInformation(null, this.state.asset.id).then(data => {
      if (data.asset) {
        let bitmarks = [];
        let bitmarkCanDownload;
        data.asset.bitmarks.forEach((bitmark, index) => {
          if (!bitmarkCanDownload && bitmark.status === 'confirmed') {
            bitmarkCanDownload = bitmark;
          }
          bitmarks.push({ key: index, bitmark });
        });
        this.setState({ asset: data.asset, bitmarks, bitmarkCanDownload });
      } else {
        this.props.navigation.goBack();
      }
    });
  }

  cancelTransferring(bitmark) {
    let title = 'Cancel Send Request';
    let message = 'Are you sure you want to cancel this request?';
    let faceTouchMessage;
    if (bitmark.isDonatedBitmark) {
      title = 'Cancel Donation';
      message = 'Are you sure you want to cancel this data donation?';
      faceTouchMessage = 'Please sign to cancel donation.';
    }

    Alert.alert(title, message, [{
      text: 'Cancel', style: 'cancel',
    }, {
      text: 'Yes',
      onPress: () => {
        AppProcessor.doCancelTransferBitmark(bitmark.transferOfferId, faceTouchMessage).catch(error => {
          console.log('cancel transferring bitmark error :', error);
          EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, {
            onClose: async () => {
              AppProcessor.doReloadUserData().catch(error => {
                console.log('AppProcessor.doReloadUserData error', error);
              });
            },
            error
          });
        });
      }
    }]);
  }

  downloadAsset() {
    AppProcessor.doDownloadBitmark(this.state.bitmarkCanDownload, {
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

  render() {
    return (
      <BitmarkComponent
        header={(<TouchableWithoutFeedback onPress={() => this.setState({ displayTopButton: false })}><View style={defaultStyle.header}>
          <TouchableOpacity style={defaultStyle.headerLeft} onPress={() => this.props.navigation.goBack()}>
            <Image style={defaultStyle.headerLeftIcon} source={require('../../../../../assets/imgs/header_blue_icon.png')} />
          </TouchableOpacity>
          <Text style={[defaultStyle.headerTitle]} numberOfLines={1}>{this.state.asset.name}</Text>
          <TouchableOpacity style={defaultStyle.headerRight} onPress={() => this.setState({ displayTopButton: !this.state.displayTopButton })}>
            <Image style={assetDetailStyle.threeDotIcon} source={this.state.displayTopButton
              ? require('../../../../../assets/imgs/three-dot-active.png')
              : require('../../../../../assets/imgs/three-dot-deactive.png')} />
          </TouchableOpacity>
        </View></TouchableWithoutFeedback>)}
        content={(<TouchableWithoutFeedback onPress={() => this.setState({ displayTopButton: false })}><View style={assetDetailStyle.body}>
          {this.state.displayTopButton && <View style={assetDetailStyle.topButtonsArea}>
            <TouchableOpacity style={assetDetailStyle.downloadAssetButton} disabled={!this.state.bitmarkCanDownload} onPress={this.downloadAsset}>
              <Text style={[assetDetailStyle.downloadAssetButtonText, { color: this.state.bitmarkCanDownload ? '#0060F2' : '#A4B5CD', }]}>DOWNLOAD ASSET</Text>
            </TouchableOpacity>
            <TouchableOpacity style={assetDetailStyle.copyAssetIddButton} onPress={() => {
              Clipboard.setString(this.state.asset.id);
              this.setState({ copied: true });
              setTimeout(() => { this.setState({ copied: false }) }, 1000);
            }}>
              <Text style={assetDetailStyle.copyAssetIddButtonText}>COPY ASSET ID</Text>
              {this.state.copied && <Text style={assetDetailStyle.copiedAssetIddButtonText}>Copied to clipboard!</Text>}
            </TouchableOpacity>
          </View>}
          <ScrollView style={assetDetailStyle.content}>
            <TouchableOpacity activeOpacity={1} style={{ flex: 1 }} onPress={() => this.setState({ displayTopButton: false })}>
              <View style={assetDetailStyle.bottomImageBar}></View>

              <Text style={[assetDetailStyle.assetName, { color: this.state.asset.created_at ? 'black' : '#999999' }]} >{this.state.asset.name}</Text>
              <View style={assetDetailStyle.assetCreatorRow}>
                <Text style={[assetDetailStyle.assetCreatorBound, { color: this.state.asset.created_at ? 'black' : '#999999' }]}>
                  {this.state.asset.created_at ? ('REGISTERED ON ' + moment(this.state.asset.created_at).format('YYYY MMM DD HH:mm:ss').toUpperCase()) : 'REGISTERING...'}
                </Text>
                <Hyperlink
                  onPress={(url) => {
                    if (this.state.asset.created_at) {
                      this.props.navigation.navigate('BitmarkWebView', { title: 'REGISTRY', sourceUrl: url, isFullScreen: true, });
                    }
                  }}
                  linkStyle={{ color: this.state.asset.created_at ? '#0060F2' : '#999999' }}
                  linkText={url => {
                    if (url === `${config.registry_server_url}/account/${this.state.asset.registrant}`) {
                      if (this.state.asset.registrant === DataProcessor.getUserInformation().bitmarkAccountNumber) {
                        return 'YOU';
                      }
                      return `[${this.state.asset.registrant.substring(0, 4)}...${this.state.asset.registrant.substring(this.state.asset.registrant.length - 4, this.state.asset.registrant.length)}]`;
                    }
                    return '';
                  }}>
                  <Text style={[assetDetailStyle.assetCreatorBound, { color: this.state.asset.created_at ? 'black' : '#999999' }]}>BY {`${config.registry_server_url}/account/${this.state.asset.registrant}`}</Text>
                </Hyperlink>
              </View>

              {this.state.metadata && this.state.metadata.length > 0 && <View style={assetDetailStyle.metadataArea}>
                <FlatList
                  scrollEnabled={false}
                  extraData={this.state}
                  data={this.state.metadata || []}
                  renderItem={({ item }) => {
                    return (<View style={[assetDetailStyle.metadataItem, { marginBottom: item.key === this.state.metadata.length ? 0 : 15 }]}>
                      <Text style={[assetDetailStyle.metadataItemLabel, { color: this.state.asset.created_at ? 'black' : '#999999' }]}>{item.label.toUpperCase()}:</Text>
                      <Text style={[assetDetailStyle.metadataItemValue, { color: this.state.asset.created_at ? 'black' : '#999999' }]}>{item.value}</Text>
                    </View>);
                  }}
                />
              </View>}

              {/*Preview*/}
              {/*Text preview*/}
              {this.state.contentType && this.state.contentType === 'text' &&
                <ScrollView style={assetDetailStyle.assetPreview}>
                  <TouchableOpacity style={{ flex: 1 }}>
                    {this.state.assetTextContent &&
                      <Text>{this.state.assetTextContent}</Text>
                    }
                  </TouchableOpacity>
                </ScrollView>
              }
              {/*Image preview*/}
              {this.state.contentType && this.state.contentType === 'image' &&
                <View style={assetDetailStyle.assetPreview}>
                  <Image
                    style={{ width: 125, height: 125 }}
                    source={{ uri: `${config.preview_asset_url}/${this.state.asset.id}` }}
                  />
                </View>
              }

              <Text style={assetDetailStyle.bitmarkLabel}>YOUR PROPERTY BITMARKS ({this.state.bitmarks.length})</Text>
              <View style={assetDetailStyle.bitmarksArea}>
                <View style={assetDetailStyle.bitmarksHeader}>
                  <Text style={[assetDetailStyle.bitmarksHeaderLabel]}>BITMARK ID</Text>
                  <Text style={[assetDetailStyle.bitmarksHeaderLabel, { width: convertWidth(218) }]}>ACTION</Text>
                </View>
                <View style={assetDetailStyle.bitmarkListArea}>
                  <FlatList
                    scrollEnabled={false}
                    extraData={this.state}
                    data={this.state.bitmarks || []}
                    renderItem={({ item }) => {
                      if (item.bitmark.transferOfferId) {
                        return (<View style={[assetDetailStyle.bitmarksRow]} >
                          {!item.bitmark.isViewed && <View style={assetDetailStyle.bitmarkNotView}></View>}
                          <Text style={assetDetailStyle.bitmarksRowNo} numberOfLines={1}>{item.bitmark.id}</Text>

                          <TouchableOpacity style={assetDetailStyle.bitmarkViewButton} disabled={true}>
                            <Text style={[assetDetailStyle.bitmarkViewButtonText, { color: '#999999', }]}>{item.bitmark.isDonatedBitmark ? 'DONATING…' : 'SENDING…'}</Text>
                          </TouchableOpacity>

                          <TouchableOpacity style={assetDetailStyle.bitmarkTransferButton} onPress={() => this.cancelTransferring(item.bitmark)}>
                            <Text style={[assetDetailStyle.bitmarkTransferButtonText]}>CANCEL</Text>
                          </TouchableOpacity>
                        </View>);
                      }

                      if (item.bitmark.status === 'pending') {
                        return (<View style={[assetDetailStyle.bitmarksRow]} >
                          {!item.bitmark.isViewed && <View style={assetDetailStyle.bitmarkNotView}></View>}
                          <Text style={assetDetailStyle.bitmarksRowNo} numberOfLines={1}>{item.bitmark.id}</Text>
                          <TouchableOpacity style={assetDetailStyle.bitmarkViewButton} onPress={() => {
                            this.props.navigation.navigate('LocalPropertyDetail', { asset: this.state.asset, bitmark: item.bitmark });
                          }}>
                            <Text style={[assetDetailStyle.bitmarkViewButtonText]}>VIEW DETAILS</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={assetDetailStyle.bitmarkTransferButton} disabled={true}>
                            <Text style={[assetDetailStyle.bitmarkTransferButtonText, { color: '#999999' }]}>PENDING…</Text>
                          </TouchableOpacity>
                        </View>);
                      }

                      return (<View style={[assetDetailStyle.bitmarksRow]} >
                        {!item.bitmark.isViewed && <View style={assetDetailStyle.bitmarkNotView}></View>}
                        <Text style={assetDetailStyle.bitmarksRowNo} numberOfLines={1}>{item.bitmark.id}</Text>
                        <TouchableOpacity style={assetDetailStyle.bitmarkViewButton} onPress={() => {
                          this.props.navigation.navigate('LocalPropertyDetail', { asset: this.state.asset, bitmark: item.bitmark });
                        }}>
                          <Text style={[assetDetailStyle.bitmarkViewButtonText]}>VIEW DETAILS</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[assetDetailStyle.bitmarkTransferButton]} onPress={() => {
                          this.props.navigation.navigate('LocalPropertyTransfer', { bitmark: item.bitmark, asset: this.state.asset });
                        }}>
                          <Text style={[assetDetailStyle.bitmarkTransferButtonText]}>SEND</Text>
                        </TouchableOpacity>
                      </View>);
                    }}
                  />
                </View>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View></TouchableWithoutFeedback>)}
      />
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
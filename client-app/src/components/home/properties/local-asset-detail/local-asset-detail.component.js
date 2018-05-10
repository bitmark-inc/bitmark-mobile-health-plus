import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, Image, ScrollView, TouchableWithoutFeedback,
  Clipboard,
  FlatList,
  Share,
  Alert,
} from 'react-native';

import { FullComponent } from './../../../../commons/components';

import assetDetailStyle from './local-asset-detail.component.style';
import defaultStyle from './../../../../commons/styles';
import { AppController, DataController } from '../../../../managers';
import { EventEmiterService } from '../../../../services';

let ComponentName = 'LocalAssetDetailComponent';
export class LocalAssetDetailComponent extends React.Component {
  constructor(props) {
    super(props);
    this.cancelTransferring = this.cancelTransferring.bind(this);
    this.handerChangeLocalBitmarks = this.handerChangeLocalBitmarks.bind(this);
    this.downloadAsset = this.downloadAsset.bind(this);

    EventEmiterService.remove(EventEmiterService.events.CHANGE_USER_DATA_LOCAL_BITMARKS, null, ComponentName);

    let asset;
    asset = this.props.navigation.state.params.asset;
    let bitmarks = [];
    let bitmarkViewed = {};
    let bitmarkCanDownload;
    asset.bitmarks.forEach((bitmark, index) => {
      if (!bitmarkCanDownload && bitmark.displayStatus === 'confirmed') {
        bitmarkCanDownload = bitmark;
      }
      bitmarks.push({ key: index, bitmark });
      bitmarkViewed[bitmark.id] = bitmark.isViewed;
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
      bitmarkViewed,
      bitmarkCanDownload,
    };
  }

  componentDidMount() {
    EventEmiterService.on(EventEmiterService.events.CHANGE_USER_DATA_LOCAL_BITMARKS, this.handerChangeLocalBitmarks, ComponentName);
    DataController.doUpdateViewStatus(this.state.asset);
  }

  componentWillUnmount() {
    EventEmiterService.remove(EventEmiterService.events.CHANGE_USER_DATA_LOCAL_BITMARKS, this.handerChangeLocalBitmarks, ComponentName);
  }

  handerChangeLocalBitmarks() {
    let data = DataController.getLocalBitmarkInformation(null, this.state.asset.id);
    if (data.asset) {
      let bitmarks = [];
      let bitmarkCanDownload;
      data.asset.bitmarks.forEach((bitmark, index) => {
        if (!bitmarkCanDownload && bitmark.displayStatus === 'confirmed') {
          bitmarkCanDownload = bitmark;
        }
        bitmarks.push({ key: index, bitmark });
      });
      this.setState({ asset: data.asset, bitmarks, bitmarkCanDownload });
    } else {
      this.props.navigation.goBack();
    }
  }

  cancelTransferring(transferOfferId) {
    Alert.alert('Are you sure you want to cancel this property transfer?', '', [{
      text: 'No', style: 'cancel',
    }, {
      text: 'Yes',
      onPress: () => {
        AppController.doCancelTransferBitmark(transferOfferId).then((result) => {
          console.log('cancel result :', result);
          if (result) {
            EventEmiterService.emit(EventEmiterService.events.NEED_RELOAD_USER_DATA);
          }
        }).catch(error => {
          console.log('cancel transferring bitmark error :', error);
          EventEmiterService.emit(EventEmiterService.events.APP_PROCESS_ERROR, {
            onClose: async () => {
              AppController.doReloadUserData().catch(error => {
                console.log('AppController.doReloadUserData error', error);
              });
            }
          });
        });
      }
    }]);
  }

  downloadAsset() {
    AppController.doDownloadBitmark(this.state.bitmarkCanDownload, {
      indicator: true, title: 'Preparing to export...', message: `Downloading “${this.state.asset.name}”...`
    }).then(filePath => {
      if (filePath !== null) {
        Share.share({ title: this.state.asset.name, message: '', url: filePath });
      }
    }).catch(error => {
      EventEmiterService.emit(EventEmiterService.events.APP_PROCESS_ERROR, { title: "Your bitmark isn't ready to download.\nPlease try again later." });
      console.log('doDownload asset error :', error);
    });
  }

  render() {
    return (
      <FullComponent
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

              <Text style={[assetDetailStyle.assetName, { color: this.state.asset.totalPending > 0 ? '#999999' : 'black' }]} >{this.state.asset.name}</Text>
              <View style={assetDetailStyle.assetCreatorRow}>
                <Text style={[assetDetailStyle.assetCreatorBound, { color: this.state.asset.totalPending > 0 ? '#999999' : 'black' }]}>ISSUED BY </Text>
                <Text style={[assetDetailStyle.assetCreateAt, { color: this.state.asset.totalPending > 0 ? '#999999' : 'black' }]} numberOfLines={1}>
                  {'[' + this.state.asset.registrant.substring(0, 4) + '...' + this.state.asset.registrant.substring(this.state.asset.registrant.length - 4, this.state.asset.registrant.length) + ']'}
                </Text>
              </View>

              {this.state.metadata && this.state.metadata.length > 0 && <View style={assetDetailStyle.metadataArea}>
                <FlatList
                  scrollEnabled={false}
                  extraData={this.state}
                  data={this.state.metadata || []}
                  renderItem={({ item }) => {
                    return (<View style={[assetDetailStyle.metadataItem, { marginBottom: item.key === this.state.length ? 0 : 15 }]}>
                      <Text style={[assetDetailStyle.metadataItemLabel, { color: this.state.asset.totalPending > 0 ? '#999999' : '#0060F2' }]}>{item.label}:</Text>
                      <Text style={[assetDetailStyle.metadataItemValue, { color: this.state.asset.totalPending > 0 ? '#999999' : 'black' }]}>{item.value}</Text>
                    </View>);
                  }}
                />
              </View>}
              <Text style={assetDetailStyle.bitmarkLabel}>BITMARKS ({this.state.bitmarks.length})</Text>
              <View style={assetDetailStyle.bitmarksArea}>
                <View style={assetDetailStyle.bitmarksHeader}>
                  <Text style={assetDetailStyle.bitmarksHeaderLabel}>NO.</Text>
                  <Text style={assetDetailStyle.bitmarksHeaderLabel}>ACTION</Text>
                </View>
                <View style={assetDetailStyle.bitmarkListArea}>
                  <FlatList
                    scrollEnabled={false}
                    extraData={this.state}
                    data={this.state.bitmarks || []}
                    renderItem={({ item }) => {
                      if (item.bitmark.displayStatus === 'pending') {
                        return (<View style={[assetDetailStyle.bitmarksRow]} >
                          {!this.state.bitmarkViewed[item.bitmark.id] && <View style={assetDetailStyle.bitmarkNotView}></View>}
                          <Text style={assetDetailStyle.bitmarksRowNoPending}>{(item.key + 1)}/{this.state.bitmarks.length}</Text>
                          <TouchableOpacity style={assetDetailStyle.bitmarkViewButton} onPress={() => {
                            this.props.navigation.navigate('LocalPropertyDetail', { asset: this.state.asset, bitmark: item.bitmark });
                          }}>
                            <Text style={[assetDetailStyle.bitmarkViewButtonText]}>VIEW DETAILS</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={assetDetailStyle.bitmarkTransferButton} disabled={true}>
                            <Text style={[assetDetailStyle.bitmarkTransferButtonText, { color: '#999999', }]}>PENDING…</Text>
                          </TouchableOpacity>
                        </View>);
                      }
                      // if (item.bitmark.displayStatus === 'donating') {
                      //   return (<View style={[assetDetailStyle.bitmarksRow]} >
                      //     {!this.state.bitmarkViewed[item.bitmark.id] && <View style={assetDetailStyle.bitmarkNotView}></View>}
                      //     <Text style={assetDetailStyle.bitmarksRowNoPending}>{(item.key + 1)}/{this.state.bitmarks.length}</Text>
                      //     <TouchableOpacity style={assetDetailStyle.bitmarkViewButton} disabled={true}>
                      //       <Text style={[assetDetailStyle.bitmarkViewButtonText, { color: '#999999', }]}>DONATING…</Text>
                      //     </TouchableOpacity>
                      //   </View>);
                      // }
                      // if (item.bitmark.displayStatus === 'transferring') {
                      //   return (<View style={[assetDetailStyle.bitmarksRow]} >
                      //     {!this.state.bitmarkViewed[item.bitmark.id] && <View style={assetDetailStyle.bitmarkNotViewcle}></View>}
                      //     <Text style={assetDetailStyle.bitmarksRowNo}>{(item.key + 1)}/{this.state.bitmarks.length}</Text>

                      //     <TouchableOpacity style={assetDetailStyle.bitmarkViewButton} disabled={true}>
                      //       <Text style={[assetDetailStyle.bitmarkViewButtonText, { color: '#999999', }]}>TRANSFERRING…</Text>
                      //     </TouchableOpacity>

                      //     <TouchableOpacity style={assetDetailStyle.bitmarkTransferButton} onPress={() => this.cancelTransferring(item.bitmark.transferOfferId)}>
                      //       <Text style={[assetDetailStyle.bitmarkTransferButtonText]}>CANCEL</Text>
                      //     </TouchableOpacity>
                      //   </View>);
                      // }
                      return (<View style={[assetDetailStyle.bitmarksRow]} >
                        {!this.state.bitmarkViewed[item.bitmark.id] && <View style={{
                          backgroundColor: '#0060F2',
                          width: 10, height: 10,
                          position: 'absolute', left: 9, top: 12,
                          borderWidth: 1, borderRadius: 5, borderColor: '#0060F2'
                        }}></View>}
                        <Text style={assetDetailStyle.bitmarksRowNo}>{(item.key + 1)}/{this.state.bitmarks.length}</Text>
                        <TouchableOpacity style={assetDetailStyle.bitmarkViewButton} onPress={() => {
                          this.props.navigation.navigate('LocalPropertyDetail', { asset: this.state.asset, bitmark: item.bitmark });
                        }}>
                          <Text style={[assetDetailStyle.bitmarkViewButtonText]}>VIEW DETAILS</Text>
                        </TouchableOpacity>
                        {/* <TouchableOpacity style={[assetDetailStyle.bitmarkTransferButton]} onPress={() => {
                          this.props.navigation.navigate('LocalPropertyTransfer', { bitmark: item.bitmark, asset: this.state.asset });
                        }}>
                          <Text style={[assetDetailStyle.bitmarkTransferButtonText]}>TRANSFER</Text>
                        </TouchableOpacity> */}
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
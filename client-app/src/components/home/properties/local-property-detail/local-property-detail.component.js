import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
  View, Text, TouchableOpacity, Image, FlatList, ScrollView,
  Clipboard,
  TouchableWithoutFeedback,
  Share,
} from 'react-native';

import { FullComponent } from './../../../../commons/components';
import { convertWidth } from './../../../../utils';

import propertyDetailStyle from './local-property-detail.component.style';
import defaultStyle from './../../../../commons/styles';
import { AppController } from '../../../../managers/app-controller';
import { EventEmiterService } from '../../../../services';
import { config } from '../../../../configs';

export class LocalPropertyDetailComponent extends React.Component {
  constructor(props) {
    super(props);
    this.downloadAsset = this.downloadAsset.bind(this);
    this.clickOnProvenance = this.clickOnProvenance.bind(this);
    let asset = this.props.navigation.state.params.asset;
    let bitmark = this.props.navigation.state.params.bitmark;
    this.state = {
      asset,
      bitmark,
      copied: false,
      displayTopButton: false,
    };
    AppController.doGetProvenance(bitmark).then(provenance => {
      bitmark.provenance = provenance;
      bitmark.provenance.forEach((history, index) => {
        history.key = index;
      });
      this.setState({ bitmark });
    }).catch(error => console.log('getProvenance error', error));
  }

  downloadAsset() {
    AppController.doDownloadBitmark(this.state.bitmark, {
      indicator: true, title: 'Preparing to export...', message: `Downloading “${this.state.asset.name}”...`
    }).then(filePath => {
      Share.share({ title: this.state.asset.name, message: '', url: filePath });
    }).catch(error => {
      EventEmiterService.emit(EventEmiterService.events.APP_PROCESS_ERROR);
      console.log('doDownload asset error :', error);
    });
  }

  clickOnProvenance(item) {
    let sourceUrl = config.registry_server_url + `/account/${item.owner}`;
    this.props.navigation.navigate('BitmarkWebView', { title: 'Registry', sourceUrl, isFullScreen: true });
  }

  render() {
    return (
      <TouchableWithoutFeedback style={propertyDetailStyle.body} onPress={() => this.setState({ displayTopButton: false })}>
        <FullComponent
          header={(<View style={defaultStyle.header}>
            <TouchableOpacity style={defaultStyle.headerLeft} onPress={() => this.props.navigation.goBack()}>
              <Image style={defaultStyle.headerLeftIcon} source={require('../../../../../assets/imgs/header_blue_icon.png')} />
            </TouchableOpacity>
            <View style={defaultStyle.headerCenter}>
              <Text style={[defaultStyle.headerTitle, { maxWidth: convertWidth(180), }]} numberOfLines={1}>{this.state.asset.name} </Text>
              <Text style={[defaultStyle.headerTitle]}>({this.state.asset.bitmarks.indexOf(this.state.bitmark) + 1}/{this.state.asset.bitmarks.length})</Text>
            </View>
            <TouchableOpacity style={[defaultStyle.headerRight, { padding: 4 }]} onPress={() => this.setState({ displayTopButton: !this.state.displayTopButton })}>
              <Image style={propertyDetailStyle.threeDotIcon} source={this.state.displayTopButton
                ? require('../../../../../assets/imgs/three-dot-active.png')
                : require('../../../../../assets/imgs/three-dot-deactive.png')} />
            </TouchableOpacity>
          </View>)}
          content={(<View style={propertyDetailStyle.body}>
            {this.state.displayTopButton && <View style={propertyDetailStyle.topButtonsArea}>
              <TouchableOpacity style={propertyDetailStyle.downloadAssetButton} disabled={this.state.bitmark.status !== 'confirmed'} onPress={this.downloadAsset}>
                <Text style={[propertyDetailStyle.downloadAssetButtonText, { color: this.state.bitmark.status === 'confirmed' ? '#0060F2' : '#A4B5CD', }]}>DOWNLOAD ASSET</Text>
              </TouchableOpacity>
              <TouchableOpacity style={propertyDetailStyle.topButton} onPress={() => {
                Clipboard.setString(this.state.bitmark.bitmark_id);
                this.setState({ copied: true });
                setTimeout(() => { this.setState({ copied: false }) }, 1000);
              }}>
                <Text style={propertyDetailStyle.topButtonText}>COPY BITMARK ID</Text>
                {this.state.copied && <Text style={propertyDetailStyle.copiedAssetIddButtonText}>Copied to clipboard!</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={propertyDetailStyle.topButton}
                disabled={this.state.bitmark.status !== 'confirmed'}
                onPress={() => this.props.navigation.navigate('LocalPropertyTransfer', { bitmark: this.state.bitmark, asset: this.state.asset })}>
                <Text style={[propertyDetailStyle.topButtonText, {
                  color: this.state.bitmark.status === 'confirmed' ? '#0060F2' : '#C2C2C2'
                }]}>TRANSFER</Text>
              </TouchableOpacity>
            </View>}
            <ScrollView style={propertyDetailStyle.content}>
              <TouchableOpacity activeOpacity={1} style={{ flex: 1 }}>
                <View style={propertyDetailStyle.bottomImageBar}></View>
                <Text style={[propertyDetailStyle.assetName, { color: this.state.bitmark.status === 'pending' ? '#999999' : 'black' }]}>{this.state.asset.name}</Text>
                <Text style={[propertyDetailStyle.assetCreateAt, { color: this.state.bitmark.status === 'pending' ? '#999999' : 'black' }]}>
                  ISSUED {this.state.bitmark.status === 'pending' ? '' : ('ON ' + moment(this.state.bitmark.created_at).format('YYYY MMM DD HH:mm:ss').toUpperCase())}{'\n'}iBY {'[' + this.state.asset.registrant.substring(0, 4) + '...' + this.state.asset.registrant.substring(this.state.asset.registrant.length - 4, this.state.asset.registrant.length) + ']'}
                </Text>
                <Text style={[propertyDetailStyle.provenanceLabel, { color: this.state.bitmark.status === 'pending' ? '#999999' : 'black' }]}>PROVENANCE</Text>
                <View style={propertyDetailStyle.provenancesArea}>
                  <View style={propertyDetailStyle.provenancesHeader}>
                    <Text style={propertyDetailStyle.provenancesHeaderLabelTimestamp}>TIMESTAMP</Text>
                    <Text style={propertyDetailStyle.provenancesHeaderLabelOwner}>OWNER</Text>
                  </View>
                  <View style={propertyDetailStyle.provenanceListArea}>
                    <FlatList
                      scrollEnabled={false}
                      extraData={this.state}
                      data={this.state.bitmark.provenance || []}
                      renderItem={({ item }) => {
                        return (<TouchableOpacity style={propertyDetailStyle.provenancesRow} onPress={() => this.clickOnProvenance(item)}>
                          <Text style={[propertyDetailStyle.provenancesRowTimestamp, { color: this.state.bitmark.status === 'pending' ? '#999999' : '#0060F2' }]} numberOfLines={1}>{item.created_at.toUpperCase()}</Text>
                          <View style={propertyDetailStyle.provenancesRowOwnerRow}>
                            <Text style={[propertyDetailStyle.provenancesRowOwner, { color: this.state.bitmark.status === 'pending' ? '#999999' : '#0060F2' }]} numberOfLines={1}>{'[' + item.owner.substring(0, 4) + '...' + item.owner.substring(item.owner.length - 4, item.owner.length) + ']'}</Text>
                          </View>
                        </TouchableOpacity>);
                      }}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </View>)}
        />
      </TouchableWithoutFeedback>
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
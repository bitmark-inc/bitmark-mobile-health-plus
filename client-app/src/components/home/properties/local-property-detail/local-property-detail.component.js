import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, Image, FlatList, ScrollView,
  Platform,
  Clipboard,
  TouchableWithoutFeedback,
} from 'react-native';

import { convertWidth } from './../../../../utils';

import { config } from './../../../../configs';
import propertyDetailStyle from './local-property-detail.component.style';
import { androidDefaultStyle, iosDefaultStyle } from './../../../../commons/styles';
import { AppController } from '../../../../managers/app-controller';

let defaultStyle = Platform.select({
  ios: iosDefaultStyle,
  android: androidDefaultStyle
});

export class LocalPropertyDetailComponent extends React.Component {
  constructor(props) {
    super(props);
    let asset = this.props.navigation.state.params.asset;
    let bitmark = this.props.navigation.state.params.bitmark;
    console.log('bitmark: ', bitmark);
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

  render() {
    return (
      <TouchableWithoutFeedback style={propertyDetailStyle.body} onPress={() => this.setState({ displayTopButton: false })}>
        <View style={propertyDetailStyle.body}>
          <View style={defaultStyle.header}>
            <TouchableOpacity style={defaultStyle.headerLeft} onPress={() => this.props.navigation.goBack()}>
              <Image style={defaultStyle.headerLeftIcon} source={require('../../../../../assets/imgs/header_back_icon_study_setting.png')} />
            </TouchableOpacity>
            <View style={defaultStyle.headerCenter}>
              <Text style={[defaultStyle.headerTitle, { maxWidth: convertWidth(180), }]} numberOfLines={1}>{this.state.asset.name}</Text>
              <Text style={[defaultStyle.headerTitle]}>({this.state.asset.bitmarks.indexOf(this.state.bitmark) + 1}/{this.state.asset.bitmarks.length})</Text>
            </View>
            <TouchableOpacity style={[defaultStyle.headerRight, { padding: 4 }]} onPress={() => this.setState({ displayTopButton: !this.state.displayTopButton })}>
              <Image style={propertyDetailStyle.threeDotIcon} source={this.state.displayTopButton
                ? require('../../../../../assets/imgs/three-dot-active.png')
                : require('../../../../../assets/imgs/three-dot-deactive.png')} />
            </TouchableOpacity>
          </View>
          {this.state.displayTopButton && <View style={propertyDetailStyle.topButtonsArea}>
            <TouchableOpacity style={propertyDetailStyle.downloadAssetButton} disabled={true}>
              <Text style={propertyDetailStyle.downloadAssetButtonText}>DOWNLOAD ASSET</Text>
            </TouchableOpacity>
            <TouchableOpacity style={propertyDetailStyle.topButton} onPress={() => {
              Clipboard.setString(this.state.bitmark.bitmark_id);
              this.setState({ copied: true });
              setTimeout(() => { this.setState({ copied: false }) }, 1000);
            }}>
              <Text style={propertyDetailStyle.topButtonText}>BITMARK ID</Text>
              {this.state.copied && <Text style={propertyDetailStyle.copiedAssetIddButtonText}>Copied to clipboard!</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={propertyDetailStyle.topButton}
              disabled={this.state.bitmark.status === 'pending'}
              onPress={() => this.props.navigation.navigate('LocalPropertyTransfer', { bitmark: this.state.bitmark, asset: this.state.asset })}>
              <Text style={[propertyDetailStyle.topButtonText, {
                color: this.state.bitmark.status === 'pending' ? '#C2C2C2' : '#0060F2'
              }]}>TRANSFER</Text>
            </TouchableOpacity>
          </View>}
          <ScrollView style={propertyDetailStyle.content}>
            <TouchableOpacity activeOpacity={1} style={{ flex: 1 }}>
              <View style={propertyDetailStyle.bottomImageBar}></View>
              <Text style={propertyDetailStyle.assetName} numberOfLines={1}>{this.state.asset.name}</Text>
              <Text style={propertyDetailStyle.assetCreateAt} numberOfLines={1}>
                ISSUED {this.state.bitmark.status === 'pending' ? '' : ('ON ' + this.state.bitmark.created_at.toUpperCase())} BY {this.state.asset.registrant}
              </Text>
              <Text style={propertyDetailStyle.provenanceLabel}>PROVENANCE</Text>
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
                      return (<View style={propertyDetailStyle.provenancesRow}>
                        <Text style={propertyDetailStyle.provenancesRowTimestamp} numberOfLines={1}>{item.created_at.toUpperCase()}</Text>
                        <Text style={propertyDetailStyle.provenancesRowOwner} numberOfLines={1}>{item.owner}</Text>
                      </View>);
                    }}
                  />
                </View>
              </View>
              {!config.disabel_markets && <View style={propertyDetailStyle.listingButtonArea} >
                <TouchableOpacity style={[propertyDetailStyle.listingButton, { backgroundColor: this.state.bitmark.status === 'pending' ? '#CCCCCC' : '#0060F2' }]}
                  disabled={this.state.bitmark.status === 'pending'}
                  onPress={() => {
                    this.props.navigation.navigate('MarketBitmarkDeposit', {
                      asset: this.state.asset,
                      bitmark: this.state.bitmark
                    });
                  }}>
                  <Text style={propertyDetailStyle.listingButtonText}>{'LIST THIS BITMARK TO MARKET'.toUpperCase()}</Text>
                </TouchableOpacity>
              </View>}
            </TouchableOpacity>
          </ScrollView>
        </View>
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
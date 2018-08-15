import React from 'react';
import PropTypes from 'prop-types';
import {
  View, TouchableOpacity, Image, Text,
  //  FlatList,
} from 'react-native';

import { BitmarkComponent } from './../../../../commons/components';

import propertyDetailStyle from './bitmark-detail.component.style';
import defaultStyle from './../../../../commons/styles';
import { AppProcessor } from '../../../../processors';
import moment from 'moment';
import { config } from '../../../../configs';

// let ComponentName = 'BitmarkDetailComponent';
export class BitmarkDetailComponent extends React.Component {
  constructor(props) {
    super(props);

    let bitmarkId = this.props.navigation.state.params.bitmarkId;
    let taskType = this.props.navigation.state.params.taskType;
    this.doGetScreenData(bitmarkId);
    this.state = {
      loading: true,
      bitmarkId,
      taskType,
    }
  }
  doGetScreenData(bitmarkId) {
    AppProcessor.doGetBitmarkInformation(bitmarkId).then(({ asset, bitmark }) => {
      // let metadata = [];
      // for (let label in asset.created) {
      //   metadata.push({ label, value: asset.created[label] });
      // }
      this.setState({
        loading: false,
        // metadata,
        asset, bitmark,
      });
    }).catch(error => {
      console.log('doGetBitmarkInformation error :', error);
      this.props.navigation.goBack();
    });
  }


  render() {
    return (
      <BitmarkComponent
        header={(<View style={defaultStyle.header}>
          <TouchableOpacity style={defaultStyle.headerLeft} onPress={() => this.props.navigation.goBack()}>
            <Image style={defaultStyle.headerLeftIcon} source={require('./../../../../../assets/imgs/header_blue_icon.png')} />
          </TouchableOpacity>
          <View style={defaultStyle.headerCenter}>
            <Text style={defaultStyle.headerTitle}>
              {this.state.taskType === 'bitmark_health_issuance' ? 'CAPTURED ASSET' : 'HEALTH DATA'}
            </Text>
          </View>
          <TouchableOpacity style={defaultStyle.headerRight} />
        </View>)}
        content={(<View style={propertyDetailStyle.body}>
          {!this.state.loading && <View style={propertyDetailStyle.bodyContent}>
            <View style={propertyDetailStyle.imageArea}>
              <Image style={propertyDetailStyle.assetIcon} source={require('./../../../../../assets/imgs/asset-icon.png')} />
              {this.state.bitmark.status === 'pending' && <Text style={propertyDetailStyle.bitmarkPending}>Registering ownership...</Text>}
              {this.state.bitmark.status === 'confirmed' && this.state.taskType === 'bitmark_health_issuance' &&
                <TouchableOpacity style={propertyDetailStyle.bitmarkConfirmed} onPress={() => {
                  this.props.navigation.navigate('AssetImageContent', { bitmarkId: this.state.bitmarkId });
                }}>
                  <Text style={propertyDetailStyle.bitmarkConfirmedText}>Click to review your health data</Text>
                </TouchableOpacity>
              }
            </View>
            <View style={propertyDetailStyle.informationArea}>
              {this.state.bitmark.status === 'confirmed' && <View style={propertyDetailStyle.informationRow}>
                <View style={propertyDetailStyle.informationRowContent}>
                  <Text style={propertyDetailStyle.informationRowLabel}>{'BITMARK INFO'.toUpperCase()}</Text>
                  <Text style={propertyDetailStyle.informationRowValue}>ISSUED ON {moment(this.state.bitmark.created_at).format('YYYY MMM DD')}</Text>
                </View>
                <View style={propertyDetailStyle.informationRowBarArea}>
                  <View style={propertyDetailStyle.informationRowBarLine} />
                </View>
              </View>}

              <View style={propertyDetailStyle.informationRow}>
                <View style={propertyDetailStyle.informationRowContent}>
                  <Text style={propertyDetailStyle.informationRowLabel}>SOURCE</Text>
                  <Text style={propertyDetailStyle.informationRowValue}>
                    {this.state.taskType === 'bitmark_health_data' ? 'HealthKit' : 'BITMARK HEALTH'}
                  </Text>
                </View>
                <View style={propertyDetailStyle.informationRowBarArea}>
                  <View style={propertyDetailStyle.informationRowBarLine} />
                </View>
              </View>

              {this.state.taskType === 'bitmark_health_data' &&
                this.state.asset.metadata['Created'] &&
                <View style={propertyDetailStyle.informationRow}>
                  <View style={propertyDetailStyle.informationRowContent}>
                    <Text style={propertyDetailStyle.informationRowLabel}>SAVED TIME</Text>
                    <Text style={propertyDetailStyle.informationRowValue}>
                      {this.state.asset.metadata['Created']}
                    </Text>
                  </View>
                </View>}

              {this.state.taskType === 'bitmark_health_issuance' &&
                this.state.asset.metadata['save_time'] &&
                <View style={propertyDetailStyle.informationRow}>
                  <View style={propertyDetailStyle.informationRowContent}>
                    <Text style={propertyDetailStyle.informationRowLabel}>SAVED TIME</Text>
                    <Text style={propertyDetailStyle.informationRowValue}>
                      {moment(this.state.asset.metadata['save_time']).format('YYYY MMM DD HH:mm:ss')}
                    </Text>
                  </View>
                </View>}


              {/* <FlatList
                keyExtractor={(item, index) => index}
                extraData={this.state}
                data={this.state.metadata}
                renderItem={({ item, index }) => {
                  return (<View style={propertyDetailStyle.informationRow}>
                    <View style={propertyDetailStyle.informationRowContent}>
                      <Text style={propertyDetailStyle.informationRowLabel}>{item.label.toUpperCase()}</Text>
                      <Text style={propertyDetailStyle.informationRowValue} >{item.value}</Text>
                    </View>
                    <View style={propertyDetailStyle.informationRowBarArea}>
                      {index < (this.state.metadata.length - 1) && <View style={propertyDetailStyle.informationRowBarLine} />}
                    </View>
                  </View>)
                }}
              /> */}
            </View>

            <TouchableOpacity style={propertyDetailStyle.viewRegistryButton} onPress={() => {
              let sourceUrl = config.registry_server_url + `/bitmark/${this.state.bitmark.id}?env=app`;
              this.props.navigation.navigate('BitmarkWebView', { title: 'REGISTRY', sourceUrl, isFullScreen: true });
            }}>
              <Text style={propertyDetailStyle.viewRegistryButtonText}>View registration on Bitmark blockchain</Text>
            </TouchableOpacity>

          </View>}
        </View>)}
      />
    );
  }
}

BitmarkDetailComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.shape({
        bitmarkId: PropTypes.string,
        taskType: PropTypes.string,
      }),
    }),
  }),
}
import React from 'react';
import PropTypes from 'prop-types';
import {
  View, TouchableOpacity, Image, Text, Share
} from 'react-native';

import { BitmarkComponent } from './../../../../commons/components';

import propertyDetailStyle from './bitmark-detail.component.style';
import defaultStyle from './../../../../commons/styles';
import { AppProcessor, DataProcessor } from '../../../../processors';
import moment from 'moment';
import { config } from '../../../../configs';
import { CommonModel, UserModel } from '../../../../models';
import { EventEmitterService } from "../../../../services";

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
  async doGetScreenData(bitmarkId) {
    let userInformation = await UserModel.doGetCurrentUser();

    AppProcessor.doGetBitmarkInformation(bitmarkId).then(({ asset, bitmark }) => {
      this.setState({
        shortAccountNumber: this.populateShortAccountNumber(bitmark.owner),
        ownerAreYou: bitmark.owner === userInformation.bitmarkAccountNumber,
        loading: false,
        asset,
        bitmark,
      });
    }).catch(error => {
      console.log('doGetBitmarkInformation error :', error);
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
    });
  }

  downloadAsset(bitmarkId) {
    AppProcessor.doDownloadBitmark(bitmarkId).then(filePath => {
      Share.share({ title: this.state.asset.name, url: filePath })
        .then((data) => console.log('data:', data))
        .catch((error) => {console.log('error:', error)});
    }).catch(error => {
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { title: "Your bitmark isn't ready to download.\nPlease try again later." });
      console.log('doDownload asset error :', error);
    });
  }

  populateShortAccountNumber(accountNumber) {
    return `${accountNumber.substring(0, 4)}...${accountNumber.substring(accountNumber.length - 4)}`;
  }

  render() {
    return (
      <BitmarkComponent
        backgroundColor='#EDF0F4'
        header={(<View style={[defaultStyle.header, { backgroundColor: '#EDF0F4' }]}>
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
        contentInScroll={true}
        content={(
          <View style={propertyDetailStyle.body}>
          {!this.state.loading &&
            <View style={propertyDetailStyle.bodyContent}>
              <View style={propertyDetailStyle.contentContainer}>
                {/*PUBLIC INFORMATION*/}
                <View style={propertyDetailStyle.titleArea}>
                  <Text style={propertyDetailStyle.titleText}>PUBLIC INFORMATION</Text>
                  <View style={propertyDetailStyle.subTitleArea}>
                    <Image style={propertyDetailStyle.eyeIcon} source={require('./../../../../../assets/imgs/icon-eye.png')} />
                    <Text style={propertyDetailStyle.subTitleText}>Visible to everyone</Text>
                  </View>
                </View>

                {/*INFO*/}
                <View style={propertyDetailStyle.informationArea}>
                  {/*ISSUED BY*/}
                  <View style={propertyDetailStyle.informationRow}>
                    <View style={propertyDetailStyle.informationRowContent}>
                      <Text style={propertyDetailStyle.informationRowLabel}>ISSUED BY</Text>
                      <Text style={propertyDetailStyle.informationRowValue}>{this.state.ownerAreYou ? `You - [${this.state.shortAccountNumber}]` : `[${this.state.shortAccountNumber}]`}</Text>
                    </View>
                    <View style={propertyDetailStyle.informationRowBarArea}>
                      <View style={propertyDetailStyle.informationRowBarLine} />
                    </View>
                  </View>

                  {/*ISSUED ON*/}
                  <View style={propertyDetailStyle.informationRow}>
                    <View style={propertyDetailStyle.informationRowContent}>
                      <Text style={propertyDetailStyle.informationRowLabel}>ISSUED ON</Text>
                      {this.state.bitmark.status === 'confirmed'
                        ? <Text style={propertyDetailStyle.informationRowValue}>{moment(this.state.bitmark.created_at).format('YYYY MMM DD HH:mm:ss').toUpperCase()}</Text>
                        : <Text style={propertyDetailStyle.informationRowValue}>REGISTERING...</Text>
                      }
                    </View>
                    <View style={propertyDetailStyle.informationRowBarArea}>
                      <View style={propertyDetailStyle.informationRowBarLine} />
                    </View>
                  </View>

                  {/*METADATA*/}
                  <View style={propertyDetailStyle.informationRow}>
                    <View style={propertyDetailStyle.informationRowContent}>
                      <Text style={propertyDetailStyle.informationRowLabel}>METADATA</Text>
                      <Text style={propertyDetailStyle.informationRowValue}>SOURCE: {this.state.asset.metadata['Source']}</Text>
                    </View>
                    <View style={[propertyDetailStyle.informationRowContent, propertyDetailStyle.fromSecondRow]}>
                      <Text style={propertyDetailStyle.informationRowValue}>SAVED TIME: {moment(this.state.asset.metadata['Saved Time']).format('YYYY MMM DD HH:mm:ss').toUpperCase()}</Text>
                    </View>
                    <View style={propertyDetailStyle.informationRowBarArea}>
                      <View style={propertyDetailStyle.informationRowBarLine} />
                    </View>
                  </View>

                  {/*BITMARKS*/}
                  <View style={propertyDetailStyle.informationRow}>
                    <View style={propertyDetailStyle.informationRowContent}>
                      <Text style={propertyDetailStyle.informationRowLabel}>BITMARKS</Text>
                      <Text style={propertyDetailStyle.informationRowValue}>1</Text>
                    </View>
                  </View>
                </View>

                {/*VIEW ON BLOCKCHAIN*/}
                <TouchableOpacity style={propertyDetailStyle.viewRegistryButton} onPress={() => {
                  CommonModel.doTrackEvent({
                    event_name: 'health_user_view_health_data_record_on_blockchain',
                    account_number: DataProcessor.getUserInformation() ? DataProcessor.getUserInformation().bitmarkAccountNumber : null,
                  });
                  let sourceUrl = config.registry_server_url + `/bitmark/${this.state.bitmark.id}?env=app`;
                  this.props.navigation.navigate('BitmarkWebView', { title: 'REGISTRY', sourceUrl, isFullScreen: true });
                }}>
                  <Text style={propertyDetailStyle.viewRegistryButtonText}>View on Bitmark blockchain</Text>
                </TouchableOpacity>
              </View>

              <View style={propertyDetailStyle.separator}></View>

              <View style={propertyDetailStyle.contentContainer}>
                {/*MY PRIVATE HEALTH DATA*/}
                <View style={[propertyDetailStyle.titleArea, propertyDetailStyle.privateInfoArea]}>
                  <Text style={propertyDetailStyle.titleText}>PRIVATE HEALTH DATA</Text>
                  <View style={propertyDetailStyle.subTitleArea}>
                    <Image style={propertyDetailStyle.eyeIcon} source={require('./../../../../../assets/imgs/icon-eye.png')} />
                    <Text style={propertyDetailStyle.subTitleText}>Can be accessed by:</Text>
                    <Text style={propertyDetailStyle.textAlignRight}>{this.state.ownerAreYou ? `You - [${this.state.shortAccountNumber}]` : `[${this.state.shortAccountNumber}]`}</Text>
                  </View>
                </View>

                <View style={propertyDetailStyle.informationRowBarLine} />

                {/*PREVIEW*/}
              {this.state.bitmark.status === 'confirmed' &&
                <TouchableOpacity style={propertyDetailStyle.imageArea} onPress={() => {
                  if (this.state.taskType === 'bitmark_health_issuance') {
                    this.props.navigation.navigate('AssetImageContent', {bitmarkId: this.state.bitmarkId, assetName: this.state.asset.name});
                  } else {
                    this.downloadAsset(this.state.bitmarkId);
                  }
                }}>
                  <Image style={propertyDetailStyle.assetIcon} source={require('./../../../../../assets/imgs/asset-icon.png')}/>
                  <Text style={propertyDetailStyle.bitmarkConfirmedText}>View full private health data</Text>
                </TouchableOpacity>
              }
              {this.state.bitmark.status === 'pending' &&
                <View style={propertyDetailStyle.imageArea}>
                  <Image style={propertyDetailStyle.assetIcon} source={require('./../../../../../assets/imgs/asset-icon.png')} opacity={0.5}/>
                  <Text style={propertyDetailStyle.bitmarkPending}>Registering ownership...</Text>
                </View>
              }
              </View>
            </View>
          }
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
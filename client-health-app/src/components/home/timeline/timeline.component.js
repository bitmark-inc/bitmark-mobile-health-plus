import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Image, Text, TouchableOpacity, FlatList, ScrollView,
  Dimensions,
} from 'react-native';

import ImagePicker from 'react-native-image-picker';
import timelineStyle from './timeline.component.style';
import { DataProcessor, AppProcessor } from '../../../processors';
import { EventEmitterService } from '../../../services';
import { FileUtil, convertWidth } from "../../../utils";
import { CommonModel } from '../../../models';

let currentSize = Dimensions.get('window');
let ComponentName = 'TimelineComponent';
export class TimelineComponent extends React.Component {
  constructor(props) {
    super(props);
    this.handerDonationInformationChange = this.handerDonationInformationChange.bind(this);
    this.handerChangeTimelines = this.handerChangeTimelines.bind(this);
    EventEmitterService.remove(EventEmitterService.events.CHANGE_USER_DATA_DONATION_INFORMATION, null, ComponentName);
    EventEmitterService.remove(EventEmitterService.events.CHANGE_TIMELINES, null, ComponentName);

    this.state = {
      timelines: [
        {
          time: '', title: 'You health data will be extracted each week...',
        },
      ],
      appLoadingData: DataProcessor.isAppLoadingData(),
      donationInformation: null,
      lengthDisplayTimelines: 0,
      totalTimelines: 0,
    };

    const doGetScreenData = async () => {
      let donationInformation = await DataProcessor.doGetDonationInformation();
      let { timelines, totalTimelines } = await DataProcessor.doGetTimelines(0);
      this.setState({
        timelines,
        lengthDisplayTimelines: timelines.length,
        donationInformation,
        totalTimelines,
      });
    };
    doGetScreenData();

  }
  // ==========================================================================================
  componentDidMount() {
    EventEmitterService.on(EventEmitterService.events.CHANGE_USER_DATA_DONATION_INFORMATION, this.handerDonationInformationChange, ComponentName);
    EventEmitterService.on(EventEmitterService.events.CHANGE_TIMELINES, this.handerChangeTimelines, ComponentName);
  }

  async handerDonationInformationChange(donationInformation) {
    this.setState({ donationInformation, });
  }
  async handerChangeTimelines() {
    let { timelines, totalTimelines } = await DataProcessor.doGetTimelines(this.state.lengthDisplayTimelines);
    this.setState({ timelines, lengthDisplayTimelines: timelines.length, totalTimelines });
  }
  // ==========================================================================================

  captureAsset() {
    CommonModel.doTrackEvent({
      event_name: 'health_user_want_register_capture_health_data',
      account_number: DataProcessor.getUserInformation() ? DataProcessor.getUserInformation().bitmarkAccountNumber : null,
    });
    let options = {
      title: 'Capture asset',
      quality: 1
    };

    ImagePicker.showImagePicker(options, (response) => {

      if (response.didCancel) {
        return;
      }

      if (response.error == 'Photo library permissions not granted') {
        this.props.screenProps.homeNavigation.navigate('CaptureAssetPermissionRequest', { type: 'photos' });
        return;
      }

      if (response.error == 'Camera permissions not granted') {
        this.props.screenProps.homeNavigation.navigate('CaptureAssetPermissionRequest', { type: 'camera' });
        return;
      }

      this.showPreviewAsset(response);
    });
  }

  async showPreviewAsset(response) {
    let filePath = response.uri.replace('file://', '');
    filePath = decodeURIComponent(filePath);

    // Move file from "tmp" folder to "cache" folder
    let fileName = response.fileName ? response.fileName : response.uri.substring(response.uri.lastIndexOf('/') + 1);
    let timestamp = response.timestamp ? response.timestamp : new Date().toISOString();
    let destPath = FileUtil.CacheDirectory + '/' + fileName;
    await FileUtil.moveFileSafe(filePath, destPath);
    filePath = destPath;

    this.props.screenProps.homeNavigation.navigate('CaptureAssetPreview', { filePath, timestamp });
  }

  render() {
    return (
      <View style={timelineStyle.body}>
        <ScrollView style={timelineStyle.contentScroll}
          onScroll={async (scrollEvent) => {
            if (this.loadingTimelinesWhenScroll) {
              return;
            }
            if (scrollEvent.nativeEvent.contentOffset.y >= (scrollEvent.nativeEvent.contentSize.height - currentSize.height) && (this.state.lengthDisplayTimelines < this.state.totalTimelines)) {
              this.loadingTimelinesWhenScroll = true;
              let lengthDisplayTimelines = Math.min(this.state.totalTimelines, this.state.lengthDisplayTimelines + 20);
              let { timelines } = await DataProcessor.doGetTimelines(lengthDisplayTimelines);
              this.setState({ lengthDisplayTimelines: timelines.length, timelines });
            }
            this.loadingTimelinesWhenScroll = false;
          }}
          scrollEventThrottle={1}>
          <TouchableOpacity activeOpacity={1} style={timelineStyle.contentSubTab}>
            <FlatList
              scrollEnabled={false}
              keyExtractor={(item, index) => index}
              extraData={this.state}
              data={this.state.timelines}
              renderItem={({ item, index }) => {
                if (item.taskType) {
                  return (<View style={timelineStyle.rowData}>
                    <View style={timelineStyle.rowDataTime}>
                      <Text style={timelineStyle.rowDataTimeText}>{item.time}</Text>
                    </View>

                    <View style={timelineStyle.rowDataLineArea}>
                      <View style={timelineStyle.rowDataLine}></View>
                      <View style={[timelineStyle.rowDataDot, {
                        backgroundColor: item.bitmarkId ? '#0060F2' : 'white',
                      }]}></View>
                    </View>


                    <TouchableOpacity
                      style={[timelineStyle.rowDataDetail, {
                        paddingBottom: ((index === this.state.timelines.length - 2) ? 91 : 52)
                      }]}
                      onPress={() => {
                        if (item.taskType === this.state.donationInformation.commonTaskIds.bitmark_health_data && !item.bitmarkId) {

                          AppProcessor.doBitmarkHealthData([{ startDate: item.startDate, endDate: item.endDate, }], {
                            indicator: true, title: 'Encrypting and protecting your health data...', message: ''
                          }).then(result => {
                            if (result) {
                              CommonModel.doTrackEvent({
                                event_name: 'health_user_issued_weekly_health_data',
                                account_number: DataProcessor.getUserInformation() ? DataProcessor.getUserInformation().bitmarkAccountNumber : null,
                              });
                            }
                          }).catch(error => {
                            console.log('doBitmarkHealthData error:', error);
                            EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
                          });
                        } else if (item.bitmarkId) {
                          if (item.taskType === 'bitmark_health_issuance') {
                            CommonModel.doTrackEvent({
                              event_name: 'health_user_view_captured_health_data_record',
                              account_number: DataProcessor.getUserInformation() ? DataProcessor.getUserInformation().bitmarkAccountNumber : null,
                            });
                          } else if (item.taskType === 'bitmark_health_data') {
                            CommonModel.doTrackEvent({
                              event_name: 'health_user_view_weekly_health_data_record',
                              account_number: DataProcessor.getUserInformation() ? DataProcessor.getUserInformation().bitmarkAccountNumber : null,
                            });
                          }
                          this.props.screenProps.homeNavigation.navigate('BitmarkDetail', { bitmarkId: item.bitmarkId, taskType: item.taskType });
                        }
                      }}
                    >
                      <View style={[timelineStyle.rowDataContent, { backgroundColor: 'white' }]}>
                        <View style={timelineStyle.rowDataMainContent}>
                          <Image style={timelineStyle.rowDataIcon}
                            source={item.taskType === this.state.donationInformation.commonTaskIds.bitmark_health_data ?
                              require('./../../../../assets/imgs/icon_health.png') :
                              (item.taskType === this.state.donationInformation.commonTaskIds.bitmark_health_issuance ? require('./../../../../assets/imgs/capture-asset-icon.png') : null)} />
                          <Text style={timelineStyle.rowDataTitle}>{item.title}</Text>
                        </View>
                        {(!item.bitmarkId && item.taskType !== this.state.donationInformation.commonTaskIds.bitmark_health_issuance) && <View style={timelineStyle.rowDataFooterContent}>
                          <Text style={timelineStyle.rowDataSignButton}>SIGN</Text>
                        </View>}

                        {(item.bitmarkId && item.status !== 'confirmed') && <View style={[timelineStyle.rowDataFooterContent, { marginTop: 0 }]}>
                          <Text style={timelineStyle.rowDataFooterStatus}>Registering ownership...</Text>
                        </View>}
                      </View>

                    </TouchableOpacity>
                  </View>);
                }

                return (<View style={timelineStyle.rowData}>
                  <View style={[timelineStyle.rowDataTime]}>
                    <Text style={timelineStyle.rowDataTimeText}>{item.time}</Text>
                  </View>

                  <View style={timelineStyle.rowDataLineArea}>
                    {(index !== (this.state.timelines.length - 1)) && <View style={[timelineStyle.rowDataLine, { borderColor: item.time ? '#0060F2' : '#999999', }]}></View>}
                    <View style={[timelineStyle.rowDataDot, {
                      borderColor: item.time ? '#0060F2' : '#999999',
                      backgroundColor: item.time ? '#0060F2' : '#999999',
                    }]}></View>
                  </View>

                  <View style={[timelineStyle.rowDataDetail, {
                    marginTop: -15,
                    paddingBottom: (index === 0 ? 40 : 26)
                  }]}>
                    <View style={[timelineStyle.rowDataContent]}>
                      <Text style={[timelineStyle.rowDataTitle, { color: '#999999', width: convertWidth(272), }]}>{item.title}</Text>
                    </View>
                  </View>
                </View>);

              }}
            />
          </TouchableOpacity>
        </ScrollView>

        <TouchableOpacity style={timelineStyle.addIconContainer} onPress={this.captureAsset.bind(this)}>
          <Image style={timelineStyle.addIcon} source={require('./../../../../assets/imgs/icon-add.png')} />
        </TouchableOpacity>
      </View>
    );
  }
}

TimelineComponent.propTypes = {
  screenProps: PropTypes.shape({
    subTab: PropTypes.string,
    homeNavigation: PropTypes.shape({
      navigate: PropTypes.func,
      goBack: PropTypes.func,
    }),
    needReloadData: PropTypes.bool,
    doneReloadData: PropTypes.func,
  }),

}
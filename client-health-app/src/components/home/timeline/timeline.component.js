import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Image, Text, TouchableOpacity, FlatList,
} from 'react-native';

import ImagePicker from 'react-native-image-picker';
import moment from 'moment';
import timelineStyle from './timeline.component.style';
import { DataProcessor } from '../../../processors';
import { EventEmitterService } from '../../../services';
import { FileUtil } from "../../../utils";


let ComponentName = 'TimelineComponent';
export class TimelineComponent extends React.Component {
  constructor(props) {
    super(props);
    this.handerDonationInformationChange = this.handerDonationInformationChange.bind(this);
    EventEmitterService.remove(EventEmitterService.events.CHANGE_USER_DATA_DONATION_INFORMATION, null, ComponentName);

    this.state = {
      data: [
        {
          time: '', title: 'You health data will be extracted each week...',
        },
      ],
      appLoadingData: DataProcessor.isAppLoadingData(),
      donationInformation: null,
    };

    const doGetScreenData = async () => {
      let donationInformation = await DataProcessor.doGetDonationInformation();
      let data = [{
        time: '', title: 'You health data will be extracted each week...', lineColor: '#999999',
        lineWidth: 2,
      },
      ];
      if (donationInformation) {
        let tempData = [];
        (donationInformation.timelines || []).forEach(item => {
          tempData.push({
            time: item.completedAt,
            taskType: item.taskType,
            title: item.taskType === donationInformation.commonTaskIds.bitmark_health_data ? 'Own your weekly health data' :
              (item.taskType === donationInformation.commonTaskIds.bitmark_health_issuance ? 'Captured asset' : ''),
            startDate: item.startDate,
            endDate: item.endDate,
            bitmarkId: item.bitmarkId,
          })
        });

        tempData = [{
          time: donationInformation.createdAt, title: 'Your Bitmark account was created.',
        }].concat(tempData.sort((a, b) => {
          return moment(a.time).toDate().getTime() - moment(b.time).toDate().getTime();
        }));

        let currentYear = 0;
        for (let item of tempData) {
          if (moment(item.time).toDate().getFullYear() > currentYear) {
            currentYear = moment(item.time).toDate().getFullYear();
            item.time = moment(donationInformation.createdAt).format('YYYY MMM DD HH:mm');
          } else {
            item.time = moment(donationInformation.createdAt).format('MMM DD HH:mm');
          }
        }

        data = data.concat(tempData.reverse());
      }
      console.log('doGetScreenData data :', data);
      this.setState({
        data,
        donationInformation,
      });
    };
    doGetScreenData();

  }
  // ==========================================================================================
  componentDidMount() {
    EventEmitterService.on(EventEmitterService.events.CHANGE_USER_DATA_DONATION_INFORMATION, this.handerDonationInformationChange, ComponentName);
  }

  handerDonationInformationChange(donationInformation) {
    let data = [{
      time: '', title: 'You health data will be extracted each week...', lineColor: '#999999',
      lineWidth: 2,
    },
    ];
    if (donationInformation) {
      let tempData = [];
      (donationInformation.timelines || []).forEach(item => {
        tempData.push({
          time: item.completedAt,
          taskType: item.taskType,
          title: item.taskType === donationInformation.commonTaskIds.bitmark_health_data ? 'Own your weekly health data' :
            (item.taskType === donationInformation.commonTaskIds.bitmark_health_issuance ? 'Captured asset' : ''),
          startDate: item.startDate,
          endDate: item.endDate,
          bitmarkId: item.bitmarkId,
        })
      });

      tempData = [{
        time: donationInformation.createdAt, title: 'Your Bitmark account was created.',
      }].concat(tempData.sort((a, b) => {
        return moment(a.time).toDate().getTime() - moment(b.time).toDate().getTime();
      }));

      let currentYear = 0;
      for (let item of tempData) {
        if (moment(item.time).toDate().getFullYear() > currentYear) {
          currentYear = moment(item.time).toDate().getFullYear();
          item.time = moment(donationInformation.createdAt).format('YYYY MMM DD HH:mm');
        } else {
          item.time = moment(donationInformation.createdAt).format('MMM DD HH:mm');
        }
      }

      data = data.concat(tempData.reverse());
    }
    console.log('doGetScreenData data :', data);
    this.setState({
      data,
      donationInformation,
    });
  }
  // ==========================================================================================

  captureAsset() {
    let options = {
      title: 'Capture asset',
      quality: 0.7
    };

    ImagePicker.showImagePicker(options, (response) => {
      console.log('Response:', response);

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
        <FlatList
          keyExtractor={(item, index) => index}
          extraData={this.state}
          data={this.state.data}
          renderItem={({ item, index }) => {
            if (item.taskType) {
              return (<View style={timelineStyle.rowData}>
                <View style={timelineStyle.rowDataTime}>
                  <Text style={timelineStyle.rowDataTimeText}>{item.time}</Text>
                </View>

                <View style={timelineStyle.rowDataLineArea}>
                  <View style={timelineStyle.rowDataLine}></View>
                  <View style={timelineStyle.rowDataDot}></View>
                </View>


                <TouchableOpacity
                  style={[timelineStyle.rowDataDetail, {
                    paddingBottom: ((index === this.state.data.length - 2) ? 91 : 52)
                  }]}
                  onPress={() => {
                    if (item.taskType === this.state.donationInformation.commonTaskIds.bitmark_health_data && !item.bitmarkId) {
                      this.props.screenProps.homeNavigation.navigate('HealthDataBitmark', {
                        startDate: item.startDate,
                        endDate: item.endDate,
                      });
                    } else if (item.bitmarkId) {
                      this.props.screenProps.homeNavigation.navigate('BitmarkDetail', { bitmarkId: item.bitmarkId });
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
                  </View>

                </TouchableOpacity>
              </View>);
            }

            return (<View style={timelineStyle.rowData}>
              <View style={[timelineStyle.rowDataTime]}>
                <Text style={timelineStyle.rowDataTimeText}>{item.time}</Text>
              </View>

              <View style={timelineStyle.rowDataLineArea}>
                {(index !== (this.state.data.length - 1)) && <View style={[timelineStyle.rowDataLine, { borderColor: item.time ? '#0060F2' : '#999999', }]}></View>}
                <View style={[timelineStyle.rowDataDot, { borderColor: item.time ? '#0060F2' : '#999999' }]}></View>
              </View>

              <View style={[timelineStyle.rowDataDetail, {
                marginTop: -15,
                paddingBottom: (index === 0 ? 40 : 26)
              }]}>
                <View style={[timelineStyle.rowDataContent]}>
                  <Text style={[timelineStyle.rowDataTitle, { color: '#999999' }]}>{item.title}</Text>
                </View>
              </View>
            </View>);

          }}
        />

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
import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, Image,
} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import { DocumentPicker, DocumentPickerUtil } from 'react-native-document-picker';
import { NavigationActions } from 'react-navigation';

import issuanceOptionsStyle from './issuance-options.component.style';
import defaultStyle from './../../../../../commons/styles';
import { AppProcessor, DataProcessor } from '../../../../../processors';
import { EventEmitterService } from '../../../../../services';
import { BottomTabsComponent } from '../../../bottom-tabs/bottom-tabs.component';
import { FileUtil } from '../../../../../utils';
import { CommonModel } from '../../../../../models';

let ComponentName = 'IssuanceOptionsComponent';
export class IssuanceOptionsComponent extends React.Component {
  constructor(props) {
    super(props);
    this.onChooseFile = this.onChooseFile.bind(this);
    this.onChoosePhotoFile = this.onChoosePhotoFile.bind(this);
    this.issueHealthData = this.issueHealthData.bind(this);
    this.issueIftttData = this.issueIftttData.bind(this);
    this.handerDonationInformationChange = this.handerDonationInformationChange.bind(this);
    this.handerIftttInformationChange = this.handerIftttInformationChange.bind(this);

    EventEmitterService.remove(EventEmitterService.events.CHANGE_USER_DATA_DONATION_INFORMATION, ComponentName);
    EventEmitterService.remove(EventEmitterService.events.CHANGE_USER_DATA_IFTTT_INFORMATION, ComponentName);

    this.state = {
      donationInformation: null,
      iftttInformation: null,
    };

    const doGetScreenData = async () => {
      let donationInformation = await DataProcessor.doGetDonationInformation();
      let iftttInformation = await DataProcessor.doGetIftttInformation();
      this.setState({
        donationInformation,
        iftttInformation,
        gettingData: false,
      });
    }
    doGetScreenData();

  }

  // ==========================================================================================
  componentDidMount() {
    EventEmitterService.on(EventEmitterService.events.CHANGE_USER_DATA_DONATION_INFORMATION, this.handerDonationInformationChange, ComponentName);
    EventEmitterService.on(EventEmitterService.events.CHANGE_USER_DATA_IFTTT_INFORMATION, this.handerIftttInformationChange, ComponentName);
  }
  // ==========================================================================================
  handerDonationInformationChange(donationInformation) {
    this.setState({ donationInformation });
  }

  handerIftttInformationChange(iftttInformation) {
    this.setState({ iftttInformation });
  }

  onChoosePhotoFile() {
    CommonModel.doTrackEvent({
      event_name: 'app_user_want_issue_photo',
      account_number: DataProcessor.getUserInformation().bitmarkAccountNumber,
    });
    let options = {
      title: '',
      takePhotoButtonTitle: '',
      mediaType: 'mixed',
      noData: true,
    };
    ImagePicker.showImagePicker(options, (response) => {
      if (response.error || response.didCancel) {
        return;
      }
      CommonModel.doTrackEvent({
        event_name: 'app_user_chosen_photo_for_issuance',
        account_number: DataProcessor.getUserInformation().bitmarkAccountNumber,
      });
      this.prepareToIssue(response);
    });
  }

  onChooseFile() {
    CommonModel.doTrackEvent({
      event_name: 'app_user_want_issue_file',
      account_number: DataProcessor.getUserInformation().bitmarkAccountNumber,

    });
    DocumentPicker.show({
      filetype: [DocumentPickerUtil.allFiles(), "public.data"],
    }, (error, response) => {
      if (error) {
        return;
      }
      CommonModel.doTrackEvent({
        event_name: 'app_user_chosen_file_for_issuance',
        account_number: DataProcessor.getUserInformation().bitmarkAccountNumber,
      });
      this.prepareToIssue(response);
    });
  }

  async prepareToIssue(response) {
    let filePath = response.uri.replace('file://', '');
    filePath = decodeURIComponent(filePath);

    // Move file from "tmp" folder to "cache" folder
    let destPath = FileUtil.CacheDirectory + '/' + response.fileName;
    await FileUtil.moveFileSafe(filePath, destPath);
    filePath = destPath;

    let fileName = response.fileName.substring(0, response.fileName.lastIndexOf('.'));
    let fileFormat = response.fileName.substring(response.fileName.lastIndexOf('.'));
    AppProcessor.doCheckFileToIssue(filePath).then(asset => {
      this.props.screenProps.homeNavigation.navigate('LocalIssueFile', {
        filePath, fileName, fileFormat, asset,
        fingerprint: asset.fingerprint
      });
    }).catch(error => {
      console.log('onChooseFile error :', error);
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
    });
  }

  issueHealthData() {
    if (!this.state.donationInformation || !this.state.donationInformation.activeBitmarkHealthDataAt) {
      this.props.navigation.navigate('HealthDataActive')
    } else {
      const resetHomePage = NavigationActions.reset({
        index: 0,
        actions: [
          NavigationActions.navigate({
            routeName: 'User', params: {
              displayedTab: { mainTab: BottomTabsComponent.MainTabs.account, subTab: 'AUTHORIZED' },
            }
          }),
        ]
      });
      this.props.screenProps.homeNavigation.dispatch(resetHomePage);
    }
  }
  issueIftttData() {
    if (!this.state.iftttInformation || !this.state.iftttInformation.connectIFTTT) {
      this.props.screenProps.homeNavigation.navigate('IftttActive');
    } else {
      const resetHomePage = NavigationActions.reset({
        index: 0,
        actions: [
          NavigationActions.navigate({
            routeName: 'User', params: {
              displayedTab: { mainTab: BottomTabsComponent.MainTabs.account, subTab: 'AUTHORIZED' },
            }
          }),
        ]
      });
      this.props.screenProps.homeNavigation.dispatch(resetHomePage);
    }
  }

  render() {
    return (
      <View style={issuanceOptionsStyle.body}>
        <View style={issuanceOptionsStyle.header}>
          <TouchableOpacity style={defaultStyle.headerLeft} onPress={() => this.props.screenProps.issuanceNavigation.goBack()}>
            <Image style={defaultStyle.headerLeftIcon} source={require('../../../../../../assets/imgs/header_blue_icon.png')} />
          </TouchableOpacity>
          <Text style={defaultStyle.headerTitle}>{'Register'.toUpperCase()}</Text>
          <TouchableOpacity style={defaultStyle.headerRight} />
        </View>
        <View style={issuanceOptionsStyle.content}>
          <TouchableOpacity style={issuanceOptionsStyle.optionButton} onPress={this.onChoosePhotoFile}>
            <Text style={issuanceOptionsStyle.optionButtonText}>PHOTOS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={issuanceOptionsStyle.optionButton} onPress={this.onChooseFile}>
            <Text style={issuanceOptionsStyle.optionButtonText}>FILES</Text>
          </TouchableOpacity>
          <TouchableOpacity style={issuanceOptionsStyle.optionButton} onPress={this.issueHealthData}>
            <Text style={issuanceOptionsStyle.optionButtonText}>HEALTH DATA</Text>
            {(!this.state.donationInformation || !this.state.donationInformation.activeBitmarkHealthDataAt) && <Image style={issuanceOptionsStyle.optionButtonNextIcon} source={require('./../../../../../../assets/imgs/next-icon-blue.png')} />}
            {this.state.donationInformation && !!this.state.donationInformation.activeBitmarkHealthDataAt && <Text style={issuanceOptionsStyle.optionButtonStatus}>{'Authorized'.toUpperCase()}</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={issuanceOptionsStyle.optionButton} onPress={this.issueIftttData}>
            <Text style={issuanceOptionsStyle.optionButtonText}>IFTTT DATA</Text>
            {(!this.state.iftttInformation || !this.state.iftttInformation.connectIFTTT) && <Image style={issuanceOptionsStyle.optionButtonNextIcon} source={require('./../../../../../../assets/imgs/next-icon-blue.png')} />}
            {this.state.iftttInformation && !!this.state.iftttInformation.connectIFTTT && <Text style={issuanceOptionsStyle.optionButtonStatus}>{'Authorized'.toUpperCase()}</Text>}
          </TouchableOpacity>

          <Text style={issuanceOptionsStyle.message}>
            Property rights are registered on Bitmark through the creation of an asset record followed by an issue record. Once an asset has been issued, transferring it simply requires taking advantage of the blockchain’s standard attributes.
          </Text>
        </View>
      </View>
    );
  }
}

IssuanceOptionsComponent.propTypes = {
  screenProps: PropTypes.shape({
    homeNavigation: PropTypes.shape({
      navigate: PropTypes.func,
      dispatch: PropTypes.func,
      goBack: PropTypes.func,
    }),
    issuanceNavigation: PropTypes.shape({
      navigate: PropTypes.func,
      goBack: PropTypes.func,
    }),
  }),
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
  }),
}
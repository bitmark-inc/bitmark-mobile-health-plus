import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, Image,
} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import { NavigationActions } from 'react-navigation';

import issuanceOptionsStyle from './issuance-options.component.style';
import defaultStyle from './../../../../../commons/styles';
import { AppController, DataController } from '../../../../../managers';
import { EventEmiterService } from '../../../../../services';
import { BottomTabsComponent } from '../../../bottom-tabs/bottom-tabs.component';

export class IssuanceOptionsComponent extends React.Component {
  constructor(props) {
    super(props);
    this.onChooseFile = this.onChooseFile.bind(this);
    this.issueHealthData = this.issueHealthData.bind(this);
    this.issueIftttData = this.issueIftttData.bind(this);
    this.handerDonationInformationChange = this.handerDonationInformationChange.bind(this);
    this.handerIftttInformationChange = this.handerIftttInformationChange.bind(this);
    this.state = {
      donationInformation: DataController.getDonationInformation(),
      iftttInformation: DataController.getIftttInformation(),
    }
  }

  // ==========================================================================================
  componentDidMount() {
    EventEmiterService.on(EventEmiterService.events.CHANGE_USER_DATA_DONATION_INFORMATION, this.handerDonationInformationChange);
    EventEmiterService.on(EventEmiterService.events.CHANGE_USER_DATA_IFTTT_INFORMATION, this.handerIftttInformationChange);
  }
  componentWillUnmount() {
    EventEmiterService.remove(EventEmiterService.events.CHANGE_USER_DATA_DONATION_INFORMATION, this.handerDonationInformationChange);
    EventEmiterService.remove(EventEmiterService.events.CHANGE_USER_DATA_IFTTT_INFORMATION, this.handerIftttInformationChange);
  }
  // ==========================================================================================
  handerDonationInformationChange() {
    this.setState({ donationInformation: DataController.getDonationInformation() });
  }

  handerIftttInformationChange() {
    this.setState({ iftttInformation: DataController.getIftttInformation() });
  }

  onChooseFile() {
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
      let filePath = response.uri.replace('file://', '');
      let fileName = response.fileName.substring(0, response.fileName.lastIndexOf('.'));
      let fileFormat = response.fileName.substring(response.fileName.lastIndexOf('.'));
      AppController.doCheckFileToIssue(filePath).then(asset => {
        let existingAsset = !!(asset && asset.registrant);
        let metadataList = [];
        if (existingAsset) {
          let key = 0;
          for (let label in asset.metadata) {
            metadataList.push({ key, label, value: asset.metadata[label] });
            key++;
          }
        }
        this.props.screenProps.homeNavigation.navigate('LocalIssueFile', {
          filePath, fileName, fileFormat, asset,
          fingerprint: asset.fingerprint
        });
      }).catch(error => {
        console.log('onChooseFile error :', error);
        EventEmiterService.emit(EventEmiterService.events.APP_PROCESS_ERROR);
      });
    });
  }

  issueHealthData() {
    if (!this.state.donationInformation.activeBitmarkHealthDataAt) {
      this.props.navigation.navigate('HealthDataActive')
    } else {
      const resetHomePage = NavigationActions.reset({
        index: 0,
        actions: [
          NavigationActions.navigate({
            routeName: 'User', params: {
              displayedTab: { mainTab: BottomTabsComponent.MainTabs.account, subTab: 'AUTHORIZED' },
              needReloadData: true,
            }
          }),
        ]
      });
      this.props.screenProps.homeNavigation.dispatch(resetHomePage);
    }
  }
  issueIftttData() {
    if (!this.state.iftttInformation.connectIFTTT) {
      this.props.screenProps.homeNavigation.navigate('IftttActive');
    } else {
      const resetHomePage = NavigationActions.reset({
        index: 0,
        actions: [
          NavigationActions.navigate({
            routeName: 'User', params: {
              displayedTab: { mainTab: BottomTabsComponent.MainTabs.account, subTab: 'AUTHORIZED' },
              needReloadData: true,
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
          <TouchableOpacity style={issuanceOptionsStyle.optionButton} onPress={this.onChooseFile}>
            <Text style={issuanceOptionsStyle.optionButtonText}>PHOTOS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={issuanceOptionsStyle.optionButton} onPress={this.issueHealthData}>
            <Text style={issuanceOptionsStyle.optionButtonText}>HEALTH DATA</Text>
            {!this.state.donationInformation.activeBitmarkHealthDataAt && <Image style={issuanceOptionsStyle.optionButtonNextIcon} source={require('./../../../../../../assets/imgs/next-icon-blue.png')} />}
            {!!this.state.donationInformation.activeBitmarkHealthDataAt && <Text style={issuanceOptionsStyle.optionButtonStatus}>{'Authorized'.toUpperCase()}</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={issuanceOptionsStyle.optionButton} onPress={this.issueIftttData}>
            <Text style={issuanceOptionsStyle.optionButtonText}>IFTTT DATA</Text>
            {!this.state.iftttInformation.connectIFTTT && <Image style={issuanceOptionsStyle.optionButtonNextIcon} source={require('./../../../../../../assets/imgs/next-icon-blue.png')} />}
            {!!this.state.iftttInformation.connectIFTTT && <Text style={issuanceOptionsStyle.optionButtonStatus}>{'Authorized'.toUpperCase()}</Text>}
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
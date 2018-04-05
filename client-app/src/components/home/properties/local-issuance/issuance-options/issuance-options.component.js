import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, Image,
} from 'react-native';
import ImagePicker from 'react-native-image-picker';

import issuanceOptionsStyle from './issuance-options.component.style';
import defaultStyle from './../../../../../commons/styles';
import { AppController, DataController } from '../../../../../managers';
import { EventEmiterService } from '../../../../../services';

export class IssuanceOptionsComponent extends React.Component {
  constructor(props) {
    super(props);
    this.onChooseFile = this.onChooseFile.bind(this);
    this.issueHealthData = this.issueHealthData.bind(this);
    this.handerDonationInformationChange = this.handerDonationInformationChange.bind(this);
    this.state = {
      donationInformation: DataController.getDonationInformation(),
    }
  }

  // ==========================================================================================
  componentDidMount() {
    EventEmiterService.on(EventEmiterService.events.CHANGE_USER_DATA_DONATION_INFORMATION, this.handerDonationInformationChange);
  }
  componentWillUnmount() {
    EventEmiterService.remove(EventEmiterService.events.CHANGE_USER_DATA_DONATION_INFORMATION, this.handerDonationInformationChange);
  }
  // ==========================================================================================
  handerDonationInformationChange() {
    this.setState({ donationInformation: DataController.getDonationInformation() });
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
        EventEmiterService.emit(EventEmiterService.events.error);
      });
    });
  }

  issueHealthData() {
    if (!this.state.donationInformation.activeBitmarkHealthDataAt) {
      this.props.navigation.navigate('HealthDataActive')
    } else {
      this.props.screenProps.homeNavigation.navigate('HealthDataSettings');
    }
  }

  render() {
    return (
      <View style={issuanceOptionsStyle.body}>
        <View style={issuanceOptionsStyle.header}>
          <TouchableOpacity style={defaultStyle.headerLeft} onPress={() => this.props.screenProps.issuanceNavigation.goBack()}>
            <Image style={defaultStyle.headerLeftIcon} source={require('../../../../../../assets/imgs/header_blue_icon.png')} />
          </TouchableOpacity>
          <Text style={defaultStyle.headerTitle}>{'BITMARK YOUR:'.toUpperCase()}</Text>
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

          <Text style={issuanceOptionsStyle.message}>Start bitmarking your digital asset and own it.</Text>
        </View>
      </View>
    );
  }
}

IssuanceOptionsComponent.propTypes = {
  screenProps: PropTypes.shape({
    homeNavigation: PropTypes.shape({
      navigate: PropTypes.func,
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
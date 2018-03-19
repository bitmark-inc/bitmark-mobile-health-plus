import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, Image,
  Platform,
} from 'react-native';
import ImagePicker from 'react-native-image-picker';


import localAddPropertyStyle from './choose-file.component.style';
import { androidDefaultStyle, iosDefaultStyle } from './../../../../../commons/styles';
import { AppController } from '../../../../../managers';

let defaultStyle = Platform.select({
  ios: iosDefaultStyle,
  android: androidDefaultStyle
});

export class ChooseFileComponent extends React.Component {
  constructor(props) {
    super(props);
    this.onChooseFile = this.onChooseFile.bind(this);
    this.state = { fileError: '' };
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
        this.props.navigation.navigate('IssueFile', {
          filePath, fileName, fileFormat, asset,
          fingerprint: asset.fingerprint
        })
      }).catch(error => {
        console.log('choose file error:', error);
        this.setState({
          fileError: 'There was a problem uploading your file. Please try again.',
        });
      });
    });
  }
  render() {
    return (
      <View style={localAddPropertyStyle.body}>
        <View style={defaultStyle.header}>
          <TouchableOpacity style={defaultStyle.headerLeft} onPress={() => this.props.screenProps.addPropertyNavigation.goBack()}>
            <Image style={defaultStyle.headerLeftIcon} source={require('../../../../../../assets/imgs/header_blue_icon.png')} />
          </TouchableOpacity>
          <Text style={defaultStyle.headerTitle}>{'Create Properties'.toUpperCase()}</Text>
          <TouchableOpacity style={defaultStyle.headerRight} />
        </View>

        <TouchableOpacity activeOpacity={1} style={localAddPropertyStyle.body}>
          <View style={localAddPropertyStyle.addFileArea}>
            <Text style={localAddPropertyStyle.addFileLabel}>UPLOAD ASSET</Text>
            {!!this.state.fileError && <Text style={localAddPropertyStyle.fileInputError}>{this.state.fileError}</Text>}
            <TouchableOpacity style={localAddPropertyStyle.addFileButton} onPress={this.onChooseFile}>
              <Image style={localAddPropertyStyle.addFileIcon} source={require('../../../../../../assets/imgs/plus-icon.png')} />
              <Text style={localAddPropertyStyle.addFileButtonText}>ADD A FILE</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}

ChooseFileComponent.propTypes = {
  screenProps: PropTypes.shape({
    addPropertyNavigation: PropTypes.shape({
      navigate: PropTypes.func,
      goBack: PropTypes.func,
    }),
  }),
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
  }),
}
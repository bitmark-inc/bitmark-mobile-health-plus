import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, Image, TextInput, FlatList, ScrollView, TouchableWithoutFeedback,
  Platform,
  Keyboard,
} from 'react-native';

import ImagePicker from 'react-native-image-picker';

import { AppService, EventEmiterService } from './../../../../services';

import localAddPropertyStyle from './local-add-property.component.style';
import { androidDefaultStyle, iosDefaultStyle } from './../../../../commons/styles';

let defaultStyle = Platform.select({
  ios: iosDefaultStyle,
  android: androidDefaultStyle
});

const Steps = {
  input_file: 'Next',
  input_info: 'Register',
};

export class LocalAddPropertyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.chooseFile = this.chooseFile.bind(this);
    this.register = this.register.bind(this);
    this.continue = this.continue.bind(this);
    this.back = this.back.bind(this);

    let metadataList = [];
    metadataList.push({ key: 0, label: '', value: '' });

    this.state = {
      step: Steps.input_file,
      metadataList,
      filepath: '',
      filename: '',
      fileFormat: '',
    }
  }

  chooseFile() {
    let options = {
      title: 'Select Avatar',
      mediaType: 'mixed',
    };
    EventEmiterService.emit(EventEmiterService.events.APP_PROCESSING, true);
    ImagePicker.showImagePicker(options, (response) => {
      EventEmiterService.emit(EventEmiterService.events.APP_PROCESSING, false);
      if (response.error || response.didCancel) {
        return;
      }
      let filepath = response.uri.replace('file://', '');
      let filename = response.fileName.substring(0, response.fileName.lastIndexOf('.'));
      let fileFormat = response.fileName.substring(response.fileName.lastIndexOf('.'));
      this.setState({ step: Steps.input_info, filepath, filename, fileFormat });
      console.log('response :', response);
    });
  }

  register() {
    EventEmiterService.emit(EventEmiterService.events.APP_SUBMITTING, { indicator: true, title: 'Submitting your request to the network for confirmation…', message: '' });
    AppService.testIssueFile(this.state.filepath).then(() => {
      EventEmiterService.emit(EventEmiterService.events.APP_SUBMITTING, { indicator: false, title: 'Issuance Successful!', message: 'Now you’ve created your property. Let’s verify that your property is showing up in your account.' });
      setTimeout(() => {
        EventEmiterService.emit(EventEmiterService.events.APP_SUBMITTING, null);
        if (this.props.navigation.state.params.refreshPropertiesScreen) {
          this.props.navigation.state.params.refreshPropertiesScreen();
          this.props.navigation.goBack();
        }
      }, 1000);
    }).catch(error => {
      EventEmiterService.emit(EventEmiterService.events.APP_SUBMITTING, null);
      console.log('issue bitmark error :', error);
    });
  }

  back() {
    if (this.state.step === Steps.input_file) {
      this.props.navigation.goBack();
    } else if (this.state.step === Steps.input_info) {
      this.setState({ step: Steps.input_file });
    }
  }

  continue() {
    if (this.state.step === Steps.input_file) {
      this.chooseFile();
    } else if (this.state.step === Steps.input_info) {
      this.register();
    }
  }

  render() {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView style={localAddPropertyStyle.scroll}>
          <View style={localAddPropertyStyle.body} onPress={Keyboard.dismiss}>
            <View style={defaultStyle.header}>
              <TouchableOpacity style={defaultStyle.headerLeft} onPress={this.back}>
                <Image style={defaultStyle.headerLeftIcon} source={require('../../../../../assets/imgs/header_back_icon_study_setting.png')} />
              </TouchableOpacity>
              <Text style={defaultStyle.headerTitle}>Create Properties</Text>
              <TouchableOpacity style={defaultStyle.headerRight} />
            </View>
            {this.state.step === Steps.input_file && <View style={localAddPropertyStyle.addFileArea}>
              <Text style={localAddPropertyStyle.addFileLabel}>Upload Asset</Text>
              <TouchableOpacity style={localAddPropertyStyle.addFileButton}>
                <Text style={localAddPropertyStyle.addFileButtonText}>+ add a file</Text>
              </TouchableOpacity>
            </View>}
            {this.state.step === Steps.input_info && <View style={localAddPropertyStyle.infoArea}>
              <Text style={localAddPropertyStyle.fingerprintLabel}>Asset Fingerprint</Text>
              <Text style={localAddPropertyStyle.fingerprintValue}>fd8228dbfba1df0...c0f135c6f6b3a4c67230</Text>
              <View style={localAddPropertyStyle.fingerprintInfoArea}>
                <Text style={localAddPropertyStyle.fingerprintInfoMessage}>GENERATED FROM </Text>
                <Text style={localAddPropertyStyle.fingerprintInfoFilename}>{this.state.filename}</Text>
                <Text style={localAddPropertyStyle.fingerprintInfoFileFormat}>{this.state.fileFormat}</Text>
              </View>
              <Text style={localAddPropertyStyle.assetInfoLabel}>Metadata</Text>
              <Text style={localAddPropertyStyle.assetNameLabel}>PROPERTY NAME</Text>
              <TextInput style={localAddPropertyStyle.assetNameInput} placeholder="64-CHARACTER MAX" />
              <Text style={localAddPropertyStyle.metadataLabel}>OPTIONAL PROPERTY METADATA (2048-BYTE LIMIT)</Text>
              <View style={localAddPropertyStyle.metadataArea}>
                <FlatList style={localAddPropertyStyle.metadataList}
                  data={this.state.metadataList}
                  extraData={this.state.metadataList}
                  renderItem={({ item }) => {
                    return (
                      <View style={localAddPropertyStyle.metadataField}>
                        <TextInput style={localAddPropertyStyle.metadataFieldLabel} value={item.label} placeholder="LABEL" />
                        <TextInput style={localAddPropertyStyle.metadataFieldValue} value={item.value} placeholder="DESCRIPTION" />
                      </View>
                    )
                  }}
                />
              </View>
              <TouchableOpacity style={localAddPropertyStyle.addMetadataButton}>
                <Text style={localAddPropertyStyle.addMetadataButtonText}>+ ADD LABEL</Text>
              </TouchableOpacity>
              {this.state.metadataError && <Text style={localAddPropertyStyle.metadataInputError}>{this.state.metadataError}</Text>}
              <Text style={localAddPropertyStyle.quantityLabel}>Issue Number of bitmark</Text>
              <TextInput style={localAddPropertyStyle.quantityInput} placeholder="Minumum is 1" />
              {this.state.quantityError && <Text style={localAddPropertyStyle.quantityInputError}>{this.state.quantityError}</Text>}

              <Text style={localAddPropertyStyle.ownershipClaimLabel}>Ownership claim</Text>
              <Text style={localAddPropertyStyle.ownershipClaimMessage}>{'“I hereby claim that I am the legal owner of this asset and want these property to be irrevocably issued and recorded in the Bitmark blockchain.”'.toUpperCase()}</Text>
            </View>}


            <TouchableOpacity style={localAddPropertyStyle.continueButton} onPress={this.continue}>
              <Text style={localAddPropertyStyle.continueButtonText}>{this.state.step}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    );
  }
}

LocalAddPropertyComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
    dispatch: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.shape({
        refreshPropertiesScreen: PropTypes.func,
      }),
    }),
  }),
}
import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, Image, TextInput, FlatList, ScrollView, TouchableWithoutFeedback,
  Platform,
  Keyboard,
} from 'react-native';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ImagePicker from 'react-native-image-picker';


import { AutoCompleteKeyboardInput } from './../../../../commons/components';
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

const MetadataLabelSamples = [
  'Created (date)', 'Contributor', 'Coverage', 'Creator',
  'Description', 'Dimensions', 'Duration', 'Edition',
  'Format', 'Identifier', 'Language', 'License',
  'Medium', 'Publisher', 'Relation', 'Rights',
  'Size', 'Source', 'Subject', 'Keywords',
  'Type', 'Version'];

export class LocalAddPropertyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.chooseFile = this.chooseFile.bind(this);
    this.register = this.register.bind(this);
    this.continue = this.continue.bind(this);
    this.back = this.back.bind(this);
    this.doInputAssetName = this.doInputAssetName.bind(this);
    this.doInputMetadataLabel = this.doInputMetadataLabel.bind(this);
    this.doInputMetadataValue = this.doInputMetadataValue.bind(this);
    this.addNewMetadataField = this.addNewMetadataField.bind(this);
    this.checkMetadata = this.checkMetadata.bind(this);
    this.doInputQuantity = this.doInputQuantity.bind(this);

    this.state = {
      // step: Steps.input_file,
      step: Steps.input_info,

      existingAsset: false,
      metadataList: [],
      filepath: '',
      filename: '',
      fileFormat: '',
      fileError: '',
      assetName: '',
      canAddNewMetadata: false,
      canIssue: false,
      quantity: '',
      selectedMetadata: null,

      assetNameError: '',
      quantityError: '',
      metadataError: '',
      issueError: '',
    }
  }

  chooseFile() {
    // this.autoCompleteElement.showKeyboardInput();
    let options = {
      title: 'Select Avatar',
      mediaType: 'mixed',
    };
    EventEmiterService.emit(EventEmiterService.events.APP_PROCESSING, true);
    ImagePicker.showImagePicker(options, (response) => {
      if (response.error || response.didCancel) {
        EventEmiterService.emit(EventEmiterService.events.APP_PROCESSING, false);
        return;
      }
      let filepath = response.uri.replace('file://', '');
      let filename = response.fileName.substring(0, response.fileName.lastIndexOf('.'));
      let fileFormat = response.fileName.substring(response.fileName.lastIndexOf('.'));
      AppService.doCheckingIssuance(filepath).then(asset => {
        console.log('asset :', asset);
        let existingAsset = !!(asset && asset.registrant);
        let metadataList = [];
        if (existingAsset) {
          let key = 0;
          for (let label in asset.metadata) {
            metadataList.push({ key, label, value: asset.metadata[label] });
            key++;
          }
        } else {
          metadataList.push({ key: 0, label: '', value: '' });
        }
        let state = {
          fingerprint: asset.fingerprint,
          assetName: asset.name || '',
          existingAsset,
          metadataList,
          filepath,
          filename,
          fileFormat,
          step: Steps.input_info,
          fileError: '',
          canIssue: (this.state.assetName && !this.state.assetNameError && this.asset.quantity && !this.state.quantityError),
          canAddNewMetadata: false,
        };
        console.log('state :', state);
        this.setState(state);
        EventEmiterService.emit(EventEmiterService.events.APP_PROCESSING, false);
      }).catch(error => {
        EventEmiterService.emit(EventEmiterService.events.APP_PROCESSING, false);
        this.setState({
          fileError: error.message,
        });
      });
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

  doInputAssetName(assetName) {
    let assetNameError = '';
    if (assetName.length > 64) {
      assetNameError = 'Property name must be smaller or equal 64 character!';
    }
    this.setState({
      assetName, assetNameError,
      canIssue: (assetName && assetNameError && this.asset.quantity && !this.state.quantityError),
    });
  }

  checkMetadata(metadataList) {
    for (let index = 0; index < metadataList.length; index++) {
      if (!this.state.metadataList[index].label && !metadataList[index].value) {
        this.setState({
          canAddNewMetadata: false,
          canIssue: false,
        });
        return;
      }
    }
    this.setState({
      canAddNewMetadata: true,
      canIssue: (this.state.assetName && !this.state.assetNameError && this.asset.quantity && !this.state.quantityError),
    });
  }
  doInputMetadataLabel(key, label) {
    console.log(key, label);
    let metadataList = this.state.metadataList;
    for (let index = 0; index < metadataList.length; index++) {
      if (metadataList[index].key === key) {
        metadataList[index].label = label;
        break;
      }
    }
    this.setState({ metadataList });
    this.checkMetadata(metadataList);
  }
  doInputMetadataValue(key, value) {
    let metadataList = this.state.metadataList;
    for (let index = 0; index < metadataList.length; index++) {
      if (metadataList[index].key === key) {
        metadataList[index].value = value;
        break;
      }
    }
    this.setState({ metadataList });
    this.checkMetadata(metadataList);
  }

  addNewMetadataField() {
    let metadataList = this.state.metadataList;
    metadataList.push({ key: metadataList.length, label: '', value: '' });
    this.setState({ metadataList, canAddNewMetadata: false, canIssue: false, });
  }

  doInputQuantity(quantity) {
    quantity = quantity.replace(/[^0-9]/g, '');
    let quantityNumber = parseInt(quantity);
    let quantityError = '';
    if (isNaN(quantityNumber) || quantityNumber <= 0 || quantityNumber > 100) {
      quantityError = 'Quantity only accept from 1 to 100';
    }
    this.setState({
      quantity, quantityError,
      canIssue: (this.state.assetName && this.state.assetNameError && quantity && !quantityError),
    });
  }

  render() {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View>
          <AutoCompleteKeyboardInput ref={(ref) => this.autoCompleteElement = ref}
            dataSource={MetadataLabelSamples}
            autoCorrect={false}
            onlyDisplayWhenCalled={true}
            // onSelectWord={this.onSubmitWord}
            onKeyboardDidShow={this.onKeyboardDidShow}
            onKeyboardDidHide={this.onKeyboardDidHide}
          >
          </AutoCompleteKeyboardInput>

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
                {!!this.state.fileError && <Text style={localAddPropertyStyle.fileInputError}>{this.state.fileError}</Text>}
                <TouchableOpacity style={localAddPropertyStyle.addFileButton} onPress={this.chooseFile}>
                  <Text style={localAddPropertyStyle.addFileButtonText}>+ ADD A FILE</Text>
                </TouchableOpacity>
              </View>}
              {this.state.step === Steps.input_info && <KeyboardAwareScrollView style={localAddPropertyStyle.infoArea} behavior="padding">
                <Text style={localAddPropertyStyle.fingerprintLabel}>Asset Fingerprint</Text>
                <Text style={localAddPropertyStyle.fingerprintValue} numberOfLines={1} >{this.state.fingerprint}</Text>
                <View style={localAddPropertyStyle.fingerprintInfoArea}>
                  <Text style={localAddPropertyStyle.fingerprintInfoMessage}>GENERATED FROM </Text>
                  <Text style={localAddPropertyStyle.fingerprintInfoFilename}>{this.state.filename}</Text>
                  <Text style={localAddPropertyStyle.fingerprintInfoFileFormat}>{this.state.fileFormat}</Text>
                </View>
                <Text style={localAddPropertyStyle.assetInfoLabel}>Metadata</Text>
                <Text style={localAddPropertyStyle.assetNameLabel}>PROPERTY NAME</Text>
                {!this.state.existingAsset && <TextInput style={[localAddPropertyStyle.assetNameInput, {
                  borderBottomColor: this.assetNameError ? '#FF003C' : '#0060F2'
                }]} placeholder="64-CHARACTER MAX"
                  onChangeText={this.doInputAssetName}
                />}
                {!!this.state.assetNameError && <Text style={localAddPropertyStyle.assetNameInputError}>{this.state.assetNameError}</Text>}
                {this.state.existingAsset && <Text style={localAddPropertyStyle.assetNameInput}>{this.state.asset}</Text>}

                <Text style={localAddPropertyStyle.metadataLabel}>OPTIONAL PROPERTY METADATA (2048-BYTE LIMIT)</Text>
                <View style={localAddPropertyStyle.metadataArea}>
                  <FlatList style={localAddPropertyStyle.metadataList}
                    data={this.state.metadataList}
                    extraData={this.state}
                    renderItem={({ item }) => {
                      return (
                        <View style={localAddPropertyStyle.metadataField}>
                          <TouchableOpacity onPress={() => {
                            this.setState({ selectedMetadata: { key: item.key, type: 'label' } });
                          }}>
                            <Text style={[localAddPropertyStyle.metadataFieldLabel, {
                              borderBottomColor: item.labelError ? '#FF003C' : '#0060F2',
                              color: item.label ? 'black' : '#C2C2C2'
                            }]} > {item.label || 'LABEL'} </Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => {
                            this.setState({ selectedMetadata: { key: item.key, type: 'value' } });
                          }}>
                            <Text style={[localAddPropertyStyle.metadataFieldValue, {
                              borderBottomColor: item.valueError ? '#FF003C' : '#0060F2',
                              color: item.value ? 'black' : '#C2C2C2'
                            }]} > {item.value || 'DESCRIPTION'} </Text>
                          </TouchableOpacity>
                        </View>
                      )
                    }}
                  />
                </View>
                {!this.state.existingAsset && <TouchableOpacity style={localAddPropertyStyle.addMetadataButton} disabled={!this.state.canAddNewMetadata} onPress={this.addNewMetadataField}>
                  <Text style={[localAddPropertyStyle.addMetadataButtonText, { color: this.state.canAddNewMetadata ? '#0060F2' : '#C2C2C2' }]}>+ ADD LABEL</Text>
                </TouchableOpacity>}
                {!!this.state.metadataError && <Text style={localAddPropertyStyle.metadataInputError}>{this.state.metadataError}</Text>}
                <Text style={localAddPropertyStyle.quantityLabel}>Issue Number of bitmark</Text>
                <TextInput style={[localAddPropertyStyle.quantityInput, {
                  borderBottomColor: this.assetNameError ? '#FF003C' : '#0060F2'
                }]} placeholder="input number from 1 to 100"
                  onChangeText={this.doInputQuantity}
                  keyboardType={'numeric'}
                />
                {!!this.state.quantityError && <Text style={localAddPropertyStyle.quantityInputError}>{this.state.quantityError}</Text>}

                <Text style={localAddPropertyStyle.ownershipClaimLabel}>Ownership claim</Text>
                <Text style={localAddPropertyStyle.ownershipClaimMessage}>{'“I hereby claim that I am the legal owner of this asset and want these property to be irrevocably issued and recorded in the Bitmark blockchain.”'.toUpperCase()}</Text>
                {!!this.state.issueError && <Text style={localAddPropertyStyle.issueError}>{this.state.issueError}</Text>}
              </KeyboardAwareScrollView>}
              {this.state.step === Steps.input_info && <TouchableOpacity
                style={[localAddPropertyStyle.continueButton, { backgroundColor: this.state.canIssue ? '#0060F2' : '#C2C2C2' }]}
                onPress={this.continue}
                disabled={!this.state.canIssue}
              >
                <Text style={localAddPropertyStyle.continueButtonText}>{this.state.step}</Text>
              </TouchableOpacity>}
            </View>
          </ScrollView>
        </View>
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
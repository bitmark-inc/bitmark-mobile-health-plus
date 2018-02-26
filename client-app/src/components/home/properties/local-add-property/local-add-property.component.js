import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, Image, TextInput, FlatList, ScrollView, TouchableWithoutFeedback,
  Platform,
  Keyboard,
} from 'react-native';
import { BitmarkDialogComponent } from './../../../../commons/components';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
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

const MetadataLabelSamples = [
  'Created (date)', 'Contributor', 'Coverage', 'Creator',
  'Description', 'Dimensions', 'Duration', 'Edition',
  'Format', 'Identifier', 'Language', 'License',
  'Medium', 'Publisher', 'Relation', 'Rights',
  'Size', 'Source', 'Subject', 'Keywords',
  'Type', 'Version'];

class MetadataInputComponent extends React.Component {
  constructor(props) {
    super(props);
    this.onChangeText = this.onChangeText.bind(this);
    this.onSelecteLabel = this.onSelecteLabel.bind(this);

    let textInput = this.props.defaultValue || '';
    let labels = [];
    MetadataLabelSamples.forEach((label, key) => {
      if (!textInput || label.toLowerCase().indexOf(textInput.toLowerCase()) >= 0) {
        labels.push({ key, label });
      }
    });
    this.state = {
      textInput,
      labels,
    }
  }

  componentDidMount() {
    this.textInputRef.focus();
  }

  onChangeText(textInput) {
    let labels = [];
    MetadataLabelSamples.forEach((label, key) => {
      if (!textInput || label.toLocaleLowerCase().indexOf(textInput.toLocaleLowerCase()) >= 0) {
        labels.push({ key, label });
      }
    });
    this.setState({
      textInput,
      labels
    });
  }

  onSelecteLabel(textInput) {
    this.setState({ textInput });
    this.onChangeText(textInput);
  }
  render() {
    return (
      < BitmarkDialogComponent
        dialogStyle={{ marginBottom: 100 }}
        close={this.props.cancel}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{
            width: '100%', height: this.props.type === 'label' ? 220 : 100,
            flexDirection: 'column', alignItems: 'center',
          }}>
            <TextInput
              autoCorrect={false}
              style={{
                borderBottomWidth: 1, marginTop: 20, marginBottom: 20,
                textAlign: 'center',
                width: '100%', maxHeight: 50,
              }} placeholder={this.props.type.toUpperCase()}
              multiline={true}
              value={this.state.textInput}
              onChangeText={this.onChangeText}
              ref={(ref) => this.textInputRef = ref}
            />
            {this.props.type === 'label' && <View style={{
              height: 100, width: '100%',
              borderBottomWidth: 1,
              flexDirection: 'column', alignItems: 'center'
            }}>
              <FlatList
                data={this.state.labels}
                extraData={this.state}
                renderItem={({ item }) => {
                  return <TouchableOpacity onPress={() => this.onSelecteLabel(item.label)}>
                    <Text style={{ color: '#0060F2' }}>{item.label}</Text>
                  </TouchableOpacity>
                }}

              />
            </View>}
            <View style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
              height: 30,
            }}>
              <TouchableOpacity style={{
                backgroundColor: '#0060F2', padding: 4,
              }}
                onPress={() => this.props.done(this.state.textInput)}
              >
                <Text style={{ color: 'white' }}>Done</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{
                backgroundColor: '#0060F2', padding: 4,
                marginLeft: 10,
              }}
                onPress={this.props.cancel}
              >
                <Text style={{ color: 'white' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </BitmarkDialogComponent >
    );
  }
}

MetadataInputComponent.propTypes = {
  cancel: PropTypes.func,
  done: PropTypes.func,
  type: PropTypes.string,
  defaultValue: PropTypes.string,
}
export class LocalAddPropertyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.chooseFile = this.chooseFile.bind(this);
    this.register = this.register.bind(this);

    this.back = this.back.bind(this);
    this.doInputAssetName = this.doInputAssetName.bind(this);
    this.addNewMetadataField = this.addNewMetadataField.bind(this);
    this.checkMetadata = this.checkMetadata.bind(this);
    this.doInputQuantity = this.doInputQuantity.bind(this);

    this.state = {
      step: Steps.input_file,
      // step: Steps.input_info,
      existingAsset: false,
      // metadataList: [],
      metadataList: [{ key: 0, label: '', value: '' }],
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
    let options = {
      title: 'Select Avatar',
      mediaType: 'mixed',
    };
    ImagePicker.showImagePicker(options, (response) => {
      if (response.error || response.didCancel) {
        return;
      }
      EventEmiterService.emit(EventEmiterService.events.APP_PROCESSING, true);
      let filepath = response.uri.replace('file://', '');
      let filename = response.fileName.substring(0, response.fileName.lastIndexOf('.'));
      let fileFormat = response.fileName.substring(response.fileName.lastIndexOf('.'));
      AppService.doCheckingIssuance(filepath).then(asset => {
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
          canIssue: (this.state.assetName && !this.state.assetNameError && this.state.quantity && !this.state.quantityError),
          canAddNewMetadata: false,
        };
        this.setState(state);
        EventEmiterService.emit(EventEmiterService.events.APP_PROCESSING, false);
      }).catch(error => {
        EventEmiterService.emit(EventEmiterService.events.APP_PROCESSING, false);
        this.setState({
          fileError: error.message,
        });
      });
    });
  }

  register() {
    EventEmiterService.emit(EventEmiterService.events.APP_SUBMITTING, { indicator: true, title: 'Submitting your request to the network for confirmation…', message: '' });
    AppService.issueFile(this.state.filepath, this.state.assetName, this.state.metadataList, parseInt(this.state.quantity)).then(() => {
      EventEmiterService.emit(EventEmiterService.events.APP_SUBMITTING, { indicator: false, title: 'Issuance Successful!', message: 'Now you’ve created your property. Let’s verify that your property is showing up in your account.' });
      setTimeout(() => {
        EventEmiterService.emit(EventEmiterService.events.APP_SUBMITTING, null);
        if (this.props.navigation.state.params.refreshPropertiesScreen) {
          this.props.navigation.state.params.refreshPropertiesScreen();
          this.props.navigation.goBack();
        }
      }, 1000);
    }).catch(error => {
      this.setState({ issueError: 'There are problem when issue file!' });
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

  doInputAssetName(assetName) {
    let assetNameError = '';
    if (assetName.length > 64) {
      assetNameError = 'Property name must be smaller or equal 64 character!';
    } else if (!assetName) {
      assetNameError = 'You must input property name!';
    }
    this.setState({
      assetName, assetNameError,
      canIssue: (assetName && !assetNameError && this.state.quantity && !this.state.quantityError),
    });
  }

  checkMetadata(metadataList) {
    let index = metadataList.findIndex((item) => !item.label || !item.value);
    if (index >= 0) {
      this.setState({
        metadataList,
        canAddNewMetadata: false,
        canIssue: false,
      });
    } else {
      this.setState({
        metadataList,
        canAddNewMetadata: true,
        canIssue: (this.state.assetName && !this.state.assetNameError && this.state.quantity && !this.state.quantityError),
      });
    }
    AppService.checkMetadata(metadataList).then(() => {
      this.setState({ metadataError: '' });
    }).catch((error) => {
      console.log('error :', error);
      this.setState({ metadataError: 'METADATA is too long (2048-BYTE LIMIT)!' });
    });
  }

  doneInputSelectedMetadata(text) {
    let metadataList = this.state.metadataList;
    let index = metadataList.findIndex((item) => item.key === this.state.selectedMetadata.key);
    if (this.state.selectedMetadata.type === 'label') {
      metadataList[index].label = text;
    } else {
      metadataList[index].value = text;
    }
    metadataList[index].labelError = !!((index < (metadataList.length - 1) && !metadataList[index].label) ||
      (index === (metadataList.length - 1) && !metadataList[index].label && metadataList[index].value));
    metadataList[index].valueError = !!((index < (metadataList.length - 1) && !metadataList[index].value) ||
      (index === (metadataList.length - 1) && !metadataList[index].value && metadataList[index].label));
    this.setState({ selectedMetadata: null, });
    this.checkMetadata(metadataList);
  }

  removeMetadata(key) {
    let metadataList = this.state.metadataList.filter((item) => item.key != key);
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
      canIssue: (this.state.assetName && !this.state.assetNameError && quantity && !quantityError),
    });
  }

  render() {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View>
          {!!this.state.selectedMetadata && <MetadataInputComponent
            cancel={() => this.setState({ selectedMetadata: null })}
            done={(text) => this.doneInputSelectedMetadata(text)}
            type={this.state.selectedMetadata.type}
            defaultValue={this.state.selectedMetadata.value}
          />}

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
                <TextInput
                  autoCorrect={false}
                  style={[localAddPropertyStyle.assetNameInput, {
                    color: this.state.existingAsset ? '#C2C2C2' : 'black',
                    borderBottomColor: this.stateNameError ? '#FF003C' : (this.state.existingAsset ? '#C2C2C2' : '#0060F2')
                  }]} placeholder="REQUIRED and 64-CHARACTER MAX"
                  onChangeText={this.doInputAssetName}
                  value={this.state.assetName}
                  editable={!this.state.existingAsset}
                />
                {!!this.state.assetNameError && <Text style={localAddPropertyStyle.assetNameInputError}>{this.state.assetNameError}</Text>}

                <Text style={localAddPropertyStyle.metadataLabel}>OPTIONAL PROPERTY METADATA (2048-BYTE LIMIT)</Text>
                <View style={localAddPropertyStyle.metadataArea}>
                  <FlatList style={localAddPropertyStyle.metadataList}
                    data={this.state.metadataList}
                    extraData={this.state}
                    renderItem={({ item }) => {
                      return (
                        <View style={localAddPropertyStyle.metadataField}>
                          <TouchableOpacity style={[localAddPropertyStyle.metadataFieldButton, {
                            borderBottomColor: item.labelError ? '#FF003C' : '#0060F2',
                          }]}
                            disabled={this.state.existingAsset}
                            onPress={() => {
                              this.setState({ selectedMetadata: { key: item.key, type: 'label', value: item.label } });
                            }}
                          >
                            <Text style={[localAddPropertyStyle.metadataFieldLabel, {
                              color: (item.label && !this.state.existingAsset) ? 'black' : '#C2C2C2'
                            }]} > {item.label || 'LABEL'} </Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={[localAddPropertyStyle.metadataFieldButton, {
                            borderBottomColor: item.valueError ? '#FF003C' : '#0060F2',
                          }]}
                            disabled={this.state.existingAsset}
                            onPress={() => {
                              this.setState({ selectedMetadata: { key: item.key, type: 'description', value: item.value } });
                            }}
                          >
                            <Text style={[localAddPropertyStyle.metadataFieldValue, {
                              color: (item.value && !this.state.existingAsset) ? 'black' : '#C2C2C2'
                            }]} > {item.value || 'DESCRIPTION'} </Text>
                          </TouchableOpacity>
                          {!this.state.existingAsset && <TouchableOpacity style={[localAddPropertyStyle.metadataFieldButton, { borderBottomWidth: 0 }]}
                            onPress={() => this.removeMetadata(item.key)}
                          >
                            <Text style={[localAddPropertyStyle.metadataFieldRemove]} >REMOVE</Text>
                          </TouchableOpacity>}
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
                <TextInput
                  autoCorrect={false}
                  style={[localAddPropertyStyle.quantityInput, {
                    borderBottomColor: this.stateNameError ? '#FF003C' : '#0060F2'
                  }]} placeholder="REQUIRED AND NUMBER from 1 to 100"
                  onChangeText={this.doInputQuantity}
                  keyboardType={'numeric'}
                />
                {!!this.state.quantityError && <Text style={localAddPropertyStyle.quantityInputError}>{this.state.quantityError}</Text>}

                <Text style={localAddPropertyStyle.ownershipClaimLabel}>Ownership claim</Text>
                <Text style={localAddPropertyStyle.ownershipClaimMessage}>{'“I hereby claim that I am the legal owner of this asset and want these property to be irrevocably issued and recorded in the Bitmark blockchain.”'.toUpperCase()}</Text>
                {!!this.state.issueError && <Text style={localAddPropertyStyle.issueError}>{this.state.issueError}</Text>}
              </KeyboardAwareScrollView>}
              {this.state.step === Steps.input_info && <TouchableOpacity
                style={[localAddPropertyStyle.issueButton, { backgroundColor: this.state.canIssue ? '#0060F2' : '#C2C2C2' }]}
                onPress={this.register}
                disabled={!this.state.canIssue}
              >
                <Text style={localAddPropertyStyle.issueButtonText}>Register</Text>
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
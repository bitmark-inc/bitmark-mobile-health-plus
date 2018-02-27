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
import { convertWidth } from '../../../../utils';

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
            width: '100%', height: this.props.type === 'label' ? 220 : 110,
            flexDirection: 'column',
          }}>
            <TextInput
              autoCorrect={false}
              style={{
                borderBottomColor: '#EDF0F4',
                borderBottomWidth: 1,
                marginTop: 20, marginBottom: 5, marginLeft: '5%',
                width: '90%', maxHeight: 50,
              }} placeholder={(this.props.type === 'label') ? 'CREATE NEW LABEL' : 'DESCRIPTION'}
              multiline={true}
              value={this.state.textInput}
              onChangeText={this.onChangeText}
              ref={(ref) => this.textInputRef = ref}
              returnKeyType="done"
              onSubmitEditing={() => this.props.done(this.state.textInput)}
            />
            {this.props.type === 'label' && <View style={{
              height: 130, width: '90%',
              borderBottomWidth: 1,
              borderBottomColor: '#EDF0F4',
              flexDirection: 'column',
              marginLeft: '5%',
            }}>
              <Text style={{ marginBottom: 10, color: '#C9C9C9' }}>OR SELECT FROM BELOW:</Text>
              <FlatList
                data={this.state.labels}
                extraData={this.state}
                renderItem={({ item }) => {
                  return <TouchableOpacity style={{ padding: 4, marginTop: 3 }} onPress={() => this.onSelecteLabel(item.label)}>
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
                padding: 4,
                width: convertWidth(60)
              }}
                onPress={this.props.cancel}
              >
                <Text style={{ fontWeight: '700', color: '#C4C4C4' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{
                marginLeft: 5,
                padding: 4,
                width: convertWidth(60)
              }}
                onPress={() => this.props.done(this.state.textInput)}
              >
                <Text style={{ fontWeight: '700', color: '#0060F2' }}>Done</Text>
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
      // step: Steps.input_file,
      step: Steps.input_info,
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
      title: '',
      takePhotoButtonTitle: '',
      mediaType: 'mixed',
      noData: true,
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
                <Text style={localAddPropertyStyle.fingerprintLabel}>{'Asset Fingerprint'.toUpperCase()}</Text>
                <Text style={localAddPropertyStyle.fingerprintValue} numberOfLines={1} >{this.state.fingerprint}</Text>
                <View style={localAddPropertyStyle.fingerprintInfoArea}>
                  <Text style={localAddPropertyStyle.fingerprintInfoMessage}>GENERATED FROM </Text>
                  <Text style={localAddPropertyStyle.fingerprintInfoFilename}>{this.state.filename}</Text>
                  <Text style={localAddPropertyStyle.fingerprintInfoFileFormat}>{this.state.fileFormat}</Text>
                </View>
                <Text style={localAddPropertyStyle.assetInfoLabel}>METADATA</Text>
                <Text style={localAddPropertyStyle.assetNameLabel}>PROPERTY NAME</Text>
                <TextInput
                  autoCorrect={false}
                  style={[localAddPropertyStyle.assetNameInput, {
                    fontWeight: this.state.existingAsset ? '900' : '300',
                    color: this.state.existingAsset ? '#C2C2C2' : 'black',
                    borderBottomColor: this.stateNameError ? '#FF003C' : (this.state.existingAsset ? '#C2C2C2' : '#0060F2')
                  }]} placeholder="64-CHARACTER MAX"
                  onChangeText={this.doInputAssetName}
                  value={this.state.assetName}
                  numberOfLines={1}
                  editable={!this.state.existingAsset}
                  returnKeyType="done"
                  returnKeyLabel="Done"
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
                            }]}
                              numberOfLines={1}
                            > {item.label || 'LABEL'} </Text>
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
                            }]}
                              numberOfLines={1}
                            > {item.value || 'DESCRIPTION'} </Text>
                          </TouchableOpacity>
                          {!this.state.existingAsset && <TouchableOpacity style={[localAddPropertyStyle.metadataFieldButton, { borderBottomWidth: 0, }]}
                            onPress={() => this.removeMetadata(item.key)}
                          >
                            <Image style={localAddPropertyStyle.metadataFieldRemove} source={require('../../../../../assets/imgs/remove-icon.png')} />
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
                <Text style={localAddPropertyStyle.quantityLabel}>{'number of bitmarks TO ISSUE'.toUpperCase()}</Text>
                <TextInput
                  autoCorrect={false}
                  style={[localAddPropertyStyle.quantityInput, {
                    borderBottomColor: this.stateNameError ? '#FF003C' : '#0060F2'
                  }]} placeholder="1 ~ 100"
                  onChangeText={this.doInputQuantity}
                  keyboardType={'numeric'}
                  returnKeyType="done"
                  returnKeyLabel="Done"
                />
                {!!this.state.quantityError && <Text style={localAddPropertyStyle.quantityInputError}>{this.state.quantityError}</Text>}

                <Text style={localAddPropertyStyle.ownershipClaimLabel}>{'Ownership claim'.toUpperCase()}</Text>
                <Text style={localAddPropertyStyle.ownershipClaimMessage}>{'“I hereby claim that I am the legal owner of this asset and want these property to be irrevocably issued and recorded in the Bitmark blockchain.”'}</Text>
                {!!this.state.issueError && <Text style={localAddPropertyStyle.issueError}>{this.state.issueError}</Text>}
              </KeyboardAwareScrollView>}
              {this.state.step === Steps.input_info && <TouchableOpacity
                style={[localAddPropertyStyle.issueButton, { borderTopColor: this.state.canIssue ? '#0060F2' : '#C2C2C2' }]}
                onPress={this.register}
                disabled={!this.state.canIssue}
              >
                <Text style={localAddPropertyStyle.issueButtonText}>ISSUE</Text>
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
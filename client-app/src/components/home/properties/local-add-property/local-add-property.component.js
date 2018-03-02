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


import { BitmarkService } from './../../../../services';

import localAddPropertyStyle from './local-add-property.component.style';
import { androidDefaultStyle, iosDefaultStyle } from './../../../../commons/styles';
import { convertWidth } from '../../../../utils';
import { AppController } from '../../../../managers';

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
      placeholder: (props.type === 'label') ? 'CREATE NEW LABEL' : 'DESCRIPTION'
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
            width: '100%', height: this.props.type === 'label' ? 220 : 90,
            flexDirection: 'column',
          }}>
            <TextInput
              autoCorrect={false}
              style={{
                borderBottomColor: '#EDF0F4',
                borderBottomWidth: 1,
                marginTop: 20, marginBottom: 5, marginLeft: '5%',
                width: '90%', maxHeight: 50,
                height: 30,
              }} placeholder={this.state.placeholder}
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
                width: convertWidth(80)
              }}
                onPress={this.props.cancel}
              >
                <Text style={{ fontWeight: '700', textAlign: 'center', color: '#C4C4C4' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{
                marginLeft: 5,
                padding: 4,
                width: convertWidth(80)
              }}
                onPress={() => this.props.done(this.state.textInput)}
              >
                <Text style={{ fontWeight: '700', textAlign: 'center', color: '#0060F2' }}>Done</Text>
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
      title: '',
      takePhotoButtonTitle: '',
      mediaType: 'mixed',
      noData: true,
    };
    ImagePicker.showImagePicker(options, (response) => {
      if (response.error || response.didCancel) {
        return;
      }
      let filepath = response.uri.replace('file://', '');
      let filename = response.fileName.substring(0, response.fileName.lastIndexOf('.'));
      let fileFormat = response.fileName.substring(response.fileName.lastIndexOf('.'));
      AppController.doCheckFileToIssue(filepath).then(asset => {
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
      }).catch(error => {
        console.log('choose file error:', error);
        this.setState({
          fileError: 'Error when checking file!',
        });
      });
    });
  }

  register() {
    AppController.doIssueFile(this.state.filepath, this.state.assetName, this.state.metadataList, parseInt(this.state.quantity), {
      indicator: true, title: 'Submitting your request to the network for confirmation…', message: ''
    }, {
        indicator: false, title: 'Issuance Successful!', message: 'Now you’ve created your property. Let’s verify that your property is showing up in your account.'
      }).then((data) => {
        if (data) {
          setTimeout(() => {
            if (this.props.navigation.state.params.refreshPropertiesScreen) {
              this.props.navigation.state.params.refreshPropertiesScreen();
              this.props.navigation.goBack();
            }
          }, 1000);
        }
      }).catch(error => {
        this.setState({ issueError: 'Issue file error!' });
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

  async checkMetadata(metadataList) {
    let error = await BitmarkService.doCheckMetadata();
    let metadataError = error ? 'METADATA is too long (2048-BYTE LIMIT)!' : '';
    let index = metadataList.findIndex((item) => ((!item.label && item.value) || (item.label && !item.value)));
    this.setState({
      metadataList,
      metadataError,
      canAddNewMetadata: (index < 0) && !metadataError,
      canIssue: (this.state.assetName && !this.state.assetNameError && this.state.quantity && !this.state.quantityError && !metadataError),
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
    if (isNaN(quantityNumber) || quantityNumber <= 0) {
      quantityError = 'Minimum quantity of one bitmark is required.';
    } else if (quantityNumber > 100) {
      quantityError = 'Maximum quantity of one bitmark is 100';
    }
    this.setState({
      quantity, quantityError,
      canIssue: (this.state.assetName && !this.state.assetNameError && quantity && !quantityError),
    });
  }

  render() {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={localAddPropertyStyle.body}>
          {!!this.state.selectedMetadata && <MetadataInputComponent
            cancel={() => this.setState({ selectedMetadata: null })}
            done={(text) => this.doneInputSelectedMetadata(text)}
            type={this.state.selectedMetadata.type}
            defaultValue={this.state.selectedMetadata.value}
          />}
          <View style={defaultStyle.header}>
            <TouchableOpacity style={defaultStyle.headerLeft} onPress={this.back}>
              <Image style={defaultStyle.headerLeftIcon} source={require('../../../../../assets/imgs/header_back_icon_study_setting.png')} />
            </TouchableOpacity>
            <Text style={defaultStyle.headerTitle}>Create Properties</Text>
            <TouchableOpacity style={defaultStyle.headerRight} />
          </View>

          <ScrollView style={localAddPropertyStyle.scroll}>
            <View style={localAddPropertyStyle.body}>
              {this.state.step === Steps.input_file && <View style={localAddPropertyStyle.addFileArea}>
                <Text style={localAddPropertyStyle.addFileLabel}>Upload Asset</Text>
                {!!this.state.fileError && <Text style={localAddPropertyStyle.fileInputError}>{this.state.fileError}</Text>}
                <TouchableOpacity style={localAddPropertyStyle.addFileButton} onPress={this.chooseFile}>
                  <Image style={localAddPropertyStyle.addFileIcon} source={require('../../../../../assets/imgs/plus-icon.png')} />
                  <Text style={localAddPropertyStyle.addFileButtonText}>ADD A FILE</Text>
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
                {!this.state.existingAsset && <TextInput
                  autoCorrect={false}
                  style={[localAddPropertyStyle.assetNameInput, {
                    color: this.state.existingAsset ? '#C2C2C2' : 'black',
                    borderBottomColor: this.stateNameError ? '#FF003C' : (this.state.existingAsset ? '#C2C2C2' : '#0060F2')
                  }]} placeholder="64-CHARACTER MAX"
                  onChangeText={this.doInputAssetName}
                  value={this.state.assetName}
                  numberOfLines={1}
                  editable={!this.state.existingAsset}
                  returnKeyType="done"
                  returnKeyLabel="Done"
                />}
                {this.state.existingAsset && <View style={localAddPropertyStyle.existAssetName}>
                  <Text style={[localAddPropertyStyle.existAssetNameText]}>{this.state.assetName}</Text>
                </View>}
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
                            borderBottomColor: item.labelError ? '#FF003C' : (this.state.existingAsset ? '#C2C2C2' : '#0060F2'),
                          }]}
                            disabled={this.state.existingAsset}
                            onPress={() => {
                              this.setState({ selectedMetadata: { key: item.key, type: 'label', value: item.label } });
                            }}
                          >
                            <Text style={[localAddPropertyStyle.metadataFieldLabel, {
                              color: (item.label && !this.state.existingAsset) ? 'black' : '#C2C2C2',
                            }]}
                              numberOfLines={1}
                            > {item.label || 'LABEL'} </Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={[localAddPropertyStyle.metadataFieldButton, {
                            borderBottomColor: item.valueError ? '#FF003C' : (this.state.existingAsset ? '#C2C2C2' : '#0060F2'),
                          }]}
                            disabled={this.state.existingAsset}
                            onPress={() => {
                              this.setState({ selectedMetadata: { key: item.key, type: 'description', value: item.value } });
                            }}
                          >
                            <Text style={[localAddPropertyStyle.metadataFieldValue, {
                              color: (item.value && !this.state.existingAsset) ? 'black' : '#C2C2C2',
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
                <Text style={[localAddPropertyStyle.issueButtonText, { color: this.state.canIssue ? '#0060F2' : '#C2C2C2' }]}>ISSUE</Text>
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
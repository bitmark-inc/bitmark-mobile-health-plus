import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, Image, TextInput, FlatList, TouchableWithoutFeedback,
  Platform,
  Keyboard,
} from 'react-native';

import { FullComponent } from './../../../../../commons/components';
import { convertWidth } from './../../../../../utils';
import { BitmarkService } from './../../../../../services';

import localAddPropertyStyle from './issue-file.component.style';
import { androidDefaultStyle, iosDefaultStyle } from './../../../../../commons/styles';
import { AppController } from '../../../../../managers';

let defaultStyle = Platform.select({
  ios: iosDefaultStyle,
  android: androidDefaultStyle
});
export class IssueFileComponent extends React.Component {
  constructor(props) {
    super(props);
    this.onIssueFile = this.onIssueFile.bind(this);
    this.doInputAssetName = this.doInputAssetName.bind(this);
    this.onChangeMetadataValue = this.onChangeMetadataValue.bind(this);
    this.onEndChangeMetadataValue = this.onEndChangeMetadataValue.bind(this);
    this.onEndChangeMetadataKey = this.onEndChangeMetadataKey.bind(this);
    this.addNewMetadataField = this.addNewMetadataField.bind(this);

    this.doInputQuantity = this.doInputQuantity.bind(this);

    if (!this.props.navigation.state || !this.props.navigation.state.params) {
      this.props.navigation.state = {
        params: {
          asset: {}, fingerprint: '', fileFormat: '', filePath: '', fileName: '',
        }
      }
    }
    let metadataList = [];
    let { asset, fingerprint, fileName, fileFormat, filePath } = this.props.navigation.state.params;
    let existingAsset = !!(asset && asset.name);
    if (existingAsset) {
      let key = 0;
      for (let label in asset.metadata) {
        metadataList.push({ key, label, value: asset.metadata[label] });
        key++;
      }
    }
    console.log('this.props.navigation.state.params :', this.props.navigation.state.params);
    this.state = {
      existingAsset,
      fingerprint,
      metadataList,
      filePath,
      fileName,
      fileFormat,
      fileError: '',
      assetName: asset ? asset.name : null,
      canAddNewMetadata: true,
      canIssue: false,
      quantity: null,
      selectedMetadata: null,
      isEditingMetadata: false,

      assetNameError: '',
      quantityError: '',
      metadataError: '',
      issueError: '',
    }
  }

  // ==========================================================================================
  // ==========================================================================================
  onIssueFile() {
    AppController.doIssueFile(this.state.filePath, this.state.assetName, this.state.metadataList, parseInt(this.state.quantity), {
      indicator: true, title: 'Submitting your request to the network for confirmation…', message: ''
    }, {
        indicator: false, title: 'Issuance Successful!', message: 'Now you’ve created your property. Let’s verify that your property is showing up in your account.'
      }).then((data) => {
        if (data !== null && this.props.screenProps.refreshPropertiesScreen) {
          this.props.screenProps.refreshPropertiesScreen();
          this.props.screenProps.addPropertyNavigation.goBack();
        }
      }).catch(error => {
        this.setState({ issueError: 'There was a problem issuing bitmarks. Please try again.' });
        console.log('issue bitmark error :', error);
      });
  }

  doInputAssetName(assetName) {
    this.checkIssuance(assetName, this.state.metadataList, this.state.quantity);
  }

  async checkIssuance(assetName, metadataList, quantity) {
    let assetNameError = '';
    if (typeof (assetName) === 'string') {
      if (assetName.length > 64) {
        assetNameError = 'You have exceeded the maximum number of characters in this field.';
      } else if (!assetName) {
        assetNameError = 'Please enter a property name.';
      }
    }
    let quantityError = '';
    if (typeof (quantity) === 'string') {
      quantity = quantity.replace(/[^0-9]/g, '');
      let quantityNumber = parseInt(quantity);
      if (isNaN(quantityNumber) || quantityNumber <= 0) {
        quantityError = 'You must create at least one bitmark. ';
      } else if (quantityNumber > 100) {
        quantityError = 'You cannot issue more than 100 bitmarks.';
      }
    }
    metadataList.forEach(item => {
      item.label = item.label.trim();
      item.value = item.value.trim();
    });
    let metadataError = await BitmarkService.doCheckMetadata(metadataList);
    let metadataFieldErrorIndex = metadataList.findIndex((item) => ((!item.label && item.value) || (item.label && !item.value)));
    let metadataFieldEmptyIndex = metadataList.findIndex((item) => (!item.label && !item.value));
    this.setState({
      assetName,
      assetNameError,
      quantity,
      quantityError,
      metadataList,
      metadataError,
      isEditingMetadata: metadataList.length === 0 ? false : this.state.isEditingMetadata,
      canAddNewMetadata: (metadataFieldErrorIndex < 0) && !metadataError && (metadataFieldEmptyIndex < 0),
      canIssue: (metadataFieldErrorIndex < 0 && !metadataError &&
        assetName && !assetNameError &&
        quantity && !quantityError),
    });
  }

  onChangeMetadataValue(key, value) {
    let metadataList = this.state.metadataList;
    for (let metadata of metadataList) {
      if (metadata.key === key) {
        metadata.value = value;
      }
    }
    this.setState({ metadataList });
  }
  onEndChangeMetadataValue() {
    this.checkIssuance(this.state.assetName, this.state.metadataList, this.state.quantity);
  }

  onEndChangeMetadataKey(key, label) {
    let metadataList = this.state.metadataList;
    for (let metadata of metadataList) {
      if (metadata.key === key) {
        metadata.label = label;
      }
    }
    this.checkIssuance(this.state.assetName, metadataList, this.state.quantity);
  }

  removeMetadata(key) {
    let metadataList = this.state.metadataList.filter((item) => item.key != key);
    this.checkIssuance(this.state.assetName, metadataList, this.state.quantity);
  }

  addNewMetadataField() {
    let metadataList = this.state.metadataList;
    metadataList.push({ key: metadataList.length, label: '', value: '' });
    this.checkIssuance(this.state.assetName, metadataList, this.state.quantity);
  }

  doInputQuantity(quantity) {
    this.checkIssuance(this.state.assetName, this.state.metadataList, quantity);
  }

  render() {
    return (
      <TouchableWithoutFeedback onPress={(event) => { event.stopPropagation(); Keyboard.dismiss(); }}>
        <FullComponent
          backgroundColor="white"
          ref={(ref) => this.fullRef = ref}
          header={(<View style={defaultStyle.header}>
            <TouchableOpacity style={defaultStyle.headerLeft} onPress={() => this.props.navigation.goBack()}>
              <Image style={defaultStyle.headerLeftIcon} source={require('../../../../../../assets/imgs/header_blue_icon.png')} />
            </TouchableOpacity>
            <Text style={defaultStyle.headerTitle}>{'Create Properties'.toUpperCase()}</Text>
            <TouchableOpacity style={defaultStyle.headerRight} />
          </View>)}
          contentInScroll={true}
          content={(<TouchableOpacity activeOpacity={1} style={localAddPropertyStyle.body}>
            <View style={localAddPropertyStyle.infoArea}>
              <Text style={localAddPropertyStyle.fingerprintLabel}>{'Asset Fingerprint'.toUpperCase()}</Text>
              <Text style={localAddPropertyStyle.fingerprintValue} numberOfLines={1} >{this.state.fingerprint}</Text>
              <View style={localAddPropertyStyle.fingerprintInfoArea}>
                <Text style={localAddPropertyStyle.fingerprintInfoMessage}>GENERATED FROM </Text>
                <Text style={localAddPropertyStyle.fingerprintInfoFilename} numberOfLines={1} >{this.state.fileName}</Text>
                <Text style={localAddPropertyStyle.fingerprintInfoFileFormat}>{this.state.fileFormat}</Text>
              </View>
              <Text style={localAddPropertyStyle.assetNameLabel}>PROPERTY NAME</Text>
              {!this.state.existingAsset && <TextInput
                ref={(ref) => this.assetNameInputRef = ref}
                style={[localAddPropertyStyle.assetNameInput, {
                  color: this.state.existingAsset ? '#C2C2C2' : 'black',
                  borderBottomColor: this.state.assetNameError ? '#FF003C' : (this.state.existingAsset ? '#C2C2C2' : '#0060F2')
                }]} placeholder="64-CHARACTER MAX"
                onChangeText={this.doInputAssetName}
                numberOfLines={1}
                editable={!this.state.existingAsset}
                returnKeyType="done"
                returnKeyLabel="Done"
                onFocus={() => this.fullRef.setForcusElement(this.assetNameInputRef)}
              />}
              {!!this.state.assetNameError && <Text style={localAddPropertyStyle.assetNameInputError}>{this.state.assetNameError}</Text>}

              {this.state.existingAsset && <View style={localAddPropertyStyle.existAssetName}>
                <Text style={[localAddPropertyStyle.existAssetNameText]}>{this.state.assetName}</Text>
              </View>}

              <Text style={localAddPropertyStyle.metadataLabel}>METADATA</Text>
              <Text style={localAddPropertyStyle.metadataDescription}>OPTIONAL PROPERTY METADATA (2048-BYTE LIMIT)</Text>
              <View style={localAddPropertyStyle.metadataArea}>
                <FlatList style={localAddPropertyStyle.metadataList}
                  data={this.state.metadataList}
                  extraData={this.state}
                  renderItem={({ item }) => {
                    return (
                      <View style={localAddPropertyStyle.metadataField}>
                        {!this.state.existingAsset && this.state.isEditingMetadata && <TouchableOpacity style={localAddPropertyStyle.metadataFieldKeyRemoveButton} onPress={() => this.removeMetadata(item.key)}>
                          <Image style={localAddPropertyStyle.metadataFieldKeyRemoveIcon} source={require('./../../../../../../assets/imgs/remove-icon-red.png')} />
                        </TouchableOpacity>}
                        <View style={[localAddPropertyStyle.metadataFieldInfo, { width: convertWidth(this.state.isEditingMetadata ? 322 : 337) }]}>
                          <TouchableOpacity style={[localAddPropertyStyle.metadataFieldKeyArea, {
                            borderBottomColor: item.labelError ? '#FF003C' : (this.state.existingAsset ? '#C2C2C2' : '#0060F2')
                          }]}
                            disabled={this.state.existingAsset}
                            onPress={() => {
                              this.props.navigation.navigate('EditLabel', {
                                label: item.label,
                                key: item.key,
                                onEndChangeMetadataKey: this.onEndChangeMetadataKey
                              });
                              this.setState({ isEditingMetadata: false });
                            }}
                          >
                            <Text style={[localAddPropertyStyle.metadataFieldKeyText, {
                              color: (item.label && !this.state.existingAsset) ? 'black' : '#C1C1C1',
                              width: convertWidth(this.state.isEditingMetadata ? 286 : 302),
                            }]}>{item.label || 'LABEL'}</Text>
                            {!this.state.existingAsset && <Image style={localAddPropertyStyle.metadataFieldKeyEditIcon}
                              source={require('./../../../../../../assets/imgs/next-icon-blue.png')} />}
                          </TouchableOpacity>
                          <TextInput style={[localAddPropertyStyle.metadataFieldValue, {
                            color: (item.label && !this.state.existingAsset) ? 'black' : '#C1C1C1',
                          }]} placeholder='DESCRIPTION'
                            ref={(ref) => this['valueInput_' + item.key] = ref}
                            multiline={true}
                            value={item.value}
                            onChangeText={(text) => this.onChangeMetadataValue(item.key, text)}
                            onEndEditing={this.onEndChangeMetadataValue}
                            returnKeyLabel="done"
                            returnKeyType="done"
                            blurOnSubmit={true}
                            editable={!this.state.existingAsset}
                            onFocus={() => {
                              this.fullRef.setForcusElement(this['valueInput_' + item.key]);
                              this.setState({ isEditingMetadata: false });
                            }}
                          />
                          <View style={[localAddPropertyStyle.metadataFieldValueBar, {
                            borderBottomColor: item.valueError ? '#FF003C' : (this.state.existingAsset ? '#C2C2C2' : '#0060F2')
                          }]} />
                        </View>
                      </View>
                    )
                  }}
                />
              </View>
              {!this.state.existingAsset && <View style={localAddPropertyStyle.metadataFieldButtons}>
                <TouchableOpacity style={localAddPropertyStyle.addMetadataButton} disabled={!this.state.canAddNewMetadata} onPress={this.addNewMetadataField}>
                  <Image style={localAddPropertyStyle.addMetadataButtonIcon} source={
                    this.state.canAddNewMetadata ? require('./../../../../../../assets/imgs/plus-white-blue-icon.png') : require('./../../../../../../assets/imgs/plus-white-blue-icon-disable.png')} />
                  <Text style={[localAddPropertyStyle.addMetadataButtonText, { color: this.state.canAddNewMetadata ? '#0060F2' : '#C2C2C2' }]}> ADD LABEL</Text>
                </TouchableOpacity>

                {this.state.isEditingMetadata && <TouchableOpacity style={[localAddPropertyStyle.addMetadataButton]} onPress={() => this.setState({ isEditingMetadata: false })}>
                  <Text style={[localAddPropertyStyle.addMetadataButtonText, { color: '#0060F2' }]}>DONE</Text>
                </TouchableOpacity>}
                {!this.state.isEditingMetadata && this.state.metadataList.length > 0 && <TouchableOpacity style={[localAddPropertyStyle.addMetadataButton]} onPress={() => this.setState({ isEditingMetadata: true })}>
                  <Text style={[localAddPropertyStyle.addMetadataButtonText, { color: this.state.isEditingMetadata ? '#C2C2C2' : '#0060F2' }]}>EDIT</Text>
                </TouchableOpacity>}
              </View>}
              {!!this.state.metadataError && <Text style={localAddPropertyStyle.metadataInputError}>{this.state.metadataError}</Text>}

              <Text style={localAddPropertyStyle.quantityLabel}>{'number of bitmarks TO ISSUE'.toUpperCase()}</Text>
              <TextInput
                ref={(ref) => this.quantityInputRef = ref}
                style={[localAddPropertyStyle.quantityInput, {
                  borderBottomColor: this.state.quantityError ? '#FF003C' : '#0060F2'
                }]} placeholder="1 ~ 100"
                onChangeText={this.doInputQuantity}
                keyboardType={'numeric'}
                returnKeyType="done"
                returnKeyLabel="Done"
                onFocus={() => this.fullRef.setForcusElement(this.quantityInputRef)}
              />
              {!!this.state.quantityError && <Text style={localAddPropertyStyle.quantityInputError}>{this.state.quantityError}</Text>}
              <Text style={localAddPropertyStyle.ownershipClaimLabel}>{'Ownership claim'.toUpperCase()}</Text>
              <Text style={localAddPropertyStyle.ownershipClaimMessage}>{'“I hereby claim that I am the legal owner of this asset and want these property to be irrevocably issued and recorded in the Bitmark blockchain.”'}</Text>
              {!!this.state.issueError && <Text style={localAddPropertyStyle.issueError}>{this.state.issueError}</Text>}
              <TouchableOpacity
                style={[localAddPropertyStyle.issueButton, { borderTopColor: this.state.canIssue ? '#0060F2' : '#C2C2C2' }]}
                onPress={this.onIssueFile}
                disabled={!this.state.canIssue}
              >
                <Text style={[localAddPropertyStyle.issueButtonText, { color: this.state.canIssue ? '#0060F2' : '#C2C2C2' }]}>ISSUE</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>)}
        />
      </TouchableWithoutFeedback>
    );
  }
}

IssueFileComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.shape({
        asset: PropTypes.object,
        fileName: PropTypes.string,
        fileFormat: PropTypes.string,
        filePath: PropTypes.string,
        fingerprint: PropTypes.string,
      }),
    }),
  }),
  screenProps: PropTypes.shape({
    addPropertyNavigation: PropTypes.shape({
      goBack: PropTypes.func,
    }),
    refreshPropertiesScreen: PropTypes.func,
  }),
};
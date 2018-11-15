import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactNative, {
  StyleSheet, Alert, Linking,
  Image, View, TouchableOpacity, Text, SafeAreaView,
} from 'react-native';
let { ActionSheetIOS } = ReactNative;
import moment from 'moment';

import { Provider, connect } from 'react-redux';
import randomString from 'random-string';

import ImagePicker from 'react-native-image-crop-picker';
// import ImagePicker from 'react-native-image-picker';
import { DocumentPicker } from 'react-native-document-picker';
import {
  FileUtil,
  convertWidth, issue,
  populateAssetNameFromImage, populateAssetNameFromPdf, generateThumbnail, isImageFile, isPdfFile,
  checkThumbnailForBitmark, initializeIndexedDB, insertDetectedDataToIndexedDB, isAssetDataRecord, searchIndexedBitmarks
} from './../../utils';
import { config } from '../../configs';
import { constants } from '../../constants';
import { DataProcessor, AppProcessor } from './../../processors';
import { Actions } from 'react-native-router-flux';
import { EventEmitterService } from '../../services';
import { UserBitmarksStore } from '../../stores';
import { SearchInputComponent } from "./search-input.component";
import { MaterialIndicator } from "react-native-indicators";
import { SearchResultsComponent } from "./search-results.component";

class PrivateUserComponent extends Component {
  static propTypes = {
    healthDataBitmarks: PropTypes.array,
    healthAssetBitmarks: PropTypes.array,
  };
  constructor(props) {
    super(props);
    this.doIssueImage = this.doIssueImage.bind(this);
    this.updateSearch = this.updateSearch.bind(this);

    this.state = {
      searchResults: {}
    }
  }

  addRecord() {
    ActionSheetIOS.showActionSheetWithOptions({
      options: [i18n.t('UserComponent_actionSheetOption1'), i18n.t('UserComponent_actionSheetOption2'), i18n.t('UserComponent_actionSheetOption3'), i18n.t('UserComponent_actionSheetOption4')],
      title: i18n.t('UserComponent_pickerTitle'),
      cancelButtonIndex: 0,
    },
      (buttonIndex) => {
        if (buttonIndex === 1) {
          this.onTakePhoto();
        } else if (buttonIndex === 2) {
          this.onChooseFromLibrary();
        } else if (buttonIndex === 3) {
          this.onChooseFile();
        }
      });
  }

  doIssueImage(images, combineFilesList) {
    console.log('doIssueImage :', images, combineFilesList);
    //check existing assets
    let mapFileAssets = {};
    let doCheckExistingAsset = async () => {
      for (let imageInfo of images) {
        let filePath = imageInfo.uri.replace('file://', '');
        let { asset } = await AppProcessor.doCheckFileToIssue(filePath);
        if (asset && asset.name && !asset.canIssue) {
          let message = asset.registrant === DataProcessor.getUserInformation().bitmarkAccountNumber
            ? i18n.t('CaptureAssetComponent_alertMessage11', { type: 'image' })
            : i18n.t('CaptureAssetComponent_alertMessage12', { type: 'image' });
          return message;
        }
        mapFileAssets[filePath] = asset;
      }
    };
    // issue images
    let doIssuance = async () => {
      let listAssetName = [];
      let listInfo = [];
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESSING, true);
      for (let imageInfo of images) {
        let filePath = imageInfo.uri.replace('file://', '');
        let asset = mapFileAssets[filePath];
        let assetName, metadataList;
        if (asset && asset.name) {
          assetName = asset.name;
          metadataList = [];
          for (let label in asset.metadata) {
            metadataList.push({ label, value: asset.metadata[label] });
          }
        } else {
          assetName = `HA${randomString({ length: 8, numeric: true, letters: false, })}`;
          metadataList = [];
          metadataList.push({ label: 'Source', value: 'Health Records' });
          metadataList.push({ label: 'Saved Time', value: moment(imageInfo.createdAt).toDate().toISOString() });
        }



        let detectedTexts;
        let detectResult;
        if (combineFilesList && combineFilesList.length) {
          // In the case of combined file. "images" array only has one file path (combined PDF file)
          // Take the first image from combineFilesList to detect asset name
          let inCombineAssetNames = [];
          let inCombineDetectedTexts = [];
          for (let i = 0; i < combineFilesList.length; i++) {
            let inCombineDetectResult = await populateAssetNameFromImage(combineFilesList[i].uri, assetName);
            inCombineAssetNames.push(inCombineDetectResult.assetName);
            inCombineDetectedTexts = inCombineDetectedTexts.concat(inCombineDetectResult.detectedTexts);
          }

          assetName = inCombineAssetNames[0];
          detectedTexts = inCombineDetectedTexts;
        } else {
          detectResult = await populateAssetNameFromImage(filePath, assetName);
          assetName = detectResult.assetName;
          detectedTexts = detectResult.detectedTexts;
        }

        if (assetName.length > 64) assetName = assetName.substring(0, 64);

        listInfo.push({
          filePath, assetName, metadataList, detectedTexts, quantity: 1, isPublicAsset: false,
        });

        listAssetName.push(assetName);
      }
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESSING, false);

      let bitmarks = await AppProcessor.doIssueMultipleFiles(listInfo, {
        indicator: true, title: i18n.t('CaptureAssetComponent_title'), message: ''
      });

      if (bitmarks) {
        for (let i = 0; i < listInfo.length; i++) {
          await generateThumbnail(listInfo[i].filePath, bitmarks[i].id, !!combineFilesList);
          await insertDetectedDataToIndexedDB(bitmarks[i].id, listInfo[i].assetName, listInfo[i].metadataList, listInfo[i].detectedTexts);
          FileUtil.removeSafe(listInfo[i].filePath);
        }
        return listAssetName;
      }
      return null;
    };
    doCheckExistingAsset().then(message => {
      if (message) {
        Alert.alert('', message, [{
          text: i18n.t('CaptureAssetComponent_alertButton1'), style: 'cancel'
        }]);
      } else {
        doIssuance().then((listAssetName) => {
          console.log('listAssetName :', listAssetName);
          if (listAssetName) {
            Actions.assetNameInform({ assetNames: listAssetName });
          }
        }).catch(error => {
          EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
        });
      }
    }).catch(error => {
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
    });
  }

  onTakePhoto() {
    // Actions.orderCombineImages();
    Actions.captureMultipleImages({ doIssueImage: this.doIssueImage });

    // ImagePicker.launchCamera({}, (response) => {
    //   this.processOnChooseImage(response);
    // });
  }

  onChooseFromLibrary() {

    ImagePicker.openPicker({
      multiple: true,
      maxFiles: 0,
      mediaType: 'photo',
      compressImageQuality: 1,
    }).then(results => {
      let images = [];
      for (let image of results) {
        let createdAt = new Date(parseInt(image.creationDate)).toISOString();
        images.push({ uri: image.path, createdAt });
      }
      if (images.length === 1) {
        this.doIssueImage(images);
      } else {
        Actions.recordImages({ images, doIssueImage: this.doIssueImage });
      }
    });

    // ImagePicker.launchImageLibrary({}, (response) => {
    //   this.processOnChooseImage(response);
    // });
  }

  async processOnChooseImage(response) {
    if (response.error) {
      Alert.alert(i18n.t('UserComponent_alertTitle1'), response.error + '.', [{
        text: i18n.t('UserComponent_alertButton11'),
        onPress: () => Linking.openURL('app-settings:')
      }, {
        text: i18n.t('UserComponent_alertButton12'),
        style: 'cancel',
      }]);
      return;
    }

    let info = await this.prepareToIssue(response);

    Actions.captureAsset(info);
  }

  onChooseFile() {
    DocumentPicker.show({
      filetype: ["public.item"],
    }, async (error, response) => {
      if (error) {
        return;
      }

      if (response.fileSize > constants.ISSUE_FILE_SIZE_LIMIT_IN_MB * 1024 * 1024) {
        Alert.alert('Error', i18n.t('UserComponent_maxFileSize', { size: constants.ISSUE_FILE_SIZE_LIMIT_IN_MB }));
        return;
      }

      let info = await this.prepareToIssue(response, 'chooseFile');

      let filePath = info.filePath;
      let assetName = response.fileName;
      let detectedTexts;

      let willDetectAssetNameAutomatically = false;
      if (isPdfFile(filePath)) {
        willDetectAssetNameAutomatically = true;
        EventEmitterService.emit(EventEmitterService.events.APP_PROCESSING, true);
        let detectResult = await populateAssetNameFromPdf(filePath, assetName);
        assetName = detectResult.assetName;
        detectedTexts = detectResult.detectedTexts;
        EventEmitterService.emit(EventEmitterService.events.APP_PROCESSING, false);
      } else if (isImageFile(filePath)) {
        willDetectAssetNameAutomatically = true;
        EventEmitterService.emit(EventEmitterService.events.APP_PROCESSING, true);
        let detectResult = await populateAssetNameFromImage(filePath, assetName);
        assetName = detectResult.assetName;
        detectedTexts = detectResult.detectedTexts;
        EventEmitterService.emit(EventEmitterService.events.APP_PROCESSING, false);
      }

      let metadataList = [];
      metadataList.push({ label: 'Source', value: 'Medical Records' });
      metadataList.push({ label: 'Saved Time', value: new Date(info.timestamp).toISOString() });

      issue(filePath, assetName, metadataList, 'file', 1, async (data) => {
        let bitmarkId = data[0].id;
        let isMultipleAsset = false;
        await generateThumbnail(filePath, bitmarkId, isMultipleAsset);
        await insertDetectedDataToIndexedDB(bitmarkId, assetName, metadataList, detectedTexts);

        if (willDetectAssetNameAutomatically) {
          Actions.assetNameInform({ assetNames: [assetName] });
        } else {
          Actions.pop();
        }
      });
    });
  }

  async prepareToIssue(response, type) {
    let filePath = response.uri.replace('file://', '');
    filePath = decodeURIComponent(filePath);


    let timestamp;
    if (type === 'chooseFile') {
      let stat = await FileUtil.stat(filePath);
      timestamp = stat.mtime || stat.ctime;
    } else {
      timestamp = response.timestamp ? response.timestamp : new Date().toISOString();
    }

    // Move file from "tmp" folder to "cache" folder
    let fileName = response.fileName ? response.fileName : response.uri.substring(response.uri.lastIndexOf('/') + 1);
    let destPath = FileUtil.CacheDirectory + '/' + DataProcessor.getUserInformation().bitmarkAccountNumber + '/' + fileName;
    await FileUtil.moveFileSafe(filePath, destPath);
    filePath = destPath;

    return { filePath, timestamp };
  }

  // backToUserAccount() {
  //   AppProcessor.doSelectAccountAccess(DataProcessor.getUserInformation().bitmarkAccountNumber).then(result => {
  //     if (result) {
  //       Actions.reset('user');
  //     }
  //   }).catch(error => {
  //     EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
  //   });
  // }

  async updateSearch(searchTerm) {
    console.log('searchTerm:', searchTerm);
    let searchResults = { length: 0, healthDataBitmarks: [], healthAssetBitmarks: [] };
    if (searchTerm) {
      let queryResult = await searchIndexedBitmarks(searchTerm);
      let searchResultBitmarkIds = queryResult.bitmarkIds;
      let tagRecords = queryResult.tagRecords;

      if (searchResultBitmarkIds.length) {
        let allBitmarks = this.props.healthDataBitmarks.concat(this.props.healthAssetBitmarks);
        let allBitmarksMap = {};
        allBitmarks.forEach(bitmark => allBitmarksMap[bitmark.id] = bitmark);

        let tagRecordsMap = {};
        tagRecords.forEach(tagRecord => tagRecordsMap[tagRecord.bitmarkId] = tagRecord);

        for (let i = 0; i < searchResultBitmarkIds.length; i++) {
          let bitmark = allBitmarksMap[searchResultBitmarkIds[i]];

          if (bitmark) {
            if (isAssetDataRecord(bitmark)) {
              if (!bitmark.thumbnail) {
                bitmark.thumbnail = await checkThumbnailForBitmark(bitmark.id);
              }

              if (tagRecordsMap[bitmark.id]) {
                // Augment tag info
                let searchTermParts = searchTerm.split(' ');
                let tagsStr = tagRecordsMap[bitmark.id].tags;
                let tags = tagsStr.split(' ');

                tags = tags.filter((tag) => {
                  let matched = false;
                  for (let index = 0; index < searchTermParts.length; index++) {
                    if (tag.startsWith(searchTermParts[index])) {
                      matched = true;
                      break;
                    }
                  }
                  return matched;
                });

                bitmark.tags = tags.map((item) => {return {value: item}});
              }

              searchResults.healthAssetBitmarks.push(bitmark);
            } else {
              searchResults.healthDataBitmarks.push(bitmark);
            }
          }
        }
      }
    }

    searchResults.length = searchResults.healthDataBitmarks.length + searchResults.healthAssetBitmarks.length;
    // searchResults.length = 0;
    console.log('searchResults:', searchResults);

    this.setState({
      searchResults,
      isSearching: false
    })
  }

  render() {
    // let accountNumberDisplay = DataProcessor.getAccountAccessSelected() || DataProcessor.getUserInformation().bitmarkAccountNumber;
    let accountNumberDisplay = DataProcessor.getUserInformation().bitmarkAccountNumber;
    let isCurrentUser = accountNumberDisplay === DataProcessor.getUserInformation().bitmarkAccountNumber;

    return (
      <View style={{ flex: 1, }}>
        {/* {!isCurrentUser && <TouchableOpacity style={styles.accountNumberDisplayArea} onPress={this.backToUserAccount.bind(this)}>
          <Text style={styles.accountNumberDisplayText}>
            {i18n.t('UserComponent_accountNumberDisplayText', { accountNumber: '[' + accountNumberDisplay.substring(0, 4) + '...' + accountNumberDisplay.substring(accountNumberDisplay.length - 4, accountNumberDisplay.length) + ']' })}
          </Text>
        </TouchableOpacity>} */}
        <SafeAreaView style={[styles.bodySafeView,]}>
          {/*SEARCH AREA*/}
          <View style={[styles.searchArea, (this.state.searchTerm ? { flex: 1 } : {})]}>
            <SearchInputComponent
              throttle={300}
              onSearchTermChange={(searchTerm) => {
                this.setState({
                  isSearching: true,
                  searchTerm
                });

                this.updateSearch(searchTerm);
              }}
              style={styles.searchInput}
              placeholder={global.i18n.t("UserComponent_search")}>
            </SearchInputComponent>

            {this.state.isSearching && <View style={styles.indicatorContainer}>
              <MaterialIndicator style={styles.indicator} color={'#C4C4C4'} size={16} />
              <Text>{global.i18n.t("UserComponent_searching")}</Text>
            </View>
            }
            {(this.state.searchTerm && !this.state.isSearching) ? <SearchResultsComponent style={styles.searchResultsContainer} results={this.state.searchResults} /> : null}
          </View>

          {/*DATA PANEL*/}
          {!this.state.searchTerm && <View style={styles.body}>
            <View style={[styles.bodyContent, isCurrentUser ? {} : { borderBottomWidth: 1 }]}>
              <View style={styles.dataArea}>
                <TouchableOpacity style={{ flex: 1 }} onPress={() => {

                  if (isCurrentUser && !DataProcessor.getUserInformation().activeHealthData) {
                    Actions.getStart();
                  } else {
                    Actions.bitmarkList({ bitmarkType: 'bitmark_health_data' });
                  }
                }}>
                  <Text style={styles.dataTitle}><Text style={{ color: '#FF1829' }}>{this.props.healthDataBitmarks.length} </Text>
                    {i18n.t('UserComponent_dataTitle1', { s: this.props.healthDataBitmarks.length !== 1 ? 's' : '' })}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.dataArea, { borderTopColor: '#FF1829', borderTopWidth: 1, paddingBottom: convertWidth(60), }]}>
                <TouchableOpacity style={{ flex: 1 }} onPress={() => {
                  if (this.props.healthAssetBitmarks.length === 0) {
                    Actions.addRecord({ addRecord: this.addRecord.bind(this) });
                  } else {
                    Actions.bitmarkList({ bitmarkType: 'bitmark_health_issuance' });
                  }
                }}>
                  <Text style={styles.dataTitle}><Text style={{ color: '#FF1829' }}>{this.props.healthAssetBitmarks.length} </Text>
                    {i18n.t('UserComponent_dataTitle2', { s: this.props.healthAssetBitmarks.length !== 1 ? 's' : '' })}
                  </Text>
                </TouchableOpacity>
                {isCurrentUser && <TouchableOpacity style={styles.addHealthRecordButton} onPress={this.addRecord.bind(this)}>
                  <Image style={styles.addHealthRecordButtonIcon} source={require('./../../../assets/imgs/plus_icon_red.png')} />
                  <Text style={styles.addHealthRecordButtonText}> {i18n.t('UserComponent_addHealthRecordButtonText').toUpperCase()}</Text>
                </TouchableOpacity>}
              </View>
            </View>

            {isCurrentUser && <View style={[styles.accountArea]}>
              <TouchableOpacity style={styles.accountButton} onPress={Actions.account}>
                <Text style={styles.accountButtonText}>
                  {i18n.t('UserComponent_accountButtonText1')}
                </Text>
              </TouchableOpacity>
            </View>}
          </View>
          }
        </SafeAreaView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  // accountNumberDisplayArea: {
  //   position: 'absolute',
  //   top: 0,
  //   width: '100%',
  //   height: convertWidth(32) + (config.isIPhoneX ? constants.iPhoneXStatusBarHeight : 0),
  //   paddingTop: (config.isIPhoneX ? constants.iPhoneXStatusBarHeight : 0),
  //   backgroundColor: '#E6FF00',
  //   zIndex: 10,
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   justifyContent: 'center',
  // },
  // accountNumberDisplayText: {
  //   fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Avenir Heavy',
  //   fontWeight: '800',
  //   fontSize: 14,
  // },
  bodySafeView: {
    flex: 1,
    backgroundColor: 'white',
  },
  searchArea: {
    paddingTop: convertWidth(16) + (config.isIPhoneX ? constants.iPhoneXStatusBarHeight : 0)
  },
  searchInput: {
    paddingLeft: convertWidth(16),
    paddingRight: convertWidth(16),
    paddingBottom: convertWidth(14)
  },
  searchResultsContainer: {
    paddingLeft: convertWidth(8),
    paddingRight: convertWidth(8),
    backgroundColor: '#F5F5F5',
    flex: 1,
  },
  indicatorContainer: {
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: '#F5F5F5',
    flex: 1,
  },
  indicator: {
    flex: 0,
    marginRight: 8,
  },
  body: {
    padding: convertWidth(16),
    // paddingTop: convertWidth(16) + (config.isIPhoneX ? constants.iPhoneXStatusBarHeight : 0),
    paddingTop: 0,
    flex: 1,
  },
  bodyContent: {
    flex: 1,
    flexDirection: 'column',
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: '#FF4444',
    width: "100%"
  },

  dataArea: {
    flex: 1,
    width: '100%',
    padding: convertWidth(20),
  },
  dataTitle: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Avenir Black',
    fontWeight: '900',
    fontSize: 36,
  },
  addHealthRecordButton: {
    position: 'absolute',
    left: convertWidth(16),
    bottom: convertWidth(15),
    padding: convertWidth(4),
    flexDirection: 'row',
    alignItems: 'center',
  },
  addHealthRecordButtonIcon: {
    width: 12,
    height: 12,
    resizeMode: 'contain',
  },
  addHealthRecordButtonText: {
    marginLeft: convertWidth(6),
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Avenir Medium',
    fontWeight: '300',
    fontSize: 16,
  },
  accountArea: {
    width: '100%', height: 45,
    borderColor: '#FF1829', borderTopWidth: 1, borderWidth: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
  },
  accountButtonText: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Avenir Medium',
    fontWeight: '300',
    fontSize: 16,
    color: '#FF1F1F'
  }

});

const StoreUserComponent = connect(
  (state) => state.data,
)(PrivateUserComponent);

export class UserComponent extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <View style={{ flex: 1 }}>
        <Provider store={UserBitmarksStore}>
          <StoreUserComponent />
        </Provider>
      </View>
    );
  }
}
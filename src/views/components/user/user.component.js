import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactNative, {
  StyleSheet, Alert,
  Image, View, TouchableOpacity, Text, SafeAreaView, ScrollView,
} from 'react-native';
let { ActionSheetIOS } = ReactNative;
import moment from 'moment';

import { Provider, connect } from 'react-redux';

import ImagePicker from 'react-native-image-crop-picker';
import { Actions } from 'react-native-router-flux';
import { MaterialIndicator } from "react-native-indicators";

import { DocumentPicker } from 'react-native-document-picker';
import {
  FileUtil,
  convertWidth,
  isHealthDataRecord,
  bitmarkSortFunction,
} from 'src/utils';
import { constants, config } from 'src/configs';

import { SearchInputComponent } from './search-input.component';
import { SearchResultsComponent } from './search-results.component';
import { AppProcessor, EventEmitterService, CacheData, DataProcessor } from 'src/processors';
import { UserBitmarksStore, UserBitmarksActions } from 'src/views/stores';
import { search, issue } from 'src/views/controllers';
import { GetStartedFeedCardComponent } from "./card/get-started-feed-card.component";
import { HealthDataFeedCardComponent } from "./card/health-data-feed-card.component";
import { MedicalRecordFeedCardComponent } from "./card/medical-record-feed-card.component";
import { EMRCardComponent } from './emr';
import { AddRecordOptionsComponent } from "./add-record-options.component";
import { DailyHealthDataFeedCardComponent } from "./card/daily-health-data-feed-card.component";

import randomString from 'random-string';

const STICK_CARD_TYPES = {
  GET_STARTED_EMR: 0,
  GET_STARTED_MEDICAL_RECORD: 1,
  GET_STARTED_HEALTH_DATA: 2,
  EMR: 3,
  MEDICAL_RECORD: 4,
  HEALTH_DATA: 5,
  DAILY_HEALTH_DATA: 6
};


class PrivateUserComponent extends Component {
  static propTypes = {
    healthDataBitmarks: PropTypes.array,
    healthAssetBitmarks: PropTypes.array,
    dailyHealthDataBitmarks: PropTypes.array,
    searchTerm: PropTypes.string,
    searchResults: PropTypes.object,
    emrInformation: PropTypes.object,
  };
  constructor(props) {
    super(props);
    this.doIssueImage = this.doIssueImage.bind(this);
    this.doIssue = this.doIssue.bind(this);
    this.updateSearch = this.updateSearch.bind(this);

    this.state = {
      stickCardType: STICK_CARD_TYPES.GET_STARTED_EMR,
      showAddRecordOptions: false
    };
  }

  goBack() {
    this.resetToInitialState();
    Actions.popTo('user');
  }

  finishIssuing() {
    this.resetToInitialState();
    DataProcessor.doGetUserDataBitmarks().then(() => {
      Actions.popTo('user');
    });
  }

  goToBitmarkDetail(bitmarkId) {
    DataProcessor.doGetUserDataBitmarks().then(userBitmarks => {
      console.log('userBitmarks :', bitmarkId, userBitmarks);
      let allBitmarks = userBitmarks ? (userBitmarks.healthAssetBitmarks || []).concat(userBitmarks.healthDataBitmarks || []) : [];
      let bitmark = allBitmarks.find(item => item.id == bitmarkId);
      if (bitmark) {
        Actions.bitmarkDetail({ bitmark, bitmarkType: isHealthDataRecord(bitmark.asset) ? 'bitmark_health_data' : 'bitmark_health_issuance', goBack: this.goBack.bind(this) });
      }
    });
  }

  resetToInitialState() {
    this.setState({
      stickCardType: STICK_CARD_TYPES.GET_STARTED_EMR,
      showAddRecordOptions: false
    });
  }

  showAddRecordOptions() {
    this.setState({ showAddRecordOptions: true });
  }

  hideAddRecordOptions() {
    this.setState({ showAddRecordOptions: false });
  }

  takePhoto() {
    this.hideAddRecordOptions();
    this.onTakePhoto();
  }

  importRecord() {
    this.hideAddRecordOptions();
    ActionSheetIOS.showActionSheetWithOptions({
      options: [i18n.t('UserComponent_actionSheetOption1'), i18n.t('UserComponent_actionSheetOption3'), i18n.t('UserComponent_actionSheetOption4')],
      title: 'Import records',
      cancelButtonIndex: 0,
    },
      (buttonIndex) => {
        if (buttonIndex === 1) {
          this.onChooseFromLibrary();
        } else if (buttonIndex === 2) {
          this.onChooseFile();
        }
      });
  }

  doIssueImage(images, isMultipleAsset = false) {
    console.log('doIssueImage :', images);
    //check existing assets
    if (!CacheData.networkStatus) {
      AppProcessor.showOfflineMessage();
      return;
    }
    let mapFileAssets = {};
    let doCheckExistingAsset = async () => {
      for (let imageInfo of images) {
        let filePath = imageInfo.uri.replace('file://', '');
        let result = await AppProcessor.doCheckFileToIssue(filePath);
        if (result && result.asset && result.asset.name && !result.asset.canIssue) {
          let message = result.asset.registrant === CacheData.userInformation.bitmarkAccountNumber
            ? i18n.t('CaptureAssetComponent_alertMessage11', { type: 'image' })
            : i18n.t('CaptureAssetComponent_alertMessage12', { type: 'image' });
          return message;
        }
        mapFileAssets[filePath] = result ? result.asset : null;
      }
    };
    // issue images
    let doIssuance = async () => {
      let listAssetName = [];
      let listInfo = [];

      // Prepare data
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
          assetName = `HR${moment().format('YYYYMMMDDHHmmss')}`.toUpperCase();
          metadataList = [];
          metadataList.push({ label: 'Type', value: 'Health' });
          metadataList.push({ label: 'Source', value: 'Medical Records' });
          metadataList.push({ label: 'Collection Date', value: moment(imageInfo.createdAt).toDate().toISOString() });

          if (imageInfo.numberOfFiles) {
            metadataList.push({ label: 'Number Of Files', value: imageInfo.numberOfFiles.toString() });
          }
        }
        if (assetName.length > 64) assetName = assetName.substring(0, 64);
        listInfo.push({
          filePath, assetName, metadataList, quantity: 1, isPublicAsset: false, isMultipleAsset, name: imageInfo.name, note: imageInfo.note, tags: imageInfo.tags
        });

        listAssetName.push(assetName);
      }

      // Issue
      let bitmarks = await AppProcessor.doIssueMultipleFiles(listInfo, {
        indicator: true, title: i18n.t('CaptureAssetComponent_title'), message: ''
      });

      if (bitmarks) {
        for (let i = 0; i < listInfo.length; i++) {
          FileUtil.removeSafe(listInfo[i].filePath);
        }
        return bitmarks;
      }
      return null;
    };
    doCheckExistingAsset().then(message => {
      console.log('doCheckExistingAsset :', { message });
      if (message) {
        Alert.alert('', message, [{
          text: i18n.t('CaptureAssetComponent_alertButton1'), style: 'cancel'
        }]);
      } else {
        doIssuance().then((issuedBitmarks) => {
          if (issuedBitmarks) {
            console.log({ issuedBitmarks });
            this.finishIssuing();
          }
        }).catch(error => {
          EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
        });
      }
    }).catch(error => {
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
    });
  }

  doIssue(issueParams) {
    issue(issueParams, async (issuedBitmarks) => {
      console.log({ issuedBitmarks });
      this.finishIssuing();
    });
  }

  onTakePhoto() {
    Actions.captureMultipleImages({ doIssueImage: this.doIssueImage });
  }

  onChooseFromLibrary() {

    ImagePicker.openPicker({
      multiple: true,
      maxFiles: 10,
      mediaType: 'photo',
      compressImageQuality: 1,
    }).then(results => {
      let images = [];
      for (let image of results) {
        let createdAt = new Date(parseInt(image.creationDate)).toISOString();
        images.push({ uri: image.path, createdAt });
      }

      if (images.length > 1) {
        Actions.arrangePhotos({ images, doIssueImage: this.doIssueImage });
      } else {
        Actions.editIssue({ images, doIssueImage: this.doIssueImage });
      }
    });
  }

  onChooseFile() {
    DocumentPicker.show({
      filetype: ["public.item"],
    }, async (error, response) => {
      console.log('choose file :', { response, error });
      if (error) {
        return;
      }

      if (response.fileSize > constants.ISSUE_FILE_SIZE_LIMIT_IN_MB * 1024 * 1024) {
        Alert.alert('Error', i18n.t('UserComponent_maxFileSize', { size: constants.ISSUE_FILE_SIZE_LIMIT_IN_MB }));
        return;
      }

      let info = await this.prepareToIssue(response, 'chooseFile');

      let filePath = info.filePath;
      let assetName = `HR${moment().format('YYYYMMMDDHHmmss')}`.toUpperCase();

      let metadataList = [];
      metadataList.push({ label: 'Type', value: 'Health' });
      metadataList.push({ label: 'Source', value: 'Medical Records' });
      metadataList.push({ label: 'Collection Date', value: new Date(info.timestamp).toISOString() });

      let issueParams = {
        filePath, assetName, metadataList, fileType: 'file', quantity: 1
      };

      Actions.editIssue({ issueParams, doIssue: this.doIssue });
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
    let destPath = FileUtil.CacheDirectory + '/' + CacheData.userInformation.bitmarkAccountNumber + '/' + fileName;
    await FileUtil.moveFileSafe(filePath, destPath);
    filePath = destPath;

    return { filePath, timestamp };
  }

  async updateSearch(searchTerm) {
    console.log('searchTerm:', searchTerm);
    let searchResults = await search(searchTerm);

    UserBitmarksStore.dispatch(UserBitmarksActions.updateSearchResults(searchResults, searchTerm));

    this.setState({
      isSearching: false
    });
  }

  setSearchFocus(searchFocusing) {
    this.setState({ searchFocusing });
  }

  cancelSearch() {
    this.searchInput.cancelSearch();
  }

  populateCardListData() {
    let cardListData = [];
    let accumulatedTop = 0;

    let accountNumberDisplay = CacheData.userInformation.bitmarkAccountNumber;
    let isCurrentUser = accountNumberDisplay === CacheData.userInformation.bitmarkAccountNumber;

    // Medical & Weekly Health Data records
    let medicalAndWeeklyHealthData = this.props.healthAssetBitmarks.concat(this.props.healthDataBitmarks);
    medicalAndWeeklyHealthData = medicalAndWeeklyHealthData.sort(bitmarkSortFunction);
    if (medicalAndWeeklyHealthData.length) {
      medicalAndWeeklyHealthData.forEach(bitmark => {
        cardListData.push({ type: isHealthDataRecord(bitmark.asset) ? STICK_CARD_TYPES.HEALTH_DATA : STICK_CARD_TYPES.MEDICAL_RECORD, data: bitmark, key: bitmark.id, top: accumulatedTop });
        accumulatedTop += 110;
      })
    }

    // Get stared medical record
    if (this.props.healthAssetBitmarks.length === 0 && this.state.stickCardType !== STICK_CARD_TYPES.GET_STARTED_MEDICAL_RECORD) {
      cardListData.push({ type: STICK_CARD_TYPES.GET_STARTED_MEDICAL_RECORD, top: accumulatedTop, key: 'GET_STARTED_MEDICAL_RECORD' });
      accumulatedTop += 105;
    }

    // Get stared daily health data
    if (isCurrentUser && !CacheData.userInformation.activeHealthDataAt && !this.props.dailyHealthDataBitmarks.length && this.state.stickCardType !== STICK_CARD_TYPES.GET_STARTED_HEALTH_DATA) {
      cardListData.push({ type: STICK_CARD_TYPES.GET_STARTED_HEALTH_DATA, top: accumulatedTop, key: 'GET_STARTED_HEALTH_DATA' });
      accumulatedTop += 105;
    }

    // Daily health data
    if (CacheData.userInformation.activeHealthDataAt && this.state.stickCardType !== STICK_CARD_TYPES.DAILY_HEALTH_DATA) {
      cardListData.push({ type: STICK_CARD_TYPES.DAILY_HEALTH_DATA, data: this.props.dailyHealthDataBitmarks, key: 'DAILY_HEALTH_DATA', top: accumulatedTop });
      accumulatedTop += 110;
    }

    this.accumulatedTop = accumulatedTop;
    this.shouldHasScroll = cardListData.length > 3;

    return cardListData;
  }

  render() {
    let cardListData = this.populateCardListData();
    let randomKey = randomString({length: 8});

    return (
      <View style={{ flex: 1 }}>
        <SafeAreaView style={[styles.bodySafeView,]}>
          <View style={[styles.wrapper]}>
            {/*HEADER BAR*/}
            {(!this.state.searchFocusing && !this.props.searchTerm) &&
            <View style={[styles.topBar]}>
              {/*Back button*/}
              <TouchableOpacity style={styles.topBarButton} onPress={() => { Actions.account() }}>
                <Image style={styles.settingIcon} source={require('assets/imgs/setting-icon-blue.png')} />
              </TouchableOpacity>

              {/*Search Icon*/}
              <TouchableOpacity style={styles.topBarButton} onPress={() => { this.setState({searchFocusing: true}) }}>
                <Image style={styles.searchIcon} source={require('assets/imgs/search-icon-blue.png')} />
              </TouchableOpacity>
            </View>
            }

            {/*SEARCH AREA*/}
            {(this.state.searchFocusing == true || !!this.props.searchTerm) &&
              <View style={[styles.searchArea, (this.props.searchTerm ? { flex: 1 } : {})]}>
                <View style={styles.searchInputContainer}>
                  {/*Search Input*/}
                  <SearchInputComponent
                    throttle={300}
                    ref={(ref) => {
                      this.searchInput = ref
                    }}
                    onSearchTermChange={(searchTerm) => {
                      this.setState({
                        isSearching: true
                      });

                      this.updateSearch(searchTerm);
                    }}
                    setSearchFocus={this.setSearchFocus.bind(this)}
                    style={styles.searchInput}
                    placeholder={global.i18n.t("UserComponent_search").toUpperCase()}>
                  </SearchInputComponent>
                </View>

                {/*Searching status*/}
                {this.state.isSearching && <View style={styles.indicatorContainer}>
                  <MaterialIndicator style={styles.indicator} color={'#C4C4C4'} size={16} />
                  <Text>{global.i18n.t("UserComponent_searching")}</Text>
                </View>
                }

                {(this.state.searchFocusing || !!this.props.searchTerm) ?
                  <SearchResultsComponent style={styles.searchResultsContainer} results={this.props.searchResults} searchTerm={this.props.searchTerm}
                    cancel={this.cancelSearch.bind(this)} /> : null
                }
              </View>
            }

            {/*DATA PANEL*/}
            {(!this.state.searchFocusing && !this.props.searchTerm && this.state.stickCardType !== STICK_CARD_TYPES.GET_STARTED_EMR) &&
              <View style={[styles.topBar]}>
                {/*Back button*/}
                <TouchableOpacity style={styles.topBarButton} onPress={() => { this.setState({ stickCardType: STICK_CARD_TYPES.GET_STARTED_EMR }) }}>
                  <Image style={styles.backIcon} source={require('assets/imgs/back-icon-black.png')} />
                </TouchableOpacity>

                {/*EMR Icon*/}
                <TouchableOpacity style={styles.topBarButton} onPress={() => { Actions.account() }}>
                  <Image style={styles.profileIcon} source={this.props.emrInformation ? { uri: this.props.emrInformation.avatar } : require('assets/imgs/profile-icon.png')} />
                </TouchableOpacity>
              </View>
            }
            {(!this.state.searchFocusing && !this.props.searchTerm) && <View style={styles.body}>
              <View style={[styles.bodyContent]}>
                {/*-----TOP BAR-----*/}

                <ScrollView contentContainerStyle={{ flexGrow: this.shouldHasScroll ? 0 : 1, paddingLeft: convertWidth(16), paddingRight: convertWidth(16), }}>
                  <View style={{ flex: 1, paddingTop: 8, }}>
                    {/*-----STICK CARD-----*/}
                    <View style={[styles.stickCardContainer,]}>
                      {/*GET_STARTED_EMR*/}
                      {this.state.stickCardType === STICK_CARD_TYPES.GET_STARTED_EMR &&
                        <EMRCardComponent />
                      }
                    </View>

                    <View style={{ flex: 1 }}></View>

                    {/*----FEED CARD LIST CONTAINER----*/}
                    <View style={{ flexDirection: 'column', marginTop: 20, height: this.accumulatedTop + 20 }}>
                      {cardListData.map((card) => {
                        // ADD FIRST MEDICAL RECORD
                        if (card.type === STICK_CARD_TYPES.GET_STARTED_MEDICAL_RECORD) {
                          return (
                            <TouchableOpacity style={[styles.cardItem, { top: card.top }]} key={card.key} onPress={() => { Actions.addRecord({ takePhoto: this.takePhoto.bind(this), importRecord: this.importRecord.bind(this) }) }}>
                              <GetStartedFeedCardComponent cardIconSource={require('assets/imgs/medical-record-card-icon.png')}
                                cardHeader={'Add first medical record'} color={'#DFF0FE'}
                              />
                            </TouchableOpacity>
                          );
                        }

                        // AUTOMATICALLY ADD HEALTH DATA
                        if (card.type === STICK_CARD_TYPES.GET_STARTED_HEALTH_DATA) {
                          return (
                            <TouchableOpacity style={[styles.cardItem, { top: card.top }]} key={card.key} onPress={() => { Actions.healthDataGetStart({ resetToInitialState: this.resetToInitialState.bind(this) }) }}>
                              <GetStartedFeedCardComponent cardIconSource={require('assets/imgs/health-data-card-icon.png')}
                                cardHeader={'Track your daily activity'} color={'#EDF0F4'}
                              />
                            </TouchableOpacity>
                          );
                        }

                        // MEDICAL_RECORD
                        if (card.type === STICK_CARD_TYPES.MEDICAL_RECORD) {
                          return (
                            <TouchableOpacity style={[styles.cardItem, { top: card.top }]} key={`${card.key}_${randomKey}`} onPress={() => { Actions.bitmarkDetail({ bitmark: card.data, bitmarkType: 'bitmark_health_issuance', resetToInitialState: this.resetToInitialState.bind(this) }) }}>
                              <MedicalRecordFeedCardComponent bitmark={card.data} />
                            </TouchableOpacity>
                          );
                        }

                        // HEALTH_DATA
                        if (card.type === STICK_CARD_TYPES.HEALTH_DATA) {
                          return (
                            <TouchableOpacity style={[styles.cardItem, { top: card.top }]} key={`${card.key}_${randomKey}`} onPress={() => { Actions.bitmarkDetail({ bitmark: card.data, bitmarkType: 'bitmark_health_data', resetToInitialState: this.resetToInitialState.bind(this) }) }}>
                              <HealthDataFeedCardComponent bitmark={card.data} />
                            </TouchableOpacity>
                          );
                        }

                        // DAILY HEALTH DATA
                        if (card.type === STICK_CARD_TYPES.DAILY_HEALTH_DATA) {
                          return (
                            <TouchableOpacity style={[styles.cardItem, { top: card.top }]} key={card.key} onPress={() => { Actions.dailyHealthDataFullCard({ dailyHealthDataBitmarks: card.data, resetToInitialState: this.resetToInitialState.bind(this) }) }}>
                              <DailyHealthDataFeedCardComponent header={'Track your daily activity'} lastBitmark={card.data[0]} />
                            </TouchableOpacity>
                          );
                        }

                        return null;
                      })}
                    </View>

                  </View>
                </ScrollView>
              </View>
            </View>
            }
          </View>
        </SafeAreaView>

        {/*/!*Add record FAB button*!/*/}
        {/*{(!this.state.searchFocusing && !this.props.searchTerm) &&*/}
        {/*<TouchableOpacity style={[styles.addRecordButton]} onPress={this.showAddRecordOptions.bind(this)}>*/}
          {/*<Image style={styles.addRecordIcon} source={require('assets/imgs/add-record-fab-icon.png')} />*/}
        {/*</TouchableOpacity>*/}
        {/*}*/}

        {/*ADD RECORDS DIALOG*/}
        {this.state.showAddRecordOptions &&
          <AddRecordOptionsComponent takePhoto={this.takePhoto.bind(this)} importRecord={this.importRecord.bind(this)} close={this.hideAddRecordOptions.bind(this)} />
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  searchInputContainer: {
    flexDirection: 'row',
    paddingRight: convertWidth(16),
  },
  addRecordButton: {
    width: 74,
    height: 74,
    position: 'absolute',
    bottom: config.isIPhoneX ? 64 : 20,
    right: 6,
  },
  addRecordIcon: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },

  body: {
    paddingBottom: 10,
    flex: 1,
  },
  bodyContent: {
    flex: 1,
    flexDirection: 'column',
    borderBottomWidth: 0,
    width: "100%",
  },
  topBar: {
    height: 56,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topBarButton: {
    height: '100%',
    paddingRight: convertWidth(16),
    paddingLeft: convertWidth(16),
    alignItems: 'center', justifyContent: 'center',
  },
  backIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain'
  },
  settingIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain'
  },
  searchIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain'
  },
  profileIcon: {
    width: 32,
    height: 32,
    resizeMode: 'cover',
    borderWidth: 0.1, borderRadius: 16, borderColor: 'white',
  },

  cardItem: {
    position: 'absolute',
    width: '100%',
  },

  bodySafeView: {
    flex: 1,
    backgroundColor: 'white',
  },
  searchArea: {
    paddingTop: config.isIPhoneX ? 4 : 11,
  },
  searchInput: {
    paddingLeft: convertWidth(16),
    paddingBottom: config.isIPhoneX ? 17 : 11,
    flex: 1,
  },
  searchResultsContainer: {
    paddingLeft: convertWidth(16),
    paddingRight: convertWidth(16),
    backgroundColor: '#FFFFFF',
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
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
} from 'src/utils';
import { constants } from 'src/configs';

import { SearchInputComponent } from './search-input.component';
import { SearchResultsComponent } from './search-results.component';
import { AppProcessor, EventEmitterService, CacheData, DataProcessor } from 'src/processors';
import { UserBitmarksStore, UserBitmarksActions } from 'src/views/stores';
import { search, issue } from 'src/views/controllers';
import { GetStartedCardComponent } from "./card/get-started-card.component";
import { MedicalRecordCardComponent } from "./card/medical-record-card.component";
import { HealthDataCardComponent } from "./card/health-data-card.component";
import { GetStartedFeedCardComponent } from "./card/get-started-feed-card.component";
import { HealthDataFeedCardComponent } from "./card/health-data-feed-card.component";
import { MedicalRecordFeedCardComponent } from "./card/medical-record-feed-card.component";
import { MMRCardComponent } from './mmr';
import { AddRecordOptionsComponent } from "./add-record-options.component";

const STICK_CARD_TYPES = {
  GET_STARTED_MMR: 0,
  GET_STARTED_MEDICAL_RECORD: 1,
  GET_STARTED_HEALTH_DATA: 2,
  MMR: 3,
  MEDICAL_RECORD: 4,
  HEALTH_DATA: 5
};


class PrivateUserComponent extends Component {
  static propTypes = {
    healthDataBitmarks: PropTypes.array,
    healthAssetBitmarks: PropTypes.array,
    searchTerm: PropTypes.string,
    searchResults: PropTypes.object,
    mmrInformation: PropTypes.object,
  };
  constructor(props) {
    super(props);
    this.doIssueImage = this.doIssueImage.bind(this);
    this.doIssue = this.doIssue.bind(this);
    this.updateSearch = this.updateSearch.bind(this);

    this.state = {
      stickCardType: STICK_CARD_TYPES.GET_STARTED_MMR,
      showAddRecordOptions: false
    };
  }

  goBack() {
    Actions.popTo('user');
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
      stickCardType: STICK_CARD_TYPES.GET_STARTED_MMR,
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
          metadataList.push({ label: 'Source', value: 'Health Records' });
          metadataList.push({ label: 'Saved Time', value: moment(imageInfo.createdAt).toDate().toISOString() });

          if (imageInfo.numberOfFiles) {
            metadataList.push({ label: 'Number Of Files', value: imageInfo.numberOfFiles.toString() });
          }
        }
        if (assetName.length > 64) assetName = assetName.substring(0, 64);
        listInfo.push({
          filePath, assetName, metadataList, quantity: 1, isPublicAsset: false, isMultipleAsset, note: imageInfo.note, tags: imageInfo.tags
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
            let issuedBitmark = issuedBitmarks[0];
            this.goToBitmarkDetail(issuedBitmark.id);
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
      console.log({issuedBitmarks});
      this.goToBitmarkDetail(issuedBitmarks[0].id);
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

      Actions.editIssue({ images, doIssueImage: this.doIssueImage });
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
      metadataList.push({ label: 'Source', value: 'Medical Records' });
      metadataList.push({ label: 'Saved Time', value: new Date(info.timestamp).toISOString() });

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

  populateCardListData() {
    let cardListData = [];
    let accumulatedTop = 0;

    let accountNumberDisplay = CacheData.userInformation.bitmarkAccountNumber;
    let isCurrentUser = accountNumberDisplay === CacheData.userInformation.bitmarkAccountNumber;

    if (this.props.healthAssetBitmarks.length === 0 && this.state.stickCardType !== STICK_CARD_TYPES.GET_STARTED_MEDICAL_RECORD) {
      cardListData.push({ type: STICK_CARD_TYPES.GET_STARTED_MEDICAL_RECORD, top: accumulatedTop });
      accumulatedTop += 105;
    }

    if (isCurrentUser && !CacheData.userInformation.activeHealthDataAt && this.state.stickCardType !== STICK_CARD_TYPES.GET_STARTED_HEALTH_DATA) {
      cardListData.push({ type: STICK_CARD_TYPES.GET_STARTED_HEALTH_DATA, top: accumulatedTop });
      accumulatedTop += 105;
    }

    if (this.props.healthAssetBitmarks.length) {
      this.props.healthAssetBitmarks.forEach(bitmark => {
        if (!(this.state.stickCardType === STICK_CARD_TYPES.MEDICAL_RECORD && this.state.stickMedicalRecord.data.id == bitmark.id)) {
          cardListData.push({ type: STICK_CARD_TYPES.MEDICAL_RECORD, data: bitmark, top: accumulatedTop });
          accumulatedTop += 120;
        }
      })
    }

    if (this.props.healthDataBitmarks.length) {
      this.props.healthDataBitmarks.forEach(bitmark => {
        if (!(this.state.stickCardType === STICK_CARD_TYPES.HEALTH_DATA && this.state.stickHealthData.data.id == bitmark.id)) {
          cardListData.push({ type: STICK_CARD_TYPES.HEALTH_DATA, data: bitmark, top: accumulatedTop });
          accumulatedTop += 120;
        }
      })
    }

    this.accumulatedTop = accumulatedTop;
    this.shouldHasScroll = cardListData.length > 3;

    return cardListData;
  }

  render() {
    let cardListData = this.populateCardListData();

    return (
      <View style={{ flex: 1 }}>
        <SafeAreaView style={[styles.bodySafeView,]}>
          <View style={[styles.wrapper]}>
            {/*SEARCH AREA*/}
            {this.state.stickCardType === STICK_CARD_TYPES.GET_STARTED_MMR &&
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

                  {/*Add record button*/}
                  {(!this.state.searchFocusing && !this.props.searchTerm) &&
                    <TouchableOpacity onPress={this.showAddRecordOptions.bind(this)}>
                      <Image style={styles.addRecordIcon} source={require('assets/imgs/add-record-icon.png')} />
                    </TouchableOpacity>
                  }
                </View>

                {this.state.isSearching && <View style={styles.indicatorContainer}>
                  <MaterialIndicator style={styles.indicator} color={'#C4C4C4'} size={16} />
                  <Text>{global.i18n.t("UserComponent_searching")}</Text>
                </View>
                }
                {(this.state.searchFocusing || this.props.searchTerm) ?
                  <SearchResultsComponent style={styles.searchResultsContainer} results={this.props.searchResults} searchTerm={this.props.searchTerm}
                    cancel={this.searchInput.cancelSearch.bind(this.searchInput)} /> : null}
              </View>
            }

            {/*DATA PANEL*/}
            {(!this.state.searchFocusing && !this.props.searchTerm && this.state.stickCardType !== STICK_CARD_TYPES.GET_STARTED_MMR) &&
              <View style={[styles.topBar]}>
                {/*Back button*/}
                <TouchableOpacity style={styles.topBarButton} onPress={() => { this.setState({ stickCardType: STICK_CARD_TYPES.GET_STARTED_MMR }) }}>
                  <Image style={styles.backIcon} source={require('assets/imgs/back-icon-black.png')} />
                </TouchableOpacity>

                {/*MMR Icon*/}
                <TouchableOpacity style={styles.topBarButton} onPress={() => { Actions.mmrInformation() }}>
                  <Image style={styles.profileIcon} source={this.props.mmrInformation ? { uri: this.props.mmrInformation.avatar } : require('assets/imgs/profile-icon.png')} />
                </TouchableOpacity>
              </View>
            }
            {(!this.state.searchFocusing && !this.props.searchTerm) && <View style={styles.body}>
              <View style={[styles.bodyContent]}>
                {/*-----TOP BAR-----*/}

                <ScrollView contentContainerStyle={{ flexGrow: this.shouldHasScroll ? 0 : 1, paddingLeft: convertWidth(16), paddingRight: convertWidth(16), }}>
                  <View style={{ flex: 1, paddingTop: 20, }}>
                    {/*-----STICK CARD-----*/}
                    <View style={[styles.stickCardContainer,]}>
                      {/*GET_STARTED_MMR*/}
                      {this.state.stickCardType === STICK_CARD_TYPES.GET_STARTED_MMR &&
                        <MMRCardComponent displayFromUserScreen={true} />
                      }

                      {/*GET_STARTED_MEDICAL_RECORD*/}
                      {this.state.stickCardType === STICK_CARD_TYPES.GET_STARTED_MEDICAL_RECORD &&
                        <TouchableOpacity onPress={() => { Actions.addRecord({ takePhoto: this.takePhoto.bind(this), importRecord: this.importRecord.bind(this) }) }}>
                          <GetStartedCardComponent cardIconSource={require('assets/imgs/medical-record-card-icon.png')}
                            cardHeader={'Add first medical record'}
                            cardText={'Store all your medical records in one secure place.'}
                            cardTopBarStyle={{ backgroundColor: '#FBC9D5' }}
                            isStickCard={true}
                            cardNextIconSource={require('assets/imgs/arrow-right-icon-red.png')}
                          />
                        </TouchableOpacity>
                      }

                      {/*GET_STARTED_HEALTH_DATA*/}
                      {this.state.stickCardType === STICK_CARD_TYPES.GET_STARTED_HEALTH_DATA &&
                        <TouchableOpacity onPress={Actions.getStart}>
                          <GetStartedCardComponent cardIconSource={require('assets/imgs/health-data-card-icon.png')}
                            cardHeader={'Learn about your health'}
                            cardText={'To register ownership of your health data, allow Bitmark Health to access specific (or all) categories of data.'}
                            cardTopBarStyle={{ backgroundColor: '#FBC9D5' }}
                            isStickCard={true}
                            cardNextIconSource={require('assets/imgs/arrow-right-icon-red.png')}
                          />
                        </TouchableOpacity>
                      }

                      {/*MEDICAL RECORD*/}
                      {this.state.stickCardType === STICK_CARD_TYPES.MEDICAL_RECORD &&
                        <TouchableOpacity onPress={() => { Actions.bitmarkDetail({ bitmark: this.state.stickMedicalRecord.data, bitmarkType: 'bitmark_health_issuance', resetToInitialState: this.resetToInitialState.bind(this) }) }}>
                          <MedicalRecordCardComponent bitmark={this.state.stickMedicalRecord.data} />
                        </TouchableOpacity>
                      }

                      {/*HEALTH DATA*/}
                      {this.state.stickCardType === STICK_CARD_TYPES.HEALTH_DATA &&
                        <TouchableOpacity onPress={() => { Actions.bitmarkDetail({ bitmark: this.state.stickHealthData.data, bitmarkType: 'bitmark_health_data', resetToInitialState: this.resetToInitialState.bind(this) }) }}>
                          <HealthDataCardComponent bitmark={this.state.stickHealthData.data} />
                        </TouchableOpacity>
                      }
                    </View>

                    <View style={{ flex: 1 }}></View>

                    {/*----FEED CARD LIST CONTAINER----*/}
                    <View style={{ flexDirection: 'column', marginTop: 20, height: this.accumulatedTop + 20 }}>
                      {cardListData.map((card, index) => {
                        // ADD FIRST MEDICAL RECORD
                        if (card.type === STICK_CARD_TYPES.GET_STARTED_MEDICAL_RECORD) {
                          return (
                            <TouchableOpacity style={[styles.cardItem, { top: card.top }]} key={index} onPress={() => { this.setState({ stickCardType: STICK_CARD_TYPES.GET_STARTED_MEDICAL_RECORD }) }}>
                              <GetStartedFeedCardComponent cardIconSource={require('assets/imgs/medical-record-card-icon.png')}
                                cardHeader={'Add first medical record'}
                              />
                            </TouchableOpacity>
                          );
                        }

                        // AUTOMATICALLY ADD HEALTH DATA
                        if (card.type === STICK_CARD_TYPES.GET_STARTED_HEALTH_DATA) {
                          return (
                            <TouchableOpacity style={[styles.cardItem, { top: card.top }]} key={index} onPress={() => { this.setState({ stickCardType: STICK_CARD_TYPES.GET_STARTED_HEALTH_DATA }) }}>
                              <GetStartedFeedCardComponent cardIconSource={require('assets/imgs/health-data-card-icon.png')}
                                cardHeader={'Learn about your health'}
                              />
                            </TouchableOpacity>
                          );
                        }

                        // MEDICAL_RECORD
                        if (card.type === STICK_CARD_TYPES.MEDICAL_RECORD) {
                          return (
                            <TouchableOpacity style={[styles.cardItem, { top: card.top }]} key={index} onPress={() => { this.setState({ stickCardType: STICK_CARD_TYPES.MEDICAL_RECORD, stickMedicalRecord: card }) }}>
                              <MedicalRecordFeedCardComponent bitmark={card.data} />
                            </TouchableOpacity>
                          );
                        }

                        // HEALTH_DATA
                        if (card.type === STICK_CARD_TYPES.HEALTH_DATA) {
                          return (
                            <TouchableOpacity style={[styles.cardItem, { top: card.top }]} key={index} onPress={() => { this.setState({ stickCardType: STICK_CARD_TYPES.HEALTH_DATA, stickHealthData: card }) }}>
                              <HealthDataFeedCardComponent bitmark={card.data} />
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
    paddingTop: convertWidth(16),
  },
  searchInputContainer: {
    flexDirection: 'row',
    paddingRight: convertWidth(16),
  },
  addRecordIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
    marginTop: 5,
    marginLeft: 16,
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
    paddingRight: convertWidth(16),
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
    paddingTop: convertWidth(16)
  },
  searchInput: {
    paddingLeft: convertWidth(16),
    paddingBottom: convertWidth(14),
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
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactNative, {
  StyleSheet, Alert, Linking,
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
} from 'src/utils';
import { config, constants } from 'src/configs';

import { SearchInputComponent } from './search-input.component';
import { SearchResultsComponent } from './search-results.component';
import { AppProcessor, EventEmitterService, CacheData } from 'src/processors';
import { UserBitmarksStore, UserBitmarksActions } from 'src/views/stores';
import { search, issue } from 'src/views/controllers';
import { GetStartedCardComponent } from "./card/get-started-card.component";
import { MedicalRecordCardComponent } from "./card/medical-record-card.component";
import { HealthDataCardComponent } from "./card/health-data-card.component";
import { MMRCardComponent } from './mmr';

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
    searchResults: PropTypes.object
  };
  constructor(props) {
    super(props);
    this.doIssueImage = this.doIssueImage.bind(this);
    this.updateSearch = this.updateSearch.bind(this);

    this.state = {
      stickCardType: STICK_CARD_TYPES.GET_STARTED_MMR
    };
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
        }
        if (assetName.length > 64) assetName = assetName.substring(0, 64);
        listInfo.push({
          filePath, assetName, metadataList, quantity: 1, isPublicAsset: false, isMultipleAsset
        });

        listAssetName.push(assetName);
      }
      let bitmarks = await AppProcessor.doIssueMultipleFiles(listInfo, {
        indicator: true, title: i18n.t('CaptureAssetComponent_title'), message: ''
      });

      if (bitmarks) {
        for (let i = 0; i < listInfo.length; i++) {
          FileUtil.removeSafe(listInfo[i].filePath);
        }
        return listAssetName;
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
      maxFiles: 10,
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
        Actions.orderCombineImages({ images, doIssueImage: this.doIssueImage });
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

      issue(filePath, assetName, metadataList, 'file', 1, async () => {
        Actions.assetNameInform({ assetNames: [assetName] });
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

    let accountNumberDisplay = CacheData.userInformation.bitmarkAccountNumber;
    let isCurrentUser = accountNumberDisplay === CacheData.userInformation.bitmarkAccountNumber;

    if (this.state.stickCardType !== STICK_CARD_TYPES.GET_STARTED_MMR) {
      cardListData.push({ type: STICK_CARD_TYPES.GET_STARTED_MMR });
    }

    if (this.props.healthAssetBitmarks.length === 0 && this.state.stickCardType !== STICK_CARD_TYPES.GET_STARTED_MEDICAL_RECORD) {
      cardListData.push({ type: STICK_CARD_TYPES.GET_STARTED_MEDICAL_RECORD })
    }

    if (isCurrentUser && !CacheData.userInformation.activeHealthDataAt && this.state.stickCardType !== STICK_CARD_TYPES.GET_STARTED_HEALTH_DATA) {
      cardListData.push({ type: STICK_CARD_TYPES.GET_STARTED_HEALTH_DATA })
    }

    if (this.props.healthAssetBitmarks.length) {
      this.props.healthAssetBitmarks.forEach(bitmark => {
        if (!(this.state.stickCardType === STICK_CARD_TYPES.MEDICAL_RECORD && this.state.stickMedicalRecord.data.id == bitmark.id)) {
          cardListData.push({ type: STICK_CARD_TYPES.MEDICAL_RECORD, data: bitmark });
        }
      })
    }

    if (this.props.healthDataBitmarks.length) {
      this.props.healthDataBitmarks.forEach(bitmark => {
        if (!(this.state.stickCardType === STICK_CARD_TYPES.HEALTH_DATA && this.state.stickHealthData.data.id == bitmark.id)) {
          cardListData.push({ type: STICK_CARD_TYPES.HEALTH_DATA, data: bitmark })
        }
      })
    }

    return cardListData;
  }

  render() {
    let cardListData = this.populateCardListData();

    return (
      <SafeAreaView style={[styles.bodySafeView,]}>
        <View style={[styles.wrapper]}>
          {/*SEARCH AREA*/}
          <View style={[styles.searchArea, (this.props.searchTerm ? { flex: 1 } : {})]}>
            <View style={styles.searchInputContainer}>
              {/*Search Input*/}
              <SearchInputComponent
                throttle={300}
                ref={(ref) => { this.searchInput = ref }}
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

              {/*Setting button*/}
              <TouchableOpacity onPress={Actions.account}>
                <Image style={styles.settingIcon} source={require('assets/imgs/setting-icon.png')} />
              </TouchableOpacity>

              {/*Add record button*/}
              <TouchableOpacity onPress={this.addRecord.bind(this)}>
                <Image style={styles.addRecordIcon} source={require('assets/imgs/add-record-icon.png')} />
              </TouchableOpacity>
            </View>

            {this.state.isSearching && <View style={styles.indicatorContainer}>
              <MaterialIndicator style={styles.indicator} color={'#C4C4C4'} size={16} />
              <Text>{global.i18n.t("UserComponent_searching")}</Text>
            </View>
            }
            {(this.state.searchFocusing || this.props.searchResults.length) ? <SearchResultsComponent style={styles.searchResultsContainer} results={this.props.searchResults} searchTerm={this.props.searchTerm} cancel={this.searchInput.cancelSearch.bind(this.searchInput)} /> : null}
          </View>

          {/*DATA PANEL*/}
          {!this.state.searchFocusing && <View style={styles.body}>
            <View style={[styles.bodyContent]}>
              {/*-----STICK CARD-----*/}
              <MMRCardComponent displayFromUserScreen={true} />

              {/*GET_STARTED_MEDICAL_RECORD*/}
              {this.state.stickCardType === STICK_CARD_TYPES.GET_STARTED_MEDICAL_RECORD &&
                <TouchableOpacity onPress={() => { Actions.addRecord({ addRecord: this.addRecord.bind(this) }) }}>
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
                    cardHeader={'Automatically add health data'}
                    cardText={'To register ownership of your health data, allow Bitmark Health to access specific (or all) categories of data.'}
                    cardTopBarStyle={{ backgroundColor: '#FBC9D5' }}
                    isStickCard={true}
                    cardNextIconSource={require('assets/imgs/arrow-right-icon-red.png')}
                  />
                </TouchableOpacity>
              }

              {/*MEDICAL RECORD*/}
              {this.state.stickCardType === STICK_CARD_TYPES.MEDICAL_RECORD &&
                <TouchableOpacity onPress={() => { Actions.bitmarkDetail({ bitmark: this.state.stickMedicalRecord.data, bitmarkType: 'bitmark_health_issuance' }) }}>
                  <MedicalRecordCardComponent bitmark={this.state.stickMedicalRecord.data} />
                </TouchableOpacity>
              }

              {/*HEALTH DATA*/}
              {this.state.stickCardType === STICK_CARD_TYPES.HEALTH_DATA &&
                <TouchableOpacity onPress={() => { Actions.bitmarkDetail({ bitmark: this.state.stickHealthData.data, bitmarkType: 'bitmark_health_data' }) }}>
                  <HealthDataCardComponent bitmark={this.state.stickHealthData.data} />
                </TouchableOpacity>
              }


              {/*----CARD LIST CONTAINER----*/}
              <ScrollView style={[styles.cardListContainer]}>
                <View style={{ flexDirection: 'column', height: (cardListData.length - 1) * 140 + 300 }}>
                  {cardListData.map((card, index) => {
                    // SETUP MMR
                    if (card.type === STICK_CARD_TYPES.GET_STARTED_MMR) {
                      return (
                        <TouchableOpacity key={index} style={[styles.cardItem, { top: 140 * index }]} onPress={() => { this.setState({ stickCardType: STICK_CARD_TYPES.GET_STARTED_MMR }) }}>
                          <GetStartedCardComponent cardIconSource={require('assets/imgs/mma-card-icon.png')}
                            cardHeader={'Set up your minimum medical record'}
                            cardText={'Medical profile helps first responders access your critical medical information from the Bitmark health app. They can see information like allergies and medical conditions as well as who to contact in case of an emergency.'}
                          />
                        </TouchableOpacity>
                      );
                    }

                    // ADD FIRST MEDICAL RECORD
                    if (card.type === STICK_CARD_TYPES.GET_STARTED_MEDICAL_RECORD) {
                      return (
                        <TouchableOpacity key={index} style={[styles.cardItem, { top: 140 * index }]} onPress={() => { this.setState({ stickCardType: STICK_CARD_TYPES.GET_STARTED_MEDICAL_RECORD }) }}>
                          <GetStartedCardComponent cardIconSource={require('assets/imgs/medical-record-card-icon.png')}
                            cardHeader={'Add first medical record'}
                            cardText={'Store all your medical records in one secure place.'}
                            cardTopBarStyle={{ backgroundColor: '#FBC9D5' }}
                          />
                        </TouchableOpacity>
                      );
                    }

                    // AUTOMATICALLY ADD HEALTH DATA
                    if (card.type === STICK_CARD_TYPES.GET_STARTED_HEALTH_DATA) {
                      return (
                        <TouchableOpacity key={index} style={[styles.cardItem, { top: 140 * index }]} onPress={() => { this.setState({ stickCardType: STICK_CARD_TYPES.GET_STARTED_HEALTH_DATA }) }}>
                          <GetStartedCardComponent cardIconSource={require('assets/imgs/health-data-card-icon.png')}
                            cardHeader={'Automatically add health data'}
                            cardText={'To register ownership of your health data, allow Bitmark Health to access specific (or all) categories of data.'}
                            cardTopBarStyle={{ backgroundColor: '#FBC9D5' }}
                          />
                        </TouchableOpacity>
                      );
                    }

                    // MEDICAL_RECORD
                    if (card.type === STICK_CARD_TYPES.MEDICAL_RECORD) {
                      return (
                        <TouchableOpacity key={index} style={[styles.cardItem, { top: 140 * index }]} onPress={() => { this.setState({ stickCardType: STICK_CARD_TYPES.MEDICAL_RECORD, stickMedicalRecord: card }) }}>
                          <MedicalRecordCardComponent bitmark={card.data} />
                        </TouchableOpacity>
                      );
                    }

                    // MEDICAL_RECORD
                    if (card.type === STICK_CARD_TYPES.HEALTH_DATA) {
                      return (
                        <TouchableOpacity key={index} style={[styles.cardItem, { top: 140 * index }]} onPress={() => { this.setState({ stickCardType: STICK_CARD_TYPES.HEALTH_DATA, stickHealthData: card }) }}>
                          <HealthDataCardComponent bitmark={card.data} />
                        </TouchableOpacity>
                      );
                    }

                    return null;
                  })}
                </View>
              </ScrollView>
            </View>
          </View>
          }
        </View>
      </SafeAreaView>
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
  addRecordIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
    marginTop: 5,
  },
  settingIcon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
    marginTop: 8,
    marginRight: 10,
  },

  body: {
    padding: convertWidth(16),
    paddingTop: 0,
    flex: 1,
  },
  bodyContent: {
    flex: 1,
    flexDirection: 'column',
    borderBottomWidth: 0,
    width: "100%",
  },

  cardListContainer: {
    marginTop: 60,
    width: '100%',
    flex: 1,
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
    paddingRight: convertWidth(16),
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
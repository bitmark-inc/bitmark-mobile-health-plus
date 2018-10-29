import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactNative, {
  StyleSheet, Alert, Linking,
  Image, View, TouchableOpacity, Text, SafeAreaView,
} from 'react-native';

let { ActionSheetIOS } = ReactNative;
import { Provider, connect } from 'react-redux';

import {
  FileUtil,
  convertWidth, issue,
  populateAssetNameFromImage, populateAssetNameFromPdf
} from './../../utils';
import { config } from '../../configs';
import { constants } from '../../constants';
import { DataProcessor, AppProcessor } from './../../processors';
import { Actions } from 'react-native-router-flux';
import { EventEmitterService } from '../../services';
import { UserBitmarksStore } from '../../stores';

import ImagePicker from 'react-native-image-picker';
import { DocumentPicker, DocumentPickerUtil } from 'react-native-document-picker';

class PrivateUserComponent extends Component {
  static propTypes = {
    healthDataBitmarks: PropTypes.array,
    healthAssetBitmarks: PropTypes.array,
  };
  constructor(props) {
    super(props);
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

  onTakePhoto() {
    ImagePicker.launchCamera({}, (response) => {
      this.processOnChooseImage(response);
    });
  }

  onChooseFromLibrary() {
    ImagePicker.launchImageLibrary({}, (response) => {
      this.processOnChooseImage(response);
    });
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
      filetype: [DocumentPickerUtil.allFiles(), "public.data"],
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

      let willDetectAssetNameAutomatically = false;
      const pdfExtensions = ['PDF'];
      const imageExtensions = ['PNG', 'JPG', 'JPEG', 'HEIC', 'TIFF', 'BMP', 'HEIF', 'IMG'];
      let fileExtension = filePath.substring(filePath.lastIndexOf('.') + 1);
      if (pdfExtensions.includes(fileExtension.toUpperCase())) {
        willDetectAssetNameAutomatically = true;
        EventEmitterService.emit(EventEmitterService.events.APP_PROCESSING, true);
        assetName = await populateAssetNameFromPdf(filePath, assetName);
        EventEmitterService.emit(EventEmitterService.events.APP_PROCESSING, false);
      } else if (imageExtensions.includes(fileExtension.toUpperCase())) {
        willDetectAssetNameAutomatically = true;
        EventEmitterService.emit(EventEmitterService.events.APP_PROCESSING, true);
        assetName = await populateAssetNameFromImage(filePath, assetName);
        EventEmitterService.emit(EventEmitterService.events.APP_PROCESSING, false);
      }

      let metadataList = [];
      metadataList.push({ label: 'Source', value: 'Medical Records' });
      metadataList.push({ label: 'Saved Time', value: new Date(info.timestamp).toISOString() });

      issue(filePath, assetName, metadataList, 'file', 1, () => willDetectAssetNameAutomatically ? Actions.assetNameInform({ assetName }) : Actions.pop());
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

  backToUserAccount() {
    AppProcessor.doSelectAccountAccess(DataProcessor.getUserInformation().bitmarkAccountNumber).then(result => {
      if (result) {
        Actions.reset('user');
      }
    }).catch(error => {
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
    });
  }

  render() {
    let accountNumberDisplay = DataProcessor.getAccountAccessSelected() || DataProcessor.getUserInformation().bitmarkAccountNumber;
    let isCurrentUser = accountNumberDisplay === DataProcessor.getUserInformation().bitmarkAccountNumber;
    return (
      <View style={{ flex: 1, }}>
        {!isCurrentUser && <TouchableOpacity style={styles.accountNumberDisplayArea} onPress={this.backToUserAccount.bind(this)}>
          <Text style={styles.accountNumberDisplayText}>
            {i18n.t('UserComponent_accountNumberDisplayText', { accountNumber: '[' + accountNumberDisplay.substring(0, 4) + '...' + accountNumberDisplay.substring(accountNumberDisplay.length - 4, accountNumberDisplay.length) + ']' })}
          </Text>
        </TouchableOpacity>}
        <SafeAreaView style={[styles.bodySafeView,]}>
          <View style={styles.body}>
            <View style={[styles.bodyContent, isCurrentUser ? {} : { borderBottomWidth: 1 }]} >
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
                  <Text style={styles.addHealthRecordButtonText} > {i18n.t('UserComponent_addHealthRecordButtonText').toUpperCase()}</Text>
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
        </SafeAreaView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  accountNumberDisplayArea: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: convertWidth(32) + (config.isIPhoneX ? constants.iPhoneXStatusBarHeight : 0),
    paddingTop: (config.isIPhoneX ? constants.iPhoneXStatusBarHeight : 0),
    backgroundColor: '#E6FF00',
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountNumberDisplayText: {
    fontFamily: 'Avenir Heavy',
    fontWeight: '800',
    fontSize: 14,
  },
  bodySafeView: {
    flex: 1,
    backgroundColor: 'white',
  },
  body: {
    padding: convertWidth(16),
    paddingTop: convertWidth(16) + (config.isIPhoneX ? constants.iPhoneXStatusBarHeight : 0),
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
    fontFamily: 'Avenir Black',
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
    fontFamily: 'Avenir Medium',
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
    fontFamily: 'Avenir Medium',
    fontWeight: '300',
    fontSize: 16,
    color: '#FF1F1F'
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
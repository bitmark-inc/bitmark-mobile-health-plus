import React, { Component } from 'react';
import {
  StyleSheet,
  Alert,
  Linking,
  Image, View, TouchableOpacity, Text, SafeAreaView,
  ActionSheetIOS
} from 'react-native';

import ImagePicker from 'react-native-image-picker';
import { DocumentPicker, DocumentPickerUtil } from 'react-native-document-picker';
import { convertWidth, runPromiseWithoutError, FileUtil } from './../../utils';
import { config } from '../../configs';
import { constants } from '../../constants';
import { DataProcessor, AppProcessor } from './../../processors';
import { Actions } from 'react-native-router-flux';
import { EventEmitterService } from '../../services';
import randomString from "random-string";
import {issue} from "../../utils";

let ComponentName = 'ComponentName';
export class UserComponent extends Component {
  constructor(props) {
    super(props);

    this.handerChangeUserDataBitmarks = this.handerChangeUserDataBitmarks.bind(this);
    EventEmitterService.remove(EventEmitterService.events.CHANGE_USER_DATA_BITMARKS, null, ComponentName);

    this.state = {
      numberHealthDataBitmarks: 0,
      numberHealthAssetBitmarks: 0,
      isDisplayingAccountNumber: true,
    }
    runPromiseWithoutError(DataProcessor.doGetUserDataBitmarks(DataProcessor.getAccountAccessSelected())).then(({ healthDataBitmarks, healthAssetBitmarks }) => {
      let numberHealthDataBitmarks = (healthDataBitmarks || []).length;
      let numberHealthAssetBitmarks = (healthAssetBitmarks || []).length;
      this.setState({ numberHealthDataBitmarks, numberHealthAssetBitmarks });
    });
  }

  componentDidMount() {
    EventEmitterService.on(EventEmitterService.events.CHANGE_USER_DATA_BITMARKS, this.handerChangeUserDataBitmarks, ComponentName);
  }

  handerChangeUserDataBitmarks({ healthDataBitmarks, healthAssetBitmarks, bitmarkAccountNumber }) {
    console.log('handerChangeUserDataBitmarks user data bitmarks :', healthDataBitmarks, healthAssetBitmarks, bitmarkAccountNumber);
    let accountNumberDisplay = DataProcessor.getAccountAccessSelected() || DataProcessor.getUserInformation().bitmarkAccountNumber;
    if (accountNumberDisplay === bitmarkAccountNumber) {
      let numberHealthDataBitmarks = (healthDataBitmarks || []).length;
      let numberHealthAssetBitmarks = (healthAssetBitmarks || []).length;
      this.setState({ numberHealthDataBitmarks, numberHealthAssetBitmarks });
    }
  }

  addRecord() {
    ActionSheetIOS.showActionSheetWithOptions({
        options: ['Cancel', 'Take Photo...', 'Choose from Library...', 'Files...'],
        title: 'Add records',
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
    ImagePicker.launchCamera({}, (response)  => {
      this.processOnChooseImage(response);
    });
  }

  onChooseFromLibrary() {
    ImagePicker.launchImageLibrary({}, (response)  => {
      this.processOnChooseImage(response);
    });
  }

  async processOnChooseImage(response) {
    if (response.error) {
      Alert.alert('Permission error!', response.error + '.', [{
        text: 'Enable',
        onPress: () => Linking.openURL('app-settings:')
      }, {
        text: 'Cancel',
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
        Alert.alert(`Files must be less than ${constants.ISSUE_FILE_SIZE_LIMIT_IN_MB} MB.`);
        return;
      }

      let info = await this.prepareToIssue(response);

      let filePath = info.filePath;
      let assetName = response.fileName;
      let metadataList = [];
      metadataList.push({label: 'Source', value: 'Medical Records'});
      metadataList.push({label: 'Saved Time', value: new Date().toISOString()});

      issue(filePath, assetName, metadataList, 'file');
    });
  }

  async prepareToIssue(response) {
    let filePath = response.uri.replace('file://', '');
    filePath = decodeURIComponent(filePath);

    // Move file from "tmp" folder to "cache" folder
    let fileName = response.fileName ? response.fileName : response.uri.substring(response.uri.lastIndexOf('/') + 1);
    let timestamp = response.timestamp ? response.timestamp : new Date().toISOString();
    let destPath = FileUtil.CacheDirectory + '/' + DataProcessor.getUserInformation().bitmarkAccountNumber + '/' + fileName;
    await FileUtil.moveFileSafe(filePath, destPath);
    filePath = destPath;

    return {filePath, timestamp};
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
          <Text style={styles.accountNumberDisplayText}>Viewing {'[' + accountNumberDisplay.substring(0, 4) + '...' + accountNumberDisplay.substring(accountNumberDisplay.length - 4, accountNumberDisplay.length) + ']'}, tap here to cancel.</Text>
        </TouchableOpacity>}
        <SafeAreaView style={[styles.bodySafeView, { backgroundColor: this.state.isDisplayingAccountNumber ? 'white' : 'rgba(0,0,0,0.25)', }]}>
          <View style={styles.body}>
            <TouchableOpacity style={[styles.bodyContent, isCurrentUser ? {} : { borderBottomWidth: 1 }]} onPress={() => this.setState({ isDisplayingAccountNumber: true })} activeOpacity={1}>
              <View style={styles.dataArea}>
                <TouchableOpacity style={{ flex: 1 }} disabled={this.state.numberHealthDataBitmarks === 0 || !this.state.isDisplayingAccountNumber} onPress={() => {
                  this.setState({ isDisplayingAccountNumber: true });
                  Actions.bitmarkList({ bitmarkType: 'bitmark_health_data' })
                }}>
                  <Text style={styles.dataTitle}><Text style={{ color: '#FF1829' }}>{this.state.numberHealthDataBitmarks}</Text> Week{this.state.numberHealthDataBitmarks !== 1 ? 's' : ''} of health data</Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.dataArea, { borderTopColor: '#FF1829', borderTopWidth: 1, paddingBottom: convertWidth(60), }]}>
                <TouchableOpacity style={{ flex: 1 }} disabled={this.state.numberHealthAssetBitmarks === 0 || !this.state.isDisplayingAccountNumber} onPress={() => {
                  this.setState({ isDisplayingAccountNumber: true });
                  Actions.bitmarkList({ bitmarkType: 'bitmark_health_issuance' })
                }}>
                  <Text style={styles.dataTitle}><Text style={{ color: '#FF1829' }}>{this.state.numberHealthAssetBitmarks}</Text> Health record{this.state.numberHealthAssetBitmarks !== 1 ? 's' : ''}</Text>
                </TouchableOpacity>
                {this.state.isDisplayingAccountNumber && isCurrentUser && <TouchableOpacity style={styles.addHealthRecordButton} onPress={this.addRecord.bind(this)}>
                  <Image style={styles.addHealthRecordButtonIcon} source={require('./../../../assets/imgs/plus_icon_red.png')} />
                  <Text style={styles.addHealthRecordButtonText} > {'Add records'.toUpperCase()}</Text>
                </TouchableOpacity>}
              </View>
            </TouchableOpacity>
            {isCurrentUser && <View style={[styles.accountArea, this.state.isDisplayingAccountNumber ? {} : { borderTopWidth: 0, }]}>
              <TouchableOpacity style={styles.accountButton} onPress={() => this.setState({ isDisplayingAccountNumber: !this.state.isDisplayingAccountNumber })}>
                <Text style={styles.accountButtonText}>
                  {this.state.isDisplayingAccountNumber ? ('ACCOUNT') : ''}
                </Text>
              </TouchableOpacity>
            </View>}
            {!this.state.isDisplayingAccountNumber && !DataProcessor.getAccountAccessSelected() && <View style={styles.overlapButtonsArea}>
              <TouchableOpacity style={[styles.accountButton, { height: 45, width: '100%', backgroundColor: '#FF4444' }]} onPress={() => {
                this.setState({ isDisplayingAccountNumber: true });
                Actions.account();
              }}>
                <Text style={[styles.accountButtonText, { color: 'white', fontWeight: '400', }]}>ACCOUNT SETTINGS</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.accountButton, { height: 45, width: '100%', backgroundColor: '#FF4444', marginTop: 1 }]} onPress={() => {
                this.setState({ isDisplayingAccountNumber: true });
                Actions.grantingAccess();
              }}>
                <Text style={[styles.accountButtonText, { color: 'white', fontWeight: '400', }]}>GRANT ACCESS</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.accountButton, { height: 45, width: '100%', backgroundColor: '#FF4444', marginTop: 1 }]} onPress={() => {
                this.setState({ isDisplayingAccountNumber: true });
                Actions.otherAccounts();
              }}>
                <Text style={[styles.accountButtonText, { color: 'white', fontWeight: '400', }]}>VIEW OTHER ACCOUNT</Text>
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
  overlapButtonsArea: {
    width: '100%',
    borderColor: '#FF1829', borderTopWidth: 0, borderWidth: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: convertWidth(16),
    marginLeft: convertWidth(16),
  },
});
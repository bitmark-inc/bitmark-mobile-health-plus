import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import ReactNative, {
  StyleSheet,
  Alert,
  Linking,
  View, SafeAreaView, TouchableOpacity, Text, Image,
} from 'react-native';
let { ActionSheetIOS } = ReactNative;
import Hyperlink from 'react-native-hyperlink';
import ImagePicker from 'react-native-image-picker';
import { DocumentPicker, DocumentPickerUtil } from 'react-native-document-picker';

import { convertWidth, FileUtil, issue } from './../../utils';
import { config } from '../../configs';
import { constants } from '../../constants';
import { Actions } from 'react-native-router-flux';
import { DataProcessor } from '../../processors';

export class AddRecordComponent extends Component {
  static propTypes = {

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
      let metadataList = [];
      metadataList.push({ label: 'Source', value: 'Medical Records' });
      metadataList.push({ label: 'Saved Time', value: new Date(info.timestamp).toISOString() });

      issue(filePath, assetName, metadataList, 'file');
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

  render() {
    return (
      <SafeAreaView style={styles.bodySafeView}>
        <View style={styles.body}>
          <View style={styles.bodyContent}>
            <View style={styles.titleRow}>
              <Text style={styles.titleText}>Medical records</Text>
              <TouchableOpacity style={styles.closeButton} onPress={Actions.pop}>
                <Image style={styles.closeIcon} source={require('./../../../assets/imgs/close_icon_red.png')} />
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1, padding: 20 }}>
              <Hyperlink linkStyle={{ color: 'black' }}
                linkText={() => '+ Add record'}
              >
                <Text style={styles.message}>
                  You have no medical records now. {'\n'}Tap on "http://abc" button to add your first medical record.
                </Text>
              </Hyperlink>
              <View style={{ flex: 1, padding: 30 }}>
                <Image style={{ width: '100%', height: '100%', resizeMode: 'contain' }} source={require('./../../../assets/imgs/add-record.png')} />
              </View>
            </View>
            <View style={styles.bottomButtonArea}>
              <TouchableOpacity style={[styles.bottomButton]} onPress={this.addRecord.bind(this)}>
                <Text style={[styles.bottomButtonText]}>{i18n.t('UserComponent_addHealthRecordButtonText').toUpperCase().toUpperCase()}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
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
    borderWidth: 1, borderColor: '#FF4444',
    width: '100%'
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: convertWidth(20),
    paddingTop: 0,
    paddingRight: 0,
    width: '100%',
  },
  titleText: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 24,
    flex: 1,
  },
  closeButton: {
    paddingTop: convertWidth(26),
    paddingBottom: convertWidth(26),
    paddingRight: convertWidth(24),
    paddingLeft: convertWidth(50),
  },
  closeIcon: {
    width: convertWidth(21),
    height: convertWidth(21),
    resizeMode: 'contain',
  },

  message: {
    fontFamily: 'Avenir Light',
    fontWeight: '300',
    fontSize: 16,
  },


  bottomButtonArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: convertWidth(20),
  },

  bottomButton: {
    borderWidth: 1, borderColor: '#FF4444',
    backgroundColor: '#FF4444',
    height: constants.buttonHeight,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',

  },
  bottomButtonText: {
    fontFamily: 'Avenir Light',
    fontWeight: '900',
    fontSize: 16,
    color: 'white'
  }



});
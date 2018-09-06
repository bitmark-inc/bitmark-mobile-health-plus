import React, { Component } from 'react';
import {
  StyleSheet,
  Alert,
  Linking,
  Image, View, TouchableOpacity, Text, SafeAreaView,
} from 'react-native';

import ImagePicker from 'react-native-image-picker';
import { convertWidth, runPromiseWithoutError, FileUtil } from './../../utils';
import { config } from '../../configs';
import { constants } from '../../constants';
import { DataProcessor } from './../../processors';
import { Actions } from 'react-native-router-flux';
import { EventEmitterService } from '../../services';

let ComponentName = 'ComponentName';
export class UserComponent extends Component {
  constructor(props) {
    super(props);

    this.handerDonationInformationChange = this.handerDonationInformationChange.bind(this);
    EventEmitterService.remove(EventEmitterService.events.CHANGE_USER_DATA_DONATION_INFORMATION, null, ComponentName);
    EventEmitterService.remove(EventEmitterService.events.CHANGE_OTHER_USER_DATA_DONATION_INFORMATION, null, ComponentName);

    this.state = {
      numberHealthDataRecords: 0,
      numberHealthRecords: 0,
      isDisplayingAccountNumber: true,
    }
    runPromiseWithoutError(DataProcessor.doGetDonationInformation(DataProcessor.getAccountAccessSelected())).then(donationInformation => {
      if (donationInformation && donationInformation.error) {
        // TODO
        return;
      }
      let numberHealthDataRecords = 0;
      let numberHealthRecords = 0;
      donationInformation.completedTasks.forEach(item => {
        numberHealthDataRecords += item.taskType === donationInformation.commonTaskIds.bitmark_health_data ? 1 : 0;
        numberHealthRecords += item.taskType === donationInformation.commonTaskIds.bitmark_health_issuance ? 1 : 0;
      });
      this.setState({ numberHealthDataRecords, numberHealthRecords });
    });
  }

  componentDidMount() {
    EventEmitterService.on(EventEmitterService.events.CHANGE_USER_DATA_DONATION_INFORMATION, this.handerDonationInformationChange, ComponentName);
    EventEmitterService.on(EventEmitterService.events.CHANGE_OTHER_USER_DATA_DONATION_INFORMATION, this.handerDonationInformationChange, ComponentName);
  }

  handerDonationInformationChange({ donationInformation }) {
    let numberHealthDataRecords = 0;
    let numberHealthRecords = 0;
    donationInformation.completedTasks.forEach(item => {
      numberHealthDataRecords += item.taskType === donationInformation.commonTaskIds.bitmark_health_data ? 1 : 0;
      numberHealthRecords += item.taskType === donationInformation.commonTaskIds.bitmark_health_issuance ? 1 : 0;
    });
    this.setState({ numberHealthDataRecords, numberHealthRecords });
  }

  captureAsset() {
    let options = {
      title: 'Capture asset'
    };

    ImagePicker.showImagePicker(options, (response) => {

      if (response.didCancel) {
        return;
      }
      if (response.error) {
        Alert.alert('Permission error!', response.error, [{
          text: 'Enable',
          onPress: () => Linking.openURL('app-settings:')
        }, {
          text: 'Cancel',
          style: 'cancel',
        }]);
        return;
      }
      let filePath = response.uri.replace('file://', '');
      filePath = decodeURIComponent(filePath);

      // Move file from "tmp" folder to "cache" folder
      let fileName = response.fileName ? response.fileName : response.uri.substring(response.uri.lastIndexOf('/') + 1);
      let timestamp = response.timestamp ? response.timestamp : new Date().toISOString();
      let destPath = FileUtil.CacheDirectory + '/' + fileName;
      FileUtil.moveFileSafe(filePath, destPath);
      filePath = destPath;
      Actions.captureAsset({ filePath, timestamp })
    });
  }

  render() {
    return (
      <SafeAreaView style={styles.bodySafeView}>
        <View style={styles.body}>
          <TouchableOpacity style={styles.bodyContent} onPress={() => this.setState({ isDisplayingAccountNumber: true })} activeOpacity={1}>
            <View style={styles.dataArea}>
              <TouchableOpacity style={{ flex: 1 }} disabled={this.state.numberHealthDataRecords === 0} onPress={() => Actions.bitmarkList({ bitmarkType: 'bitmark_health_data' })}>
                <Text style={styles.dataTitle}><Text style={{ color: '#FF1829' }}>{this.state.numberHealthDataRecords}</Text> Weeks of Health Data{this.state.numberHealthDataRecords > 1 ? 's' : ''}</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.dataArea, { borderTopColor: '#FF1829', borderTopWidth: 1 }]}>
              <TouchableOpacity style={{ flex: 1 }} disabled={this.state.numberHealthRecords === 0} onPress={() => Actions.bitmarkList({ bitmarkType: 'bitmark_health_issuance' })}>
                <Text style={styles.dataTitle}><Text style={{ color: '#FF1829' }}>{this.state.numberHealthRecords}</Text> Health Record{this.state.numberHealthRecords > 1 ? 's' : ''}</Text>
              </TouchableOpacity>
              {this.state.isDisplayingAccountNumber && !DataProcessor.getAccountAccessSelected() && <TouchableOpacity style={styles.addHealthRecordButton} onPress={this.captureAsset.bind(this)}>
                <Image style={styles.addHealthRecordButtonIcon} source={require('./../../../assets/imgs/plus_icon_red.png')} />
                <Text style={styles.addHealthRecordButtonText} > {'Add records'.toUpperCase()}</Text>
              </TouchableOpacity>}
            </View>
          </TouchableOpacity>
          {!DataProcessor.getAccountAccessSelected() && <View style={styles.accountArea}>
            <TouchableOpacity style={styles.accountButton} onPress={() => this.setState({ isDisplayingAccountNumber: !this.state.isDisplayingAccountNumber })}>
              <Text style={styles.accountButtonText}>
                {this.state.isDisplayingAccountNumber ? ('[' + DataProcessor.getUserInformation().bitmarkAccountNumber.substring(0, 4) + '...' + DataProcessor.getUserInformation().bitmarkAccountNumber.substring(DataProcessor.getUserInformation().bitmarkAccountNumber.length - 4, DataProcessor.getUserInformation().bitmarkAccountNumber.length) + ']') : ''}
              </Text>
            </TouchableOpacity>
          </View>}
          {!this.state.isDisplayingAccountNumber && !DataProcessor.getAccountAccessSelected() && <View style={styles.overlapButtonsArea}>
            <TouchableOpacity style={[styles.accountButton, { height: 45, width: '100%', backgroundColor: '#FF4444' }]} onPress={Actions.account}>
              <Text style={[styles.accountButtonText, { color: 'white', fontWeight: '700', }]}>ACCOUNT SETTING</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.accountButton, { height: 45, width: '100%', backgroundColor: '#FF4444', marginTop: 1 }]} onPress={Actions.grantingAccess}>
              <Text style={[styles.accountButtonText, { color: 'white', fontWeight: '700', }]}>GRANT ACCESS</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.accountButton, { height: 45, width: '100%', backgroundColor: '#FF4444', marginTop: 1 }]} onPress={Actions.otherAccounts}>
              <Text style={[styles.accountButtonText, { color: 'white', fontWeight: '700', }]}>VIEW OTHER ACCOUNT</Text>
            </TouchableOpacity>
          </View>}
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
    borderWidth: 1,
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
    color: '#464626'
  },
  addHealthRecordButton: {
    position: 'absolute',
    left: convertWidth(16), bottom: convertWidth(22),
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
    width: '100%', height: 38,
    borderColor: '#FF1829', borderTopWidth: 0, borderWidth: 1,
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
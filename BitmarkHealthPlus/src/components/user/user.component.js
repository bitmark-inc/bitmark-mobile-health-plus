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

  captureAsset() {
    let options = {
      title: 'Capture asset'
    };

    ImagePicker.showImagePicker(options, async (response) => {

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
      let destPath = FileUtil.CacheDirectory + '/' + DataProcessor.getUserInformation().bitmarkAccountNumber + '/' + fileName;
      await FileUtil.moveFileSafe(filePath, destPath);
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
              <TouchableOpacity disabled={this.state.numberHealthDataBitmarks === 0} onPress={() => Actions.bitmarkList({ bitmarkType: 'bitmark_health_data' })}>
                <Text style={styles.dataTitle}><Text style={{ color: '#FF1829' }}>{this.state.numberHealthDataBitmarks}</Text> Weeks of Health Data{this.state.numberHealthDataBitmarks > 1 ? 's' : ''}</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.dataArea, { borderTopColor: '#FF1829', borderTopWidth: 1 }]}>
              <TouchableOpacity disabled={this.state.numberHealthAssetBitmarks === 0} onPress={() => Actions.bitmarkList({ bitmarkType: 'bitmark_health_issuance' })}>
                <Text style={styles.dataTitle}><Text style={{ color: '#FF1829' }}>{this.state.numberHealthAssetBitmarks}</Text> Health Record{this.state.numberHealthAssetBitmarks > 1 ? 's' : ''}</Text>
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
                {this.state.isDisplayingAccountNumber ? ('ACCOUNT') : ''}
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
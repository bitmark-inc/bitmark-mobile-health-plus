import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  Alert,
  Image, View, TouchableOpacity, Text, SafeAreaView,
} from 'react-native';
import randomString from "random-string";

import { convertWidth, FileUtil } from '../../utils';
import { config } from '../../configs';
import { constants } from '../../constants';
import { AppProcessor, DataProcessor } from '../../processors';
import { Actions } from 'react-native-router-flux';
import { EventEmitterService } from '../../services';

export class CaptureAssetComponent extends Component {
  static propTypes = {
    filePath: PropTypes.string,
    timestamp: PropTypes.any,
  };
  constructor(props) {
    super(props);
  }

  issueFile() {
    let filePath = this.props.filePath;
    AppProcessor.doCheckFileToIssue(filePath).then(({ asset }) => {
      if (asset && asset.name) {

        let message = asset.registrant === DataProcessor.getUserInformation().bitmarkAccountNumber
          ? 'You have already registered this image. '
          : 'The image has already issued by other account.';
        Alert.alert('', message, [{
          text: 'OK', style: 'cancel'
        }]);
      } else {
        // Do issue
        let metadataList = [];
        metadataList.push({ label: 'Source', value: 'Health Records' });
        metadataList.push({ label: 'Saved Time', value: new Date(this.props.timestamp).toISOString() });
        let assetName = `HA${randomString({ length: 8, numeric: true, letters: false, })}`;
        AppProcessor.doIssueFile(filePath, assetName, metadataList, 1, false, {
          indicator: true, title: 'Encrypting and protecting your health record...', message: ''
        }).then((data) => {
          if (data) {
            FileUtil.removeSafe(filePath);
            Actions.pop();
          }
        }).catch(error => {
          Alert.alert('Error', 'There was a problem issuing bitmark. Please try again.');
          console.log('issue bitmark error :', error);
        });
      }
    }).catch(error => {
      console.log('Check file error :', error);
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
    });
  }


  render() {
    return (
      <SafeAreaView style={styles.bodySafeView}>
        <View style={styles.bodyContent}>
          <View style={[styles.header, config.isIPhoneX ? { paddingTop: constants.iPhoneXStatusBarHeight } : {}]}>
            <Text style={styles.headerTitle}>CAPTURE</Text>
            <TouchableOpacity onPress={Actions.pop}>
              <Image style={styles.backIcon} source={require('./../../../assets/imgs/close_icon_white.png')} />
            </TouchableOpacity>
          </View>
          <View style={[styles.content]}>
            <Image style={styles.previewImage} source={{ uri: 'file://' + this.props.filePath }} />
          </View>
          <View style={styles.lastBottomButtonArea}>
            <TouchableOpacity style={styles.lastBottomButton} onPress={this.issueFile.bind(this)}>
              <Text style={styles.lastBottomButtonText}>USE IMAGE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  bodySafeView: {
    flex: 1,
    backgroundColor: 'black',
  },
  bodyContent: {
    flex: 1,
    flexDirection: 'column',
    width: "100%",
  },
  header: {
    height: (config.isIPhoneX ? constants.iPhoneXStatusBarHeight : 0) + 44,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: convertWidth(20),
    paddingRight: convertWidth(20),
    borderBottomWidth: 0.3,
  },
  headerTitle: {
    fontFamily: 'Avenir black',
    fontSize: 28,
    fontWeight: '900',
    color: 'white',
  },
  backIcon: {
    height: convertWidth(21),
    width: convertWidth(21),
    marginLeft: convertWidth(19),
    resizeMode: 'contain'
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  previewImage: {
    width: convertWidth(375),
    height: convertWidth(375),
    resizeMode: 'contain'
  },


  lastBottomButtonArea: {
    padding: convertWidth(20),
  },
  lastBottomButton: {
    height: constants.buttonHeight,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF4444',
  },
  lastBottomButtonText: {
    fontFamily: 'Avenir black',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    color: 'white',
  },

});
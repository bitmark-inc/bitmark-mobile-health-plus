import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  Alert,
  Linking,
  Image, View, TouchableOpacity, Text, SafeAreaView,
} from 'react-native';
import randomString from "random-string";

import { convertWidth, FileUtil } from '../../utils';
import { config } from '../../configs';
import { constants } from '../../constants';
import { AppProcessor } from '../../processors';
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
    AppProcessor.doCheckFileToIssue(filePath).then(({ asset, bitmark }) => {
      if (asset && asset.name) {

        Alert.alert('', 'This data has registered before, please select another data to register again. You also can view the public information of the data registration.', [{
          text: 'Cancel', style: 'cancel'
        }, {
          text: 'View',
          onPress: () => Linking.openURL(config.registry_server_url + `/bitmark/${bitmark.id}`)
        }]);
      } else {
        // Do issue
        let metadataList = [];
        metadataList.push({ label: 'Source', value: 'Bitmark Health' });
        metadataList.push({ label: 'Saved Time', value: new Date(this.props.timestamp).toISOString() });
        let assetName = `HA${randomString({ length: 8, numeric: true, letters: false, })}`;
        AppProcessor.doIssueFile(filePath, assetName, metadataList, 1, false, {
          indicator: true, title: 'Encrypting and protecting your health data...', message: ''
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
            <TouchableOpacity style={styles.headerLeft} />
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>CAPTURE</Text>
            </View>
            <TouchableOpacity style={styles.headerRight} onPress={Actions.pop}>
              <Text>Cancel</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.content]}>
            <Image style={styles.previewImage} source={{ uri: 'file://' + this.props.filePath }} />
          </View>
          <TouchableOpacity style={styles.lastBottomButton} onPress={this.issueFile.bind(this)}>
            <Text style={styles.lastBottomButtonText}>USE IMAGE</Text>
          </TouchableOpacity>
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
    backgroundColor: 'white',
  },
  header: {
    height: (config.isIPhoneX ? constants.iPhoneXStatusBarHeight : 0) + 44,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLeft: {
    width: convertWidth(70),
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'Avenir black',
    fontSize: 18,
    fontWeight: '900',
  },
  headerRight: {
    width: convertWidth(70),
  },
  content: {
    flex: 1,
  },
  previewImage: {
    height: '100%',
    resizeMode: 'contain'
  },



  lastBottomButton: {
    height: constants.buttonHeight,
    width: convertWidth(375),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
  },
  lastBottomButtonText: {
    fontFamily: 'Avenir black',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    color: 'white',
  },

});
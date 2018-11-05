import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  Image, View, TouchableOpacity, Text, SafeAreaView,
} from 'react-native';
import randomString from "random-string";

import { convertWidth, issue, populateAssetNameFromImage, generateThumbnail } from '../../utils';
import { config } from '../../configs';
import { constants } from '../../constants';
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

  async issueFile() {
    let filePath = this.props.filePath;
    let assetName = `HA${randomString({ length: 8, numeric: true, letters: false, })}`;
    let metadataList = [];
    metadataList.push({ label: 'Source', value: 'Health Records' });
    metadataList.push({ label: 'Saved Time', value: new Date(this.props.timestamp).toISOString() });

    EventEmitterService.emit(EventEmitterService.events.APP_PROCESSING, true);
    assetName = await populateAssetNameFromImage(filePath, assetName);
    EventEmitterService.emit(EventEmitterService.events.APP_PROCESSING, false);
    issue(filePath, assetName, metadataList, 'image', 1, async (data) => {
      let bitmarkId = data[0].id;
      // TODO
      let isMultipleAsset = false;
      await generateThumbnail(filePath, bitmarkId, isMultipleAsset);
      Actions.assetNameInform({ assetName });
    });
  }


  render() {
    return (
      <SafeAreaView style={styles.bodySafeView}>
        <View style={styles.bodyContent}>
          <View style={[styles.header, config.isIPhoneX ? { paddingTop: constants.iPhoneXStatusBarHeight } : {}]}>
            <Text style={styles.headerTitle}>{i18n.t('CaptureAssetComponent_headerTitle')}</Text>
            <TouchableOpacity onPress={Actions.pop}>
              <Image style={styles.backIcon} source={require('./../../../assets/imgs/close_icon_white.png')} />
            </TouchableOpacity>
          </View>
          <View style={[styles.content]}>
            <Image style={styles.previewImage} source={{ uri: 'file://' + this.props.filePath }} />
          </View>
          <View style={styles.lastBottomButtonArea}>
            <TouchableOpacity style={styles.lastBottomButton} onPress={this.issueFile.bind(this)}>
              <Text style={styles.lastBottomButtonText}>{i18n.t('CaptureAssetComponent_lastBottomButtonText')}</Text>
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
    fontFamily: config.localization === 'vi-US' ? null : 'Avenir black',
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
    fontFamily: config.localization === 'vi-US' ? null : 'Avenir black',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    color: 'white',
  },

});
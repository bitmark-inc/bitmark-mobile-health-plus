import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactNative, {
  StyleSheet,
  Alert,
  Image, View, SafeAreaView, TouchableOpacity, Text, ScrollView,
} from 'react-native';
let { ActionSheetIOS } = ReactNative;
import JSONTree from 'react-native-json-tree';
import { Map } from 'immutable'

import { Actions } from 'react-native-router-flux';
import { runPromiseWithoutError, FileUtil, searchAgain, convertWidth } from 'src/utils';
import { EventEmitterService, AppProcessor } from 'src/processors';
import { config, constants } from 'src/configs';

export class BitmarkDetailComponent extends Component {
  static propTypes = {
    bitmarkType: PropTypes.string,
    bitmark: PropTypes.any,
  };
  constructor(props) {
    super(props);
    this.state = {
      filePath: this.props.bitmarkType === 'bitmark_health_issuance' ? this.props.bitmark.asset.filePath : '',
      content: '',
    };

    if (this.props.bitmark) {
      if (this.props.bitmarkType === 'bitmark_health_data') {
        runPromiseWithoutError(FileUtil.readFile(this.props.bitmark.asset.filePath)).then(result => {
          if (result && result.error) {
            console.log('error:', result.error);
            EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error: result.error, onClose: Actions.pop });
            return;
          }
          result.immutable = Map({ key: 'value' });
          this.setState({ content: JSON.parse(result) });
        });
      } else if (this.props.bitmarkType !== 'bitmark_health_issuance') {
        Actions.pop();
      }
    } else {
      Alert.alert(i18n.t('BitmarkDetailComponent_alertTitle1'), i18n.t('BitmarkDetailComponent_alertMessage1'), [{
        text: 'OK', onPress: Actions.pop
      }]);
    }
  }

  deleteBitmark() {
    ActionSheetIOS.showActionSheetWithOptions({
      title: i18n.t('BitmarkDetailComponent_titleDeleteModal'),
      options: [i18n.t('BitmarkDetailComponent_cancelButtonDeleteModal'), i18n.t('BitmarkDetailComponent_deleteButtonDeleteModal')],
      destructiveButtonIndex: 1,
      cancelButtonIndex: 0,
    },
      (buttonIndex) => {
        if (buttonIndex === 1) {
          AppProcessor.doTransferBitmark(this.props.bitmark, config.zeroAddress).then(async () => {
            await searchAgain();
            Actions.pop();
          }).catch(error => {
            console.log('error:', error);
            EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
          })
        }
      });
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <SafeAreaView style={[styles.bodySafeView]}>
          <View style={styles.body}>
            <View style={styles.bodyContent}>
              <View style={styles.titleRow}>
                {/*BACK ICON*/}
                <TouchableOpacity style={styles.closeButton} onPress={Actions.pop}>
                  <Image style={styles.closeIcon} source={require('assets/imgs/back_icon_red.png')} />
                </TouchableOpacity>
                {/*NAME*/}
                <Text style={styles.titleText} numberOfLines={1}>{this.props.bitmark.asset.name}</Text>
                {/*TAG ICON*/}
                {this.props.bitmarkType === 'bitmark_health_issuance' &&
                  <TouchableOpacity style={this.props.bitmark.status !== 'pending' ? styles.taggingButton : styles.taggingButtonForPending} onPress={() => Actions.tagging({ bitmarkId: this.props.bitmark.id })}>
                    <Image style={styles.taggingIcon} source={require('assets/imgs/tagging.png')} />
                  </TouchableOpacity>
                }
                {/*DELETE ICON*/}
                {this.props.bitmark.status !== 'pending' && this.props.bitmarkType === 'bitmark_health_issuance' && <TouchableOpacity style={styles.deleteButton} onPress={this.deleteBitmark.bind(this)}>
                  <Image style={styles.closeIcon} source={require('assets/imgs/delete_icon_red.png')} />
                </TouchableOpacity>}
              </View>
              <View style={[styles.content, this.props.bitmarkType === 'bitmark_health_issuance' ? { padding: 0, } : {}]}>
                <ScrollView style={styles.contentScroll} contentContainerStyle={{ flex: 1, }} scrollEnabled={this.props.bitmarkType !== 'bitmark_health_issuance'}>
                  {this.props.bitmarkType === 'bitmark_health_issuance' && !!this.state.filePath &&
                    <TouchableOpacity style={styles.bitmarkImageArea} onPress={() => Actions.fullViewCaptureAsset({
                      filePath: this.state.filePath,
                      title: this.props.bitmark.asset.name
                    })}>
                      <Image style={styles.bitmarkImage} source={{ uri: this.props.bitmark.thumbnail ? this.props.bitmark.thumbnail.path : this.state.filePath }} />
                      <View style={styles.fullViewButton}>
                        <Image style={styles.fullViewIcon} source={require('assets/imgs/full_view_icon.png')} />
                        <Text style={styles.fullViewButtonText}>{i18n.t('BitmarkDetailComponent_fullViewButtonText')}</Text>
                      </View>
                    </TouchableOpacity>}

                  {this.props.bitmarkType === 'bitmark_health_data' && <ScrollView style={styles.bitmarkContent} contentContainerStyle={{ flexGrow: 1, }}>
                    <ScrollView horizontal={true}>
                      <JSONTree data={this.state.content}
                        getItemString={() => <Text></Text>}
                        labelRenderer={raw => <Text style={{ color: 'black', fontWeight: '500', fontFamily: 'Avenir' }}>{raw}</Text>}
                        valueRenderer={raw => <Text style={{ color: '#FF4444', fontFamily: 'Avenir' }}>{raw}</Text>}
                        hideRoot={true}
                        theme={{
                          scheme: 'monokai',
                          author: 'wimer hazenberg (http://www.monokai.nl)',
                          base00: '#000000',
                          base01: '#383830',
                          base02: '#49483e',
                          base03: '#75715e',
                          base04: '#a59f85',
                          base05: '#f8f8f2',
                          base06: '#f5f4f1',
                          base07: '#f9f8f5',
                          base08: '#f92672',
                          base09: '#fd971f',
                          base0A: '#f4bf75',
                          base0B: '#a6e22e',
                          base0C: '#a1efe4',
                          base0D: '#FF4444',
                          base0E: '#ae81ff',
                          base0F: '#cc6633'
                        }}
                      />
                    </ScrollView>
                  </ScrollView>}
                </ScrollView>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>
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
    borderColor: "#FF4444",
    width: "100%",
  },

  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 54,
    width: '100%',
    borderBottomColor: '#FF4444', borderBottomWidth: 1,
  },
  titleText: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Avenir Black',
    fontWeight: '900',
    flex: 1,
    fontSize: 24,
    marginTop: 12,
  },
  closeButton: {
    height: '100%',
    paddingRight: convertWidth(10),
    paddingLeft: convertWidth(15),
    alignItems: 'center', justifyContent: 'center',
  },
  deleteButton: {
    height: '100%',
    paddingRight: convertWidth(20),
    paddingLeft: convertWidth(15),
    alignItems: 'center', justifyContent: 'center',
  },
  closeIcon: {
    width: convertWidth(21),
    height: convertWidth(21),
    resizeMode: 'contain',
  },
  taggingButton: {
    height: '100%',
    paddingLeft: convertWidth(15),
    alignItems: 'center', justifyContent: 'center',
  },
  taggingButtonForPending: {
    height: '100%',
    paddingRight: convertWidth(20),
    paddingLeft: convertWidth(15),
    alignItems: 'center', justifyContent: 'center',
  },
  taggingIcon: {
    width: convertWidth(21),
    height: convertWidth(21),
    resizeMode: 'contain',
  },

  content: {
    flex: 1,
    padding: convertWidth(26),
    paddingTop: convertWidth(0),
  },
  contentScroll: {
    flexDirection: 'column',
  },
  fullViewButton: {
    position: 'absolute', bottom: 20, width: '100%',
    justifyContent: 'center', flexDirection: 'row', alignItems: 'center'
  },
  fullViewIcon: {
    width: 14, height: 17, resizeMode: 'contain', marginRight: 15,
  },
  fullViewButtonText: {
    textAlign: 'center', color: '#FF1F1F', fontSize: 16, fontWeight: '600'
  },

  bitmarkImageArea: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  bitmarkImage: {
    height: '100%',
    width: '100%',
    resizeMode: 'contain',
  },
  bitmarkContent: {
    paddingTop: convertWidth(20),
    flex: 1,
  },

});
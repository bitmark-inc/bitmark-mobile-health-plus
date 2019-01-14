import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactNative, {
  StyleSheet,
  Alert,
  Image, View, SafeAreaView, TouchableOpacity, Text, ScrollView, ImageBackground,
} from 'react-native';
let { ActionSheetIOS } = ReactNative;
import JSONTree from 'react-native-json-tree';
import { Map } from 'immutable'

import { Actions } from 'react-native-router-flux';
import { runPromiseWithoutError, FileUtil, convertWidth } from 'src/utils';
import { EventEmitterService, AppProcessor, IndexDBService, CacheData } from 'src/processors';
import { config } from 'src/configs';
import { searchAgain } from 'src/views/controllers';
import moment from "moment/moment";
import { styles as cardStyles } from "./card/bitmark-card.style.component";
import { humanFileSize } from "../../../utils";

export class BitmarkDetailComponent extends Component {
  static propTypes = {
    bitmarkType: PropTypes.string,
    bitmark: PropTypes.any,
    resetToInitialState: PropTypes.func,
    goBack: PropTypes.func
  };
  constructor(props) {
    super(props);
    this.state = {
      filePath: this.props.bitmarkType === 'bitmark_health_issuance' ? this.props.bitmark.asset.filePath : '',
      content: '',
    };

    if (this.props.bitmark) {
      if (this.props.bitmarkType === 'bitmark_health_data') {
        runPromiseWithoutError(FileUtil.readFile(this.props.bitmark.asset.viewFilePath)).then(result => {
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

  async componentDidMount() {
    let fileStat = await FileUtil.stat(this.props.bitmark.asset.filePath);
    let tags = await IndexDBService.getTagsByBitmarkId(this.props.bitmark.id);
    let note = await IndexDBService.getNoteByBitmarkId(this.props.bitmark.id);

    this.setState({ fileSize: humanFileSize(fileStat.size), tags, note });
  }

  deleteBitmark(bitmarkType) {
    ActionSheetIOS.showActionSheetWithOptions({
      title: `This ${bitmarkType == 'bitmark_health_data' ? 'health data' : 'medical record'} will be deleted`,
      options: [i18n.t('BitmarkDetailComponent_cancelButtonDeleteModal'), i18n.t('BitmarkDetailComponent_deleteButtonDeleteModal')],
      destructiveButtonIndex: 1,
      cancelButtonIndex: 0,
    },
      (buttonIndex) => {
        if (buttonIndex === 1) {
          AppProcessor.doTransferBitmark(this.props.bitmark, config.zeroAddress).then(async () => {
            await searchAgain();
            this.props.resetToInitialState && this.props.resetToInitialState();
            Actions.pop();
          }).catch(error => {
            console.log('error:', error);
            EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
          })
        }
      });
  }

  doUpdateTagsAndNote(tags, note) {
    this.setState({ tags, note });
  }

  render() {
    let bitmark = this.props.bitmark;
    let bitmarkType = this.props.bitmarkType;
    let tags = this.state.tags;
    let note = this.state.note;

    return (
      <SafeAreaView style={[styles.bodySafeView]}>
        <View style={styles.body}>
          <View style={styles.bodyContent}>
            {/*TOP BAR*/}
            <View style={styles.topBar}>
              {/*Back Icon*/}
              <TouchableOpacity style={styles.closeButton} onPress={this.props.goBack || Actions.pop}>
                <Image style={styles.closeIcon} source={require('assets/imgs/back-icon-black.png')} />
              </TouchableOpacity>
              {/*MMR Icon*/}
              <TouchableOpacity onPress={() => { Actions.mmrInformation() }}>
                <Image style={styles.profileIcon} source={(CacheData.userInformation.currentMMrData && CacheData.userInformation.currentMMrData.avatar) ? {
                  uri: CacheData.userInformation.currentMMrData.avatar
                } : require('assets/imgs/profile-icon.png')} />
              </TouchableOpacity>
            </View>

            {/*CONTENT*/}
            <View style={{ flex: 1, padding: convertWidth(16) }}>
              <View style={[cardStyles.cardContainer, { flex: 1 }]}>
                {/*IMAGE*/}
                <View style={[cardStyles.cardImageContainer]}>
                  <TouchableOpacity onPress={() => {
                    if (bitmark.thumbnail && bitmark.thumbnail.path) {
                      Actions.fullViewCaptureAsset({
                        filePath: this.state.filePath,
                        title: this.props.bitmark.asset.name
                      });
                    }
                  }}>
                    {bitmarkType !== 'bitmark_health_issuance' ? (
                      <Image style={cardStyles.cardImage} source={require('assets/imgs/health-data-thumbnail.png')} />
                    ) : (
                        (bitmark.thumbnail && bitmark.thumbnail.path) ? (
                          <View>
                            {/*Thumbnail*/}
                            <Image style={cardStyles.cardImage} source={{ uri: bitmark.thumbnail.path }} />
                          </View>
                        ) : (
                            <Image style={cardStyles.cardImage} source={require('assets/imgs/unknown-file-thumbnail.png')} />
                          )
                      )
                    }

                    {/*Cover thumbnail linear gradient header bar*/}
                    <Image source={require('assets/imgs/linear-gradient-transparent-background.png')} style={[cardStyles.cardImage, cardStyles.coverThumbnailHeaderBar]}>
                    </Image>

                    {/*Zoom in icon*/}
                    {bitmark.thumbnail && bitmark.thumbnail.path &&
                      <Image style={styles.zoomInIcon} source={require('assets/imgs/zoom-in-icon.png')} />
                    }
                  </TouchableOpacity>

                  {/*Multiple files icon*/}
                  {bitmark.thumbnail && bitmark.thumbnail.multiple &&
                    <ImageBackground style={styles.multipleFilesIcon} source={require('assets/imgs/multiple-files-icon.png')} >
                      {bitmark.asset.metadata['Number Of Files'] && <View style={styles.multipleFilesArea}>
                        <Text style={[styles.multipleFilesText, {}]}>{bitmark.asset.metadata['Number Of Files']}</Text>
                      </View>}
                    </ImageBackground>
                  }
                </View>

                {/*TOP BAR*/}
                <View style={[cardStyles.cardTopBar]}>
                  <Text style={[cardStyles.cardTitle]}>{bitmarkType == 'bitmark_health_issuance' ? 'MEDICAL RECORD' : 'HEALTH KIT DATA'}</Text>
                  <Image style={cardStyles.cardIcon} source={bitmarkType == 'bitmark_health_issuance' ? require('assets/imgs/medical-record-card-icon.png') : require('assets/imgs/health-data-card-icon.png')} />
                </View>

                {/*CONTENT*/}
                <View style={[cardStyles.cardContent, { flex: 1 }]}>
                  <View style={{ width: '100%' }}>
                    {/*Name*/}
                    <Text style={[cardStyles.cardHeader]}>{bitmark.asset.name}</Text>
                    {/*Status*/}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={[cardStyles.cardText]}>{bitmark.asset.created_at ? ((bitmarkType == 'bitmark_health_issuance' ? 'ADDED ON ' : 'RECORDED ON ') + moment(bitmark.asset.created_at).format('MMM DD, YYYY').toUpperCase()) : 'REGISTERING...'}</Text>
                      {this.state.fileSize &&
                        <Text style={[cardStyles.cardText]}>{this.state.fileSize}</Text>
                      }
                    </View>
                  </View>

                  {/*Notes*/}
                  {bitmarkType == 'bitmark_health_issuance' && <View style={{ flex: 1 }}>
                    <View style={[styles.notesContainer, { flex: 1, }]}>
                      <Text style={[styles.notesText, { fontFamily: 'AvenirNextW1G-Bold', marginBottom: 10, }]}>Notes:</Text>
                      <ScrollView>
                        {!!note &&
                          <Text style={[styles.notesText]}>{note}</Text>
                        }
                      </ScrollView>
                    </View>
                    <View style={[styles.notesContainer]}>
                      <Text style={[styles.notesText, { fontFamily: 'AvenirNextW1G-Bold' }]}>Tags:</Text>

                      <View style={[styles.tagsContainer]}>
                        {/*Tag icon*/}
                        <Image style={styles.taggingIcon} source={require('assets/imgs/tag-icon.png')} />
                        <ScrollView horizontal={true}>
                          {(tags && tags.length) ? (
                            (tags || []).map(tag => {
                              return (
                                <View key={tag} style={styles.taggingItemContainer}>
                                  <Text style={styles.taggingItem}>#{tag.toUpperCase()}</Text>
                                </View>
                              );
                            })
                          ) : null
                          }
                        </ScrollView>
                      </View>
                    </View>
                  </View>
                  }

                  {/*Json View Tree*/}
                  {bitmarkType === 'bitmark_health_data' && <ScrollView style={styles.healthDataViewer} contentContainerStyle={{ paddingBottom: 20 }}>
                    <ScrollView horizontal={true} >
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
                  </ScrollView>
                  }

                  {/*Buttons*/}
                  <View style={[styles.actionsContainer]}>
                    {/*Edit icon*/}
                    {this.props.bitmarkType == 'bitmark_health_issuance' &&
                      <TouchableOpacity style={{
                        padding: 5, paddingLeft: 0, paddingRight: 10,
                      }} onPress={() => Actions.editBitmark({ bitmark, bitmarkType: this.props.bitmarkType, tags: tags, note, doUpdateTagsAndNote: this.doUpdateTagsAndNote.bind(this) })}>
                        <Image style={styles.taggingIcon} source={require('assets/imgs/edit-icon.png')} />
                      </TouchableOpacity>
                    }

                    {/*Delete Icon*/}
                    {this.props.bitmark.status !== 'pending' &&
                      <TouchableOpacity style={{
                        padding: 5, paddingLeft: 0, paddingRight: 10,
                        marginLeft: this.props.bitmarkType == 'bitmark_health_issuance' ? 10 : 0
                      }} onPress={() => { this.deleteBitmark.bind(this)(bitmarkType) }}>
                        <Image style={[styles.closeIcon, {}]} source={require('assets/imgs/delete-icon.png')} />
                      </TouchableOpacity>}
                  </View>
                </View>
              </View>
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
    flex: 1,
    paddingBottom: convertWidth(16),
  },
  bodyContent: {
    flex: 1,
    flexDirection: 'column',
    width: "100%",
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    width: '100%',
  },
  closeButton: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 5, paddingLeft: convertWidth(16),
  },
  closeIcon: {
    width: convertWidth(16),
    height: convertWidth(16),
    resizeMode: 'contain',
  },
  profileIcon: {
    width: 32,
    height: 32,
    resizeMode: 'cover',
    marginRight: convertWidth(16),
    borderWidth: 0.1, borderRadius: 16, borderColor: 'white',
  },
  zoomInIcon: {
    position: 'absolute',
    width: 18,
    height: 18,
    top: 33,
    left: 14,
  },
  multipleFilesIcon: {
    position: 'absolute',
    width: 22, height: 22,
    bottom: 15, right: 15,
    justifyContent: 'center', alignItems: 'center',
  },
  multipleFilesArea: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    width: '100%',
    paddingLeft: 5, paddingBottom: 2,
  },
  multipleFilesText: {
    fontFamily: 'Andale Mono', fontSize: 12, textAlign: 'center', textAlignVertical: 'center',
  },
  notesContainer: {
    marginTop: 25,
  },
  notesText: {
    fontFamily: 'AvenirNextW1G-Light',
    fontSize: 14,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  taggingIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
  taggingItemContainer: {
    flexDirection: 'row',
    padding: 5,
    paddingTop: 5,
    paddingBottom: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    marginLeft: 10,
    borderRadius: 4,
  },
  taggingItem: {
    fontFamily: 'Andale Mono',
    fontSize: 10,
    fontWeight: '300',
    color: 'rgba(0, 0, 0, 0.87)',
  },
  actionsContainer: {
    marginTop: 35,
    flexDirection: 'row'
  },
  healthDataViewer: {
    backgroundColor: 'white',
    marginTop: 20,
    flex: 1,
    maxHeight: 300,
  },
});
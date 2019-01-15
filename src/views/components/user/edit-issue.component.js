import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View, TouchableOpacity, Text, Image, ScrollView, TextInput, SafeAreaView, KeyboardAvoidingView,
} from 'react-native';
import SortableGrid from 'react-native-sortable-grid';

import { Actions } from 'react-native-router-flux';
import moment from 'moment';
import { convertWidth } from 'src/utils';
import { AppProcessor, EventEmitterService } from 'src/processors';
import { InputTagComponent } from "./tag/input-tag.component";
import { ShadowTopComponent, ShadowComponent } from "src/views/commons";
import { config } from 'src/configs';


class ItemOrderImageComponent extends Component {
  static propTypes = {
    uri: PropTypes.string,
    index: PropTypes.number,
  };

  constructor(props) {
    super(props);
    this.state = {
      index: this.props.index,
      uri: this.props.uri,
    };
  }

  changeData({ uri, index }) {
    uri = uri || this.state.uri;
    this.setState({ uri, index });
  }

  render() {
    return (<View style={{ justifyContent: 'center', alignItems: 'center', flex: 1, }}  >
      <View style={{
        position: 'absolute', bottom: 10, right: 10, height: convertWidth(24), width: convertWidth(24),
        backgroundColor: 'rgba(255, 0, 60, 0.3)',
        alignItems: 'center', justifyContent: 'center',
        borderRadius: convertWidth(12),
        zIndex: 1,
      }}>
        <Text style={{ fontFamily: 'AvenirNextW1G-Bold', color: 'white', flex: 1, fontSize: 12, lineHeight: 20, marginTop: 1 }}>{this.state.index + 1}</Text>
      </View>
      <Image style={{ width: convertWidth(100), height: convertWidth(100), resizeMode: 'cover', borderRadius: 4 }} source={{ uri: this.state.uri }} />
    </View>);
  }
}

export class EditIssueComponent extends Component {
  static propTypes = {
    // Image(s) file
    images: PropTypes.array,
    doIssueImage: PropTypes.func,
    // Unknown file
    issueParams: PropTypes.any,
    doIssue: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = { note: '', type: 'combine', scrollEnabled: true, itemOrder: null, tags: [] };
    this.itemOrderImageRefs = {};
    this.isSingleFile = !this.props.images || this.props.images.length == 1;
  }

  async continue() {
    if (this.isSingleFile) {
      if (this.props.images) {
        // Issue image
        let image = this.props.images[0];
        this.props.doIssueImage([{ uri: image.uri, createAt: image.createAt, note: this.state.note, tags: this.state.tags }], false);
      } else {
        // Issue unknown file
        let issueParams = this.props.issueParams;
        issueParams.note = this.state.note;
        issueParams.tags = this.state.tags;

        this.props.doIssue(issueParams);
      }
    } else {
      let newImages = [];
      if (this.state.itemOrder) {
        for (let item of this.state.itemOrder) {
          newImages.push(this.props.images[item.key]);
        }
      } else {
        newImages = this.props.images;
      }

      AppProcessor.doCombineImages(newImages).then((filePath) => {
        this.props.doIssueImage([{ uri: `file://${filePath}`, createAt: moment(), note: this.state.note, tags: this.state.tags, numberOfFiles: newImages.length }], true);
      }).catch(error => {
        EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
      })
    }
  }

  newOrder({ itemOrder }) {
    this.setState({ scrollEnabled: true, itemOrder: itemOrder });
    for (let index in this.itemOrderImageRefs) {
      this.itemOrderImageRefs[itemOrder[index].key].changeData({ index: itemOrder[index].order })
    }
  }

  onInputNoteChangeText(text) {
    this.setState({ note: (text || '').trim() });
  }

  showInputTag() {
    this.setState({ inputtingTag: true });
  }

  hideInputTag() {
    this.setState({ inputtingTag: false });
  }

  addTag(tag) {
    let tags = this.state.tags;
    tags.push(tag);
    this.setState({ tags });
  }

  removeTag(tag) {
    let tags = this.state.tags;

    if (tags.indexOf(tag) > -1) {
      tags = tags.filter(item => item != tag);
      this.setState({ tags });
    }
  }

  render() {
    let tags = this.state.tags;

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>

        {/*HEADER*/}
        <View style={[styles.header]}>
          {/*Back icon*/}
          <TouchableOpacity style={{ paddingLeft: convertWidth(16), paddingRight: 4, }} onPress={Actions.pop}>
            <Image style={{ width: 20, height: 20, resizeMode: 'contain' }} source={require('assets/imgs/back-icon-black.png')} />
          </TouchableOpacity>
          {/*Title*/}
          <Text style={styles.titleText}>Edit</Text>
          <Text style={{ paddingLeft: convertWidth(16) + 20 }} />
        </View>

        {/*CONTENT*/}
        <KeyboardAvoidingView behavior="padding" enabled style={styles.body} keyboardVerticalOffset={this.state.inputtingTag ? (88 + config.isIPhoneX ? 44 : 0) : 0} >
          <ScrollView style={{ flex: 1, width: '100%', }} contentContainerStyle={{
            flexGrow: 1,
            paddingLeft: convertWidth(16), paddingRight: convertWidth(16), paddingTop: 5,
          }}>
            {/*ATTACHED DOCUMENTS*/}
            {!this.isSingleFile &&
              <ShadowComponent style={{ margin: 2 }}>
                <View style={[styles.section]}>
                  {/*Top bar*/}
                  <ShadowTopComponent style={[styles.topBar]}>
                    <Text style={[styles.sectionTitle]}>ATTACHED DOCUMENTS</Text>
                  </ShadowTopComponent>

                  {/*Content*/}
                  <View style={[styles.contentContainer]}>
                    <Text style={styles.introductionTitle}>Arrange the photos</Text>
                    <Text style={styles.introductionDescription}>Drag and drop to rearrange photos.</Text>

                    {/*Images*/}
                    <ScrollView contentContainerStyle={{ flexGrow: 1, marginTop: 25, }} scrollEnabled={this.state.scrollEnabled}>
                      <SortableGrid
                        style={{ flex: 1, width: convertWidth(312), }}
                        itemsPerRow={3}
                        onDragRelease={this.newOrder.bind(this)}
                        onDragStart={() => this.setState({ scrollEnabled: false })} >
                        {
                          this.props.images.map((imageInfo, index) => {
                            return (<ItemOrderImageComponent uri={imageInfo.uri} index={index} key={index} ref={(ref) => {
                              if (this.state.itemOrder) {
                                this.itemOrderImageRefs[this.state.itemOrder[index].key] = ref;
                              } else {
                                this.itemOrderImageRefs[index] = ref
                              }
                            }} />);
                          })
                        }
                      </SortableGrid>
                    </ScrollView>
                  </View>
                </View>
              </ShadowComponent>
            }

            {/*NOTES*/}
            <ShadowComponent style={{ marginTop: this.isSingleFile ? 1.5 : 19 }}>
              <View style={[styles.section]}>
                {/*Top bar*/}
                <ShadowTopComponent style={[styles.topBar]}>
                  <Text style={[styles.sectionTitle]}>NOTES</Text>
                </ShadowTopComponent>

                {/*Content*/}
                <View style={[styles.contentContainer, { backgroundColor: '#F5F5F5' }]}>
                  <TextInput style={[styles.inputNote]}
                    multiline={true}
                    value={this.state.note}
                    placeholder={'Tap to add private notes to your record'}
                    onChangeText={(text) => this.onInputNoteChangeText.bind(this)(text)}
                  />
                </View>
              </View>
            </ShadowComponent>

            {/*TAGS*/}
            <ShadowComponent style={{ marginTop: 19 }}>
              <View style={[styles.section]}>
                {/*Top bar*/}
                <ShadowTopComponent style={[styles.topBar]}>
                  <Text style={[styles.sectionTitle]}>TAGS</Text>
                </ShadowTopComponent>

                {/*Content*/}
                <View style={[styles.contentContainer]}>
                  <Text style={styles.introductionTitle}>Add tags to your record</Text>
                  <Text style={styles.introductionDescription}>Record tagging — you can now add tags to your health records to help you search over them and find them faster in the future.</Text>
                </View>

                {/*Tags*/}
                <View style={[styles.bottomBar]}>
                  <ScrollView horizontal={true}>
                    <View style={[styles.tagIconContainer]}>
                      {/*Add tags*/}
                      <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }} onPress={this.showInputTag.bind(this)}>
                        <Image style={[styles.tagIcon]} source={require('assets/imgs/tag-icon-black.png')} />
                        <Text style={styles.addTagText}>+ADD TAGS</Text>
                      </TouchableOpacity>

                      {/*Tag items*/}
                      {(tags && tags.length) ? (
                        (tags || []).map((tag, index) => {
                          return (
                            <TouchableOpacity key={index} style={styles.taggingItemContainer} onPress={() => { this.removeTag.bind(this)(tag) }}>
                              <Text style={styles.taggingItem}>#{tag.toUpperCase()}</Text>
                              <Image style={[styles.removeTagIcon]} source={require('assets/imgs/remove-icon.png')} />
                            </TouchableOpacity>
                          );
                        })
                      ) : null
                      }
                    </View>
                  </ScrollView>
                </View>
              </View>
            </ShadowComponent>

            {/*BUTTON*/}
            <TouchableOpacity style={styles.saveButton} onPress={this.continue.bind(this)}>
              <Text style={styles.saveButtonText}>SAVE</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>

        {this.state.inputtingTag && <InputTagComponent tags={this.state.tags} addTag={this.addTag.bind(this)} hideInputTag={this.hideInputTag.bind(this)} />}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  body: {
    flex: 1, flexDirection: 'column', alignItems: 'center',
    backgroundColor: 'white',
  },
  header: {
    width: '100%',
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 24,
    fontFamily: 'AvenirNextW1G-Bold', textAlign: 'center',
    color: 'rgba(0, 0, 0, 0.87)',
  },
  section: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    width: '100%',
  },
  topBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start',
    height: 40,
  },
  bottomBar: {
    padding: convertWidth(16),
    paddingRight: 0,
    marginTop: 16,
    minHeight: 54,
    width: '100%',
    borderTopWidth: 0.5,
    borderColor: '#F4F2EE',
  },
  sectionTitle: {
    paddingLeft: convertWidth(16), paddingRight: convertWidth(16),
    fontSize: 10,
    fontFamily: 'AvenirNextW1G-Light',
    letterSpacing: 1.5,
    color: 'rgba(0, 0, 0, 0.87)'
  },
  contentContainer: {
    width: '100%',
    padding: convertWidth(16),
  },
  introductionTitle: {
    fontSize: 18,
    fontFamily: 'AvenirNextW1G-Bold',
    color: 'rgba(0, 0, 0, 0.87)'
  },
  introductionDescription: {
    fontSize: 14,
    fontFamily: 'AvenirNextW1G-Regular',
    letterSpacing: 0.25,
    color: 'rgba(0, 0, 0, 0.6)',
    marginTop: 6,
  },
  inputNote: {
    height: 103,
    color: 'rgba(0, 0, 0, 0.87)',
    fontSize: 14,
    fontFamily: 'AvenirNextW1G-Regular',
    backgroundColor: '#F5F5F5',
  },
  tagIconContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  tagIcon: {
    width: 17,
    height: 17,
    resizeMode: 'contain'
  },
  removeTagIcon: {
    width: 7,
    height: 7,
    resizeMode: 'contain',
    marginTop: 2,
    marginLeft: 5,
  },
  addTagText: {
    marginLeft: 12,
    color: '#FF003C',
    fontSize: 12,
    fontFamily: 'Andale Mono',
    letterSpacing: 0.25,
  },
  saveButton: {
    marginTop: 52,
    backgroundColor: '#0060F2',
    height: 36,
    width: '100%',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  saveButtonText: {
    fontSize: 14,
    fontFamily: 'AvenirNextW1G-Bold',
    letterSpacing: 0.75,
    color: '#FFFFFF'
  },
  taggingItemContainer: {
    flexDirection: 'row',
    padding: 5,
    paddingTop: 5,
    paddingBottom: 5,
    backgroundColor: 'rgba(255, 0, 60, 0.12)',
    marginLeft: 10,
    borderRadius: 4,
  },
  taggingItem: {
    fontFamily: 'Andale Mono',
    letterSpacing: 0.25,
    fontSize: 10,
    fontWeight: '300',
    color: '#FF003C',
  },
});
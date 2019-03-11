import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View, TouchableOpacity, Text, Image, ScrollView, TextInput, SafeAreaView, KeyboardAvoidingView, ImageBackground
} from 'react-native';

import { Actions } from 'react-native-router-flux';
import moment from 'moment';
import { convertWidth } from 'src/utils';
import { AppProcessor, EventEmitterService } from 'src/processors';
import { InputTagComponent } from "./tag/input-tag.component";
import { ShadowComponent } from "src/views/commons";
import { config } from 'src/configs';
import { styles as cardStyles } from "./card/bitmark-card.style.component";


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
    this.state = { name: '', note: '', type: 'combine', scrollEnabled: true, itemOrder: null, tags: [] };
    this.itemOrderImageRefs = {};
    this.isSingleFile = !this.props.images || this.props.images.length == 1;
  }

  async continue() {
    if (this.isSingleFile) {
      if (this.props.images) {
        // Issue image
        let image = this.props.images[0];
        this.props.doIssueImage([{ uri: image.uri, createAt: image.createAt, name: this.state.name, note: this.state.note, tags: this.state.tags }], false);
      } else {
        // Issue unknown file
        let issueParams = this.props.issueParams;
        issueParams.name = this.state.name;
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
        this.props.doIssueImage([{ uri: `file://${filePath}`, createAt: moment(), name: this.state.name.trim(), note: this.state.note.trim(), tags: this.state.tags, numberOfFiles: newImages.length }], true);
      }).catch(error => {
        EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
      })
    }
  }

  onInputNameChangeText(text) {
    this.setState({ name: text });
  }

  onInputNoteChangeText(text) {
    this.setState({ note: text });
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
          <Text style={styles.titleText}>Edit record details</Text>
          {/*Done*/}
          <TouchableOpacity style={{ paddingRight: convertWidth(16) }} onPress={this.continue.bind(this)}>
            <Text style={styles.headerRightText}>DONE</Text>
          </TouchableOpacity>
        </View>

        {/*CONTENT*/}
        <KeyboardAvoidingView behavior="padding" enabled style={styles.body} keyboardVerticalOffset={this.state.inputtingTag ? (88 + config.isIPhoneX ? 44 : 0) : 0} >
          <ScrollView style={{ flex: 1, width: '100%', }} contentContainerStyle={{
            paddingLeft: convertWidth(16), paddingRight: convertWidth(16), paddingTop: 5,
          }}>
            <View style={[styles.bodyContent]}>
              {/*THUMBNAIL*/}
              {this.props.images &&
              <View>
                <Image style={cardStyles.cardImage} source={{ uri: this.props.images[0].uri }} />
                {/*Multiple files icon*/}
                {this.props.images &&
                <ImageBackground style={styles.multipleFilesIcon} source={require('assets/imgs/multiple-files-icon.png')} >
                  <View style={styles.multipleFilesArea}>
                    <Text style={[styles.multipleFilesText, {}]}>{this.props.images.length}</Text>
                  </View>
                </ImageBackground>
                }
              </View>
              }

              {/*NAME*/}
              <Text style={[styles.sectionTitle, {marginTop: 20}]}>Name:</Text>
              {/*Content*/}
              <View style={[styles.contentContainer, {paddingTop: 10}]}>
                <ShadowComponent>
                  <TextInput style={[styles.inputName]}
                             value={this.state.name}
                             placeholder={'Add a private name to your record.'}
                             onChangeText={(text) => this.onInputNameChangeText.bind(this)(text)}
                  />
                </ShadowComponent>
              </View>

              {/*NOTES*/}
              <Text style={[styles.sectionTitle]}>Notes:</Text>
              {/*Content*/}
              <View style={[styles.contentContainer, {paddingTop: 10}]}>
                <ShadowComponent>
                  <TextInput style={[styles.inputNote]}
                             multiline={true}
                             value={this.state.note}
                             placeholder={'Add private notes to your record.'}
                             onFocus={() => this.setState({ inputtingTag: false })}
                             onChangeText={(text) => this.onInputNoteChangeText.bind(this)(text)}
                  />
                </ShadowComponent>
              </View>

              {/*TAGS*/}
              <Text style={[styles.sectionTitle]}>Tags:</Text>
              <View style={[styles.contentContainer, {paddingTop: 0, paddingBottom: 0}]}>
                {/*Tag desc*/}
                <Text style={styles.introductionDescription}>Record tagging — you can now add tags to your health records to help you <Text style={{color: 'rgba(0, 0, 0, 0.6)'}}>search over</Text> them and find them faster in the future. </Text>
              </View>
              {/*Tags*/}
              <View style={[styles.bottomBar]}>
                <ShadowComponent>
                  <ScrollView horizontal={true} contentContainerStyle={{width: '100%', backgroundColor: '#FFFFFF', padding: 10, borderRadius: 5}}>
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
                </ShadowComponent>
              </View>
            </View>
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
  bodyContent: {
    flex: 1,
    backgroundColor: '#F4F2EE',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingBottom: 8
  },
  header: {
    width: '100%',
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRightText: {
    fontSize: 18,
    fontFamily: 'AvenirNextW1G-Bold',
    textAlign: 'right',
    color: '#FF003C',
  },
  titleText: {
    fontSize: 20,
    fontFamily: 'AvenirNextW1G-Bold', textAlign: 'center',
    color: 'rgba(0, 0, 0, 0.87)',
  },
  bottomBar: {
    padding: convertWidth(16),
    minHeight: 54,
    width: '100%',
    borderTopWidth: 0.5,
    borderColor: '#F4F2EE',
  },
  sectionTitle: {
    paddingLeft: convertWidth(16), paddingRight: convertWidth(16),
    fontSize: 14,
    fontFamily: 'AvenirNextW1G-Bold',
    letterSpacing: 1.5,
    color: '#000000'
  },
  contentContainer: {
    width: '100%',
    padding: convertWidth(16),
  },
  introductionDescription: {
    fontSize: 14,
    fontFamily: 'AvenirNextW1G-Medium',
    letterSpacing: 0.15,
    color: '#999999',
    lineHeight: 24,
    marginTop: 6,
  },
  inputName: {
    padding: 9,
    height: 37,
    color: 'rgba(0, 0, 0, 0.87)',
    fontSize: 14,
    fontFamily: 'AvenirNextW1G-Regular',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  inputNote: {
    padding: 9,
    height: 103,
    color: 'rgba(0, 0, 0, 0.87)',
    fontSize: 14,
    fontFamily: 'AvenirNextW1G-Regular',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
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
});
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View, TouchableOpacity, Text, Image, ScrollView, TextInput, SafeAreaView, KeyboardAvoidingView,
} from 'react-native';

import { Actions } from 'react-native-router-flux';
import { convertWidth } from 'src/utils';
import { InputTagComponent } from "./tag/input-tag.component";
import { IndexDBService } from "src/processors";
import { ShadowComponent, ShadowTopComponent } from "src/views/commons";

export class EditBitmarkComponent extends Component {
  static propTypes = {
    bitmark: PropTypes.any,
    bitmarkType: PropTypes.string,
    tags: PropTypes.array,
    note: PropTypes.string,
    doUpdateTagsAndNote: PropTypes.func
  };

  constructor(props) {
    super(props);
    let tags = [];
    Object.assign(tags, this.props.tags);
    this.state = { tags, note: this.props.note };
  }

  async save() {
    // Update note if needed
    let note = this.state.note.trim();

    if (note != this.props.note) {
      await IndexDBService.updateNote(this.props.bitmark.id, note);
      //await LocalFileService.doUpdateIndexNoteToICloud(this.props.bitmark.id, note);
    }

    // Update tags if needed
    let tags = this.state.tags;
    if (JSON.stringify(tags) != JSON.stringify(this.props.tags)) {
      await IndexDBService.updateTag(this.props.bitmark.id, tags);
      //await LocalFileService.doUpdateIndexTagToICloud(this.props.bitmark.id, tags);
    }

    this.props.doUpdateTagsAndNote(tags, note);
    Actions.pop();
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
          <Text style={styles.titleText}>Edit</Text>
          <Text style={{ paddingLeft: convertWidth(16) + 20 }} />
        </View>
        <KeyboardAvoidingView style={styles.body} behavior="padding" enabled >
          <ScrollView style={{ flex: 1, width: '100%' }} contentContainerStyle={{
            flexGrow: 1,
            paddingLeft: convertWidth(16), paddingRight: convertWidth(16), paddingTop: 5,
          }}>
            {/*CONTENT*/}
            {/*NOTES*/}
            <ShadowComponent style={{ marginTop: 1.5 }}>
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
                    onFocus={() => this.setState({ inputtingTag: false })}
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
                  <View style={[styles.tagIconContainer]}>
                    <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }} onPress={this.showInputTag.bind(this)}>
                      <Image style={[styles.tagIcon]} source={require('assets/imgs/tag-icon-black.png')} />
                      <Text style={styles.addTagText}>+ADD TAGS</Text>
                    </TouchableOpacity>
                    <ScrollView horizontal={true}>
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
                    </ScrollView>
                  </View>
                </View>
              </View>
            </ShadowComponent>
            {/*BUTTON*/}
            <TouchableOpacity style={styles.saveButton} onPress={this.save.bind(this)}>
              <Text style={styles.saveButtonText}>SAVE</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView >

        {this.state.inputtingTag && <InputTagComponent tags={this.state.tags} addTag={this.addTag.bind(this)} hideInputTag={this.hideInputTag.bind(this)} />}
      </SafeAreaView >
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
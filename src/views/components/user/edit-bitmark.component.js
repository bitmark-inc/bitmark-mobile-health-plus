import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View, TouchableOpacity, Text, Image, ScrollView, TextInput, SafeAreaView,
} from 'react-native';

import { Actions } from 'react-native-router-flux';
import { convertWidth } from 'src/utils';
import { InputTagComponent } from "./tag/input-tag.component";
import { IndexDBService } from "src/processors";
import { OutterShadowComponent } from "src/views/commons";

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
    this.state = {tags, note: this.props.note};
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
    this.setState({note: text});
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
    this.setState({tags});
  }

  removeTag(tag) {
    let tags = this.state.tags;

    if (tags.indexOf(tag) > -1) {
      tags = tags.filter(item => item != tag);
      this.setState({tags});
    }
  }

  render() {
    let tags = this.state.tags;

    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.body}>
          {/*HEADER*/}
          <View style={[styles.header]}>
            {/*Back icon*/}
            <TouchableOpacity style={styles.button} onPress={Actions.pop}>
              <Image style={{ width: 20, height: 20, resizeMode: 'contain' }} source={require('assets/imgs/back-icon-black.png')} />
            </TouchableOpacity>
            {/*Title*/}
            <Text style={styles.titleText}>Edit</Text>
            <Text />
          </View>

          {/*CONTENT*/}
          <ScrollView style={{flex: 1}}>
            {/*NOTES*/}
            <OutterShadowComponent style={{marginTop: 1.5}}>
              <View style={[styles.section]}>
                {/*Top bar*/}
                <View style={[styles.topBar]}>
                  <Text style={[styles.sectionTitle]}>NOTES</Text>
                </View>

                {/*Content*/}
                <View style={[styles.contentContainer, {backgroundColor: '#F5F5F5'}]}>
                  <TextInput style={[styles.inputNote]}
                             multiline={true}
                             value={this.state.note}
                             placeholder={'Tap to add private notes to your record'}
                             onChangeText={(text) => this.onInputNoteChangeText.bind(this)(text)}
                  />
                </View>
              </View>
            </OutterShadowComponent>

            {/*TAGS*/}
            <OutterShadowComponent style={{marginTop: 19}}>
              <View style={[styles.section]}>
                {/*Top bar*/}
                <View style={[styles.topBar]}>
                  <Text style={[styles.sectionTitle]}>TAGS</Text>
                </View>

                {/*Content*/}
                <View style={[styles.contentContainer]}>
                  <Text style={styles.introductionTitle}>Add tags to your record</Text>
                  <Text style={styles.introductionDescription}>Record tagging — you can now add tags to your health records to help you search over them and find them faster in the future.</Text>
                </View>

                {/*Tags*/}
                <View style={[styles.bottomBar]}>
                  <ScrollView horizontal={true}>
                    <View style={[styles.tagIconContainer]}>
                      <Image style={[styles.tagIcon]} source={require('assets/imgs/tag-icon-black.png')}/>
                      <TouchableOpacity onPress={this.showInputTag.bind(this)}>
                        <Text style={styles.addTagText}>+ADD TAGS</Text>
                      </TouchableOpacity>

                      {(tags && tags.length) ? (
                        (tags || []).map((tag, index) => {
                          return (
                            <TouchableOpacity key={index} style={styles.taggingItemContainer} onPress={() => {this.removeTag.bind(this)(tag)}}>
                              <Text style={styles.taggingItem}>#{tag.toUpperCase()}</Text>
                              <Image style={[styles.removeTagIcon]} source={require('assets/imgs/remove-icon.png')}/>
                            </TouchableOpacity>
                          );
                        })
                      ) : null
                      }
                    </View>
                  </ScrollView>
                </View>
              </View>
            </OutterShadowComponent>
          </ScrollView>

          {/*BUTTON*/}
          <TouchableOpacity style={styles.saveButton} onPress={this.save.bind(this)}>
            <Text style={styles.saveButtonText}>SAVE</Text>
          </TouchableOpacity>
        </View>

        {this.state.inputtingTag && <InputTagComponent tags={this.state.tags} addTag={this.addTag.bind(this)} hideInputTag={this.hideInputTag.bind(this)}/>}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    paddingLeft: convertWidth(16),
    paddingRight: convertWidth(16),
  },
  header: {
    width: '100%',
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleText: {
    marginLeft: -16,
    fontSize: 24,
    fontFamily: 'AvenirNextW1G-Bold',
    color: 'rgba(0, 0, 0, 0.87)',
  },
  section: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    width: '100%',
  },
  topBar: {
    width: '100%',
    height: 41,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: convertWidth(16),
    paddingRight: convertWidth(16),
    borderBottomWidth: 1,
    borderColor: '#F4F2EE',
  },
  bottomBar: {
    padding: convertWidth(16),
    paddingRight: 0,
    marginTop: 16,
    minHeight: 54,
    width: '100%',
    borderTopWidth: 1,
    borderColor: '#F5F5F5',
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'AvenirNextW1G-Light',
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
    fontSize: 10,
    fontWeight: '300',
    color: '#FF003C',
  },
});
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  Image, View, SafeAreaView, TouchableOpacity, Text, FlatList, KeyboardAvoidingView, ScrollView, TextInput, Keyboard, Animated
} from 'react-native';

import { Actions } from 'react-native-router-flux';
import { uniq } from "lodash";
import { getTagsByBitmarkId, getTagsCache, updateTag, doUpdateIndexTagToICloud, writeTagsCache, convertWidth } from 'src/utils';
import { config, constants } from 'src/configs';

export class TaggingComponent extends Component {
  static propTypes = {
    bitmarkId: PropTypes.string,
  };
  constructor(props) {
    super(props);

    this.state = {
      inputtingTag: false,
      tag: '',
      tags: [],
      tagsCache: [],
      tagsSuggestion: [],
      keyboardHeight: 0,
      keyboardExternalBottom: new Animated.Value(0),
      keyboardExternalOpacity: new Animated.Value(0)
    };
  }

  async componentDidMount() {
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.onKeyboardDidShow.bind(this));
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.onKeyboardDidHide.bind(this));

    let tags = await getTagsByBitmarkId(this.props.bitmarkId);
    console.log('tags:', tags);
    let tagsCache = await getTagsCache();
    console.log('tagsCache:', tagsCache);
    let tagsSuggestion = tagsCache.filter((item) => tags.indexOf(item) == -1);
    console.log('tagsSuggestion:', tagsSuggestion);

    this.setState({ tags, tagsCache, tagsSuggestion });
  }

  componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  onKeyboardDidShow(keyboardEvent) {
    let keyboardHeight = keyboardEvent.endCoordinates.height;
    this.setState({ keyboardHeight });

    let listAnimations = [];
    listAnimations.push(Animated.spring(this.state.keyboardExternalBottom, {
      toValue: keyboardHeight,
      duration: 100,
    }));
    listAnimations.push(Animated.spring(this.state.keyboardExternalOpacity, {
      toValue: 1,
      duration: 100,
    }));
    Animated.parallel(listAnimations).start();
  }

  onKeyboardDidHide() {
    this.hideInputTag();
    this.setState({ keyboardHeight: 0 });

    let listAnimations = [];
    listAnimations.push(Animated.spring(this.state.keyboardExternalBottom, {
      toValue: 0,
      duration: 100,
    }));
    listAnimations.push(Animated.spring(this.state.keyboardExternalOpacity, {
      toValue: 0,
      duration: 100,
    }));
    Animated.parallel(listAnimations).start();
  }

  showInputTag() {
    this.setState({ inputtingTag: true });
  }

  hideInputTag() {
    this.setState({ inputtingTag: false, tagsSuggestion: this.state.tagsCache.filter(item => this.state.tags.indexOf(item) == -1) });
  }

  async addTag(tag) {
    if (tag) {
      let tags = this.state.tags;
      if (tags.indexOf(tag) == -1) {
        tags.push(tag);
        await updateTag(this.props.bitmarkId, tags);
        await doUpdateIndexTagToICloud(this.props.bitmarkId, tags);

        let tagsCache = this.state.tagsCache;
        // Insert to the beginning of the list
        tagsCache.unshift(tag);
        // Remove duplication
        tagsCache = uniq(tagsCache);

        let tagsSuggestion = tagsCache.filter((item) => tags.indexOf(item) == -1);

        this.setState({ tag: '', tags, tagsCache, tagsSuggestion });
        await writeTagsCache(tagsCache);
      }
    }
  }

  async removeTag(tag) {
    let tags = this.state.tags;

    if (tags.indexOf(tag) > -1) {
      tags = tags.filter(item => item != tag);
      await updateTag(this.props.bitmarkId, tags);
      await doUpdateIndexTagToICloud(this.props.bitmarkId, tags);

      let tagsSuggestion = this.state.tagsCache.filter((item) => { return tags.indexOf(item) == -1 });

      this.setState({ tags, tagsSuggestion });
    }
  }

  onChangeText(text) {
    let tag = text.replace(/\s/g, '');
    let tagsSuggestion = this.state.tagsCache.filter((item) => {
      return item.startsWith(text) && this.state.tags.indexOf(item) == -1
    });
    this.setState({ tag, tagsSuggestion });
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <SafeAreaView style={[styles.bodySafeView]}>
          <View style={styles.body}>
            <View style={styles.bodyContent}>
              {/*TITLE*/}
              <View style={styles.titleRow}>
                <TouchableOpacity style={styles.closeButton} onPress={Actions.pop}>
                  <Image style={styles.closeIcon} source={require('assets/imgs/back_icon_red.png')} />
                </TouchableOpacity>
                <Text style={styles.titleText}>{global.i18n.t("TaggingComponent_tags")}</Text>
              </View>

              {/*EXISTING TAGS*/}
              <ScrollView style={[styles.content]}>
                {/*LABEL*/}
                <View style={[styles.existingTagsContainer]}>
                  <Image style={styles.taggingIcon} source={require('assets/imgs/tagging-red.png')} />
                  <Text style={styles.existingTagsLabel}>{global.i18n.t("TaggingComponent_existingTags")}</Text>
                </View>

                {/*TAGS*/}
                <View>
                  {this.state.tags.length ? (
                    <FlatList data={this.state.tags}
                      contentContainerStyle={[styles.existingTagListContainer]}
                      keyExtractor={(item, index) => index + ''}
                      renderItem={({ item }) => {
                        return (
                          <TouchableOpacity style={styles.taggingItemContainer} onPress={() => this.removeTag.bind(this)(item)}>
                            <Text style={styles.taggingItem}>#{item}</Text>
                            <Image style={styles.removeTagIcon} source={require('assets/imgs/remove-tag-icon.png')} />
                          </TouchableOpacity>
                        );
                      }}
                    />
                  ) : (
                      <Text style={styles.noTagsText}>{global.i18n.t("TaggingComponent_noTags")}</Text>
                    )
                  }
                </View>

                {/*ADD TAGS*/}
                <TouchableOpacity style={[styles.addTagsContainer]} onPress={this.showInputTag.bind(this)}>
                  <Image style={styles.addTagsIcon} source={require('assets/imgs/add-tags-icon.png')} />
                  <Text style={styles.addTagsLabel}>{global.i18n.t("TaggingComponent_addTags")}</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>

          <Animated.View style={[styles.keyboardExternal, { bottom: this.state.keyboardExternalBottom, opacity: this.state.keyboardExternalOpacity }]}>
            {this.state.inputtingTag && <KeyboardAvoidingView behavior="padding" enabled style={styles.keyboardAvoidingView}>
              {/*INPUT TAG*/}
              <View style={styles.inputTagContainer}>
                <TextInput
                  style={[styles.inputTag]}
                  ref={(ref) => this.inputTag = ref}
                  value={this.state.tag}
                  autoCorrect={false}
                  autoFocus={true}
                  autoCapitalize="none"
                  clearTextOnFocus={true}
                  onChange={() => { this.setState({ tag: this.state.tag.replace(/\s/g, '') }) }}
                  onBlur={() => { this.setState({ tag: '' }) }}
                  onChangeText={(text) => { this.onChangeText.bind(this)(text) }}
                  onSubmitEditing={this.hideInputTag.bind(this)}
                  placeholder={global.i18n.t("TaggingComponent_enterATag")}
                />

                {/*SUBMIT TAG*/}
                <TouchableOpacity onPress={() => this.addTag.bind(this)(this.state.tag)}>
                  <Image style={[styles.addTagIcon]} source={require('assets/imgs/add-tag-icon.png')} />
                </TouchableOpacity>
              </View>

              {/*TAG CACHE*/}
              {(this.state.keyboardHeight > 0 && this.state.tagsSuggestion.length) ? (
                <View style={[styles.suggestionList]}>
                  <FlatList
                    keyboardShouldPersistTaps="handled"
                    horizontal={true}
                    extraData={this.state}
                    data={this.state.tagsSuggestion}
                    renderItem={({ item }) => {
                      return (<TouchableOpacity style={styles.suggestionItem} onPress={() => { this.addTag.bind(this)(item) }}>
                        <Text style={[styles.suggestionItemText]}>#{item}</Text>
                      </TouchableOpacity>)
                    }}
                  />
                </View>
              ) : null
              }
            </KeyboardAvoidingView>
            }
          </Animated.View>
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
    padding: convertWidth(20),
    paddingBottom: 0,
    paddingTop: 0,
    paddingRight: 0,
    borderBottomWidth: 1,
    borderColor: '#FF4444',
  },
  titleText: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Avenir Medium',
    fontWeight: '400',
    flex: 1,
    fontSize: 24,
    marginTop: 8,
  },
  closeButton: {
    paddingTop: convertWidth(14),
    paddingBottom: convertWidth(14),
    paddingRight: convertWidth(10)
  },
  closeIcon: {
    width: convertWidth(21),
    height: convertWidth(21),
    resizeMode: 'contain',
  },
  content: {
    flex: 1,
    padding: convertWidth(13),
    paddingTop: convertWidth(0),
  },
  existingTagsContainer: {
    flexDirection: 'row',
    marginTop: 24,
  },
  taggingIcon: {
    width: convertWidth(16),
    height: convertWidth(16),
    resizeMode: 'contain',
    marginRight: 7,
    marginTop: 2,
  },
  existingTagsLabel: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Avenir Light',
    flex: 1,
    fontSize: 17
  },
  existingTagListContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  taggingItemContainer: {
    flexDirection: 'row',
    padding: 5,
    paddingTop: 4,
    paddingBottom: 4,
    backgroundColor: '#ECECEC',
    marginRight: 10,
    marginTop: 10
  },
  taggingItem: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Avenir Light',
    fontSize: 14,
    fontWeight: '300',
  },
  removeTagIcon: {
    width: 9,
    height: 9,
    resizeMode: 'contain',
    marginLeft: 4,
    marginTop: 5
  },
  noTagsText: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Avenir Light',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 25,
    color: '#999999'
  },
  addTagsContainer: {
    flexDirection: 'row',
    marginTop: 10
  },
  addTagsIcon: {
    width: 17,
    height: 17,
    resizeMode: 'contain',
    marginRight: 4,
    marginTop: 3
  },
  addTagsLabel: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Avenir Light',
    flex: 1,
    fontSize: 17,
    color: '#FF003C'
  },
  keyboardAvoidingView: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: '#F5F5F5',
    width: '100%',
    paddingLeft: 15,
    paddingRight: 15
  },
  inputTagContainer: {
    flexDirection: 'row',
    width: '100%',
    paddingTop: 15,
    paddingBottom: 15,
    flex: 1
  },
  inputTag: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#C1C1C1',
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Avenir Light',
    fontSize: 17,
    fontWeight: '300',
    padding: 5,
    paddingTop: 8,
    paddingBottom: 8,
  },
  addTagIcon: {
    width: 31,
    height: 21,
    resizeMode: 'contain',
    marginLeft: 10,
    marginTop: 7,
  },
  suggestionList: {
    flexDirection: 'row',
    paddingBottom: 15
  },
  suggestionItem: {
    marginRight: 15
  },
  suggestionItemText: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Avenir Light',
    fontSize: 17,
    color: '#0060F2'
  },
  keyboardExternal: {
    position: 'absolute',
    width: '100%', height: constants.keyboardExternalHeight,
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center'
  }
});
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  Image, View, TouchableOpacity, Text, FlatList, TextInput, Keyboard, Animated
} from 'react-native';

import { uniq } from "lodash";
import { LocalFileService } from 'src/processors';

export class InputTagComponent extends Component {
  static propTypes = {
    hideInputTag: PropTypes.func,
    addTag: PropTypes.func,
    tags: PropTypes.array,
  };
  constructor(props) {
    super(props);

    this.state = {
      tag: '',
      tagsCache: [],
      tagsSuggestion: [],
      keyboardHeight: 0,
      keyboardExternalBottom: new Animated.Value(0),
      keyboardExternalOpacity: new Animated.Value(0)
    };

    this.tags = [];
    Object.assign(this.tags, this.props.tags);
  }

  async componentDidMount() {
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.onKeyboardDidShow.bind(this));
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.onKeyboardDidHide.bind(this));
    this.keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', this.onKeyboardWillHide.bind(this));

    let tags = this.tags || [];
    let tagsCache = await LocalFileService.getTagsCache();
    let tagsSuggestion = tagsCache.filter((item) => tags.indexOf(item) == -1);
    this.setState({ tagsCache, tagsSuggestion });
  }

  componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
    this.keyboardWillHideListener.remove();
  }

  onKeyboardWillHide() {
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
  }

  hideInputTag() {
    this.props.hideInputTag();
  }

  async addTag(tag) {
    if (tag) {
      let tags = this.tags;

      if (tags.indexOf(tag) == -1) {
        tags.push(tag);
        let tagsCache = this.state.tagsCache;
        // Insert to the beginning of the list
        tagsCache.unshift(tag);
        // Remove duplication
        tagsCache = uniq(tagsCache);

        let tagsSuggestion = tagsCache.filter((item) => tags.indexOf(item) == -1);

        this.setState({ tag: '', tagsCache, tagsSuggestion });
        await LocalFileService.writeTagsCache(tagsCache);
        this.props.addTag(tag);
      }
    }
  }

  onChangeText(text) {
    let tag = text.replace(/\s/g, '');
    let tagsSuggestion = this.state.tagsCache.filter((item) => {
      return item.startsWith(text) && this.tags.indexOf(item) == -1
    });
    this.setState({ tag, tagsSuggestion });
  }

  render() {
    return (
      <Animated.View style={[styles.keyboardExternal, { bottom: this.state.keyboardExternalBottom, opacity: this.state.keyboardExternalOpacity }]}>
        <View style={styles.keyboardAvoidingView}>
          {/*INPUT TAG*/}
          <View style={styles.inputTagContainer}>
            <TextInput
              style={[styles.inputTag]}
              ref={(ref) => this.inputTag = ref}
              value={this.state.tag}
              autoCorrect={false}
              autoFocus={true}
              autoCapitalize="none"
              returnKeyType={'done'}
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
        </View>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    backgroundColor: '#F5F5F5',
    width: '100%',
    paddingLeft: 15,
    paddingRight: 15
  },
  inputTagContainer: {
    flexDirection: 'row',
    width: '100%', height: 62,
    paddingTop: 15,
    paddingBottom: 15,
  },
  inputTag: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#C1C1C1',
    fontFamily: 'AvenirNextW1G-Light',
    fontSize: 17,
    padding: 5,
    paddingTop: 5,
    paddingBottom: 5,
  },
  addTagIcon: {
    width: 31,
    height: 21,
    resizeMode: 'contain',
    marginLeft: 10,
    marginTop: 8,
  },
  suggestionList: {
    flexDirection: 'row',
    paddingBottom: 15
  },
  suggestionItem: {
    marginRight: 15
  },
  suggestionItemText: {
    fontFamily: 'AvenirNextW1G-Light',
    fontSize: 17,
    color: '#0060F2'
  },
  keyboardExternal: {
    position: 'absolute',
    width: '100%',
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center'
  }
});
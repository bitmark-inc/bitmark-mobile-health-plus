import React, { Component } from 'react';
import {
  StyleSheet,
  Keyboard,
  Image, View, SafeAreaView, TouchableOpacity, Text, FlatList, TextInput, KeyboardAvoidingView, ScrollView, Animated,
} from 'react-native';
import { Header } from 'react-navigation';

import { convertWidth, dictionary24Words } from './../../utils';
import { constants } from '../../constants';

const statuses = {
  done: 'done',
  inputting: 'inputting'
}

export class LoginComponent extends Component {
  constructor(props) {
    super(props);

    let smallerList = [];
    let biggerList = [];
    for (let index = 0; index < 24; index++) {
      if (index < 12) {
        smallerList.push({
          key: index,
          word: '',
        });
      } else {
        biggerList.push({
          key: index,
          word: '',
        });
      }
    }
    this.inputtedRefs = {};

    this.state = {
      smallerList,
      biggerList,
      selectedIndex: -1,
      remainWordNumber: 24,
      keyboardHeight: 0,
      keyboardExternalBottom: new Animated.Value(0),
      keyboardExternalOpacity: new Animated.Value(0),
      keyboardExternalDataSource: dictionary24Words,
    };
  }
  componentDidMount() {
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.onKeyboardDidShow.bind(this));
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.onKeyboardDidHide.bind(this));
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
      duration: 200,
    }));
    listAnimations.push(Animated.spring(this.state.keyboardExternalOpacity, {
      toValue: 1,
      duration: 200,
    }));
    Animated.parallel(listAnimations).start();
  }

  onKeyboardDidHide() {
    this.setState({ keyboardHeight: 0 });
    let listAnimations = [];
    listAnimations.push(Animated.spring(this.state.keyboardExternalBottom, {
      toValue: 0,
      duration: 200,
    }));
    listAnimations.push(Animated.spring(this.state.keyboardExternalOpacity, {
      toValue: 0,
      duration: 200,
    }));
    Animated.parallel(listAnimations).start();
  }


  onChangeText(index, text) {
    console.log('onChangeText :', index, text);
    text = text ? text.trim() : '';
    this.doFilter(text);
    if (index < 12) {
      let inputtedWords = this.state.smallerList;
      inputtedWords[index].word = text;
      this.setState({ smallerList: inputtedWords });
    } else {
      let inputtedWords = this.state.biggerList;
      inputtedWords[index - 12].word = text;
      this.setState({ biggerList: inputtedWords });
    }
    this.checkStatusInputting();
  }
  onFocus(index) {
    console.log('index :', index);
    let text = index < 12 ? this.state.smallerList[index].word : this.state.biggerList[index - 12].word;
    this.setState({
      selectedIndex: index,
      currentInputtedText: text,
    });
    this.inputtedRefs[index].focus();
    this.doFilter(text);
  }
  checkStatusInputting() {
    let countNumberInputtedWord = 0;
    this.state.smallerList.forEach(item => {
      countNumberInputtedWord = countNumberInputtedWord + (item.word ? 1 : 0)
    });
    this.state.biggerList.forEach(item => {
      countNumberInputtedWord = countNumberInputtedWord + (item.word ? 1 : 0)
    });
    let status = countNumberInputtedWord === 24 ? statuses.done : statuses.inputting;
    this.setState({
      preCheckResult: null,
      remainWordNumber: 24 - countNumberInputtedWord,
      status,
    });
  }
  selectedIndex(index) {
    this.onFocus(index);
    this.checkStatusInputting();
  }
  onSubmitWord(word) {
    let selectedIndex = this.state.selectedIndex;
    if (selectedIndex < 0) {
      return;
    }
    if (word) {
      word = word ? word.trim() : '';
      this.inputtedRefs[selectedIndex].focus();
      if (selectedIndex < 12) {
        let inputtedWords = this.state.smallerList;
        inputtedWords[selectedIndex].word = word;
        this.setState({ smallerList: inputtedWords });
      } else {
        let inputtedWords = this.state.biggerList;
        inputtedWords[selectedIndex - 12].word = word;
        this.setState({ biggerList: inputtedWords });
      }
    }
    this.selectedIndex((selectedIndex + 1) % 24);
  }

  doCheck24Word() {
    Keyboard.dismiss();
  }

  doFilter(text) {
    let keyboardExternalDataSource = dictionary24Words.filter(word => word.toLowerCase().indexOf(text.toLowerCase()) === 0);
    this.setState({ keyboardExternalDataSource, currentInputtedText: text });
  }

  render() {
    console.log(this.state);
    return (
      <View style={{ flex: 1, }}>
        <SafeAreaView style={styles.bodySafeView}>
          <View style={styles.body}>
            <KeyboardAvoidingView behavior="padding" enabled style={styles.bodyContent} keyboardVerticalOffset={constants.keyboardExternalHeight} >
              <ScrollView style={styles.bodyScroll} >
                <Text style={styles.title}>{'Recovery Phrase SIGN-IN'.toUpperCase()}</Text>
                <Text style={styles.description}>Please type all 24 words of your recovery phrase in the exact sequence below:</Text>
                <View style={styles.inputArea}>
                  <View style={styles.inputAreaHalf}>
                    <FlatList data={this.state.smallerList}
                      keyExtractor={(item) => item.key + ''}
                      scrollEnabled={false}
                      extraData={this.state}
                      renderItem={({ item }) => {
                        return (<View style={styles.recoveryPhraseSet}>
                          <Text style={styles.recoveryPhraseIndex}>{item.key + 1}.</Text>
                          <TextInput
                            style={[styles.recoveryPhraseWord, {
                              backgroundColor: (item.word ? 'white' : '#F5F5F5'),
                              borderColor: '#0060F2',
                              borderWidth: (item.key === this.state.selectedIndex ? 1 : 0),
                            }]}
                            ref={(r) => { this.inputtedRefs[item.key] = r; }}
                            value={item.word}
                            autoCorrect={false}
                            autoCapitalize="none"
                            onChangeText={(text) => this.onChangeText.bind(this)(item.key, text)}
                            onFocus={() => this.onFocus.bind(this)(item.key)}
                            onSubmitEditing={() => this.onSubmitWord.bind(this)(item.word)}
                          />
                        </View>)
                      }}
                    />
                  </View>
                  <View style={[styles.inputAreaHalf, { marginLeft: 15, }]}>
                    <FlatList data={this.state.biggerList}
                      scrollEnabled={false}
                      extraData={this.state}
                      renderItem={({ item }) => {
                        return (<View style={styles.recoveryPhraseSet}>
                          <Text style={styles.recoveryPhraseIndex}>{item.key + 1}.</Text>
                          <TextInput
                            style={[styles.recoveryPhraseWord, {
                              backgroundColor: (item.word ? 'white' : '#F5F5F5'),
                              borderColor: '#0060F2',
                              borderWidth: (item.key === this.state.selectedIndex ? 1 : 0),
                            }]}
                            ref={(r) => { this.inputtedRefs[item.key] = r; }}
                            value={item.word}
                            autoCorrect={false}
                            autoCapitalize="none"
                            onChangeText={(text) => this.onChangeText.bind(this)(item.key, text)}
                            onFocus={() => this.onFocus.bind(this)(item.key)}
                            onSubmitEditing={() => this.onSubmitWord.bind(this)(item.word)}
                          />
                        </View>)
                      }}
                    />
                  </View>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </View>
        </SafeAreaView >
        {this.state.keyboardHeight > 0 && <Animated.View style={[styles.keyboardExternal, {
          bottom: this.state.keyboardExternalBottom,
          opacity: this.state.keyboardExternalOpacity,
        }]}>
          <TouchableOpacity style={styles.nextButton} onPress={() => this.selectedIndex.bind(this)((this.state.selectedIndex + 1) % 24)}>
            <Image style={styles.nextButtonImage} source={require('./../../../assets/imgs/arrow_down_enable.png')} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.nextButton} onPress={() => this.selectedIndex.bind(this)((this.state.selectedIndex + 23) % 24)}>
            <Image style={styles.prevButtonImage} source={require('./../../../assets/imgs/arrow_up_enable.png')} />
          </TouchableOpacity>
          {this.state.keyboardExternalDataSource && <View style={[styles.selectionList]}>
            <FlatList
              ref={(ref) => this.listViewElement = ref}
              keyboardShouldPersistTaps="handled"
              horizontal={true}
              extraData={this.state}
              data={this.state.keyboardExternalDataSource}
              renderItem={({ item }) => {
                return (<TouchableOpacity style={styles.selectionItem} onPress={() => this.onSubmitWord(item)}>
                  <Text style={[styles.selectionItemText, { color: this.state.currentInputtedText === item ? 'blue' : 'gray' }]}>{item}</Text>
                </TouchableOpacity>)
              }}
            />
          </View>}
          <TouchableOpacity style={styles.doneButton} onPress={this.doCheck24Word.bind(this)} disabled={this.state.status !== statuses.done}>
            <Text style={[styles.doneButtonText, { color: this.state.status === statuses.done ? '#0060F2' : 'gray' }]}>Done</Text>
          </TouchableOpacity>
        </Animated.View>}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  bodySafeView: {
    flex: 1,
  },
  bodyScroll: {
    flex: 1,
  },
  body: {
    flex: 1,
    padding: convertWidth(16),
  },
  bodyContent: {
    flex: 1,
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: '#FF4444',
    padding: convertWidth(17),
  },
  title: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 18,
    paddingLeft: 3,
    paddingRight: 3,
  },
  description: {
    fontFamily: 'Avenir Light',
    fontWeight: '300',
    fontSize: 17,
    marginTop: 16,
  },
  inputArea: {
    width: '100%',
    flexDirection: 'row',
    marginTop: 17,
  },
  inputAreaHalf: {
    flex: 1,
  },
  recoveryPhraseSet: {
    flexDirection: 'row',
    marginTop: 9,
    flex: 1,
    minHeight: 18,
  },
  recoveryPhraseIndex: {
    textAlign: 'left',
    width: convertWidth(39),
    color: '#C1C1C1',
    fontFamily: 'Avenir Light',
    fontWeight: '300',
    fontSize: 15,
  },
  recoveryPhraseWord: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    fontFamily: 'Avenir Light',
    fontWeight: '300',
    fontSize: 15,
  },


  prevButton: {
    marginLeft: 10,
  },
  prevButtonImage: {
    width: 16,
    height: 16,
    resizeMode: 'contain'
  },
  nextButton: {
    marginLeft: 5,
  },
  nextButtonImage: {
    width: 16,
    height: 16,
    resizeMode: 'contain'
  },
  doneButton: {
    position: 'absolute',
    right: 10,
  },
  doneButtonText: {
    fontSize: 16,
    color: '#0060F2',
    fontWeight: '600',
  },
  selectionList: {
    width: convertWidth(200),
    height: 30,
    marginLeft: 20,
    marginRight: 20,
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionItem: {
    marginLeft: 4,
    padding: 4,
  },
  selectionItemText: {
    color: 'blue',
  },

  keyboardExternal: {
    position: 'absolute',
    width: '100%', height: constants.keyboardExternalHeight,
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    paddingLeft: 8,
    paddingRight: 8,
    backgroundColor: '#EEEFF1',
    borderWidth: 1,
  },

});

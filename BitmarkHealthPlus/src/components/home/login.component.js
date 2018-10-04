import React, { Component } from 'react';
import {
  StyleSheet,
  Keyboard,
  Image, View, TouchableOpacity, Text, FlatList, TextInput, KeyboardAvoidingView, ScrollView, Animated, SafeAreaView,
} from 'react-native';

import { convertWidth, dictionary24Words } from './../../utils';
import { constants } from '../../constants';
import { config } from '../../configs';
import { AppProcessor } from '../../processors';
import { Actions } from 'react-native-router-flux';

const statuses = {
  done: 'done',
  inputting: 'inputting'
};

let testWords = ["accident", "sausage", "ticket", "dolphin", "original", "nasty", "theme", "life", "polar", "donor", "office", "weird", "neither", "escape", "flag", "spell", "submit", "salute", "sustain", "habit", "soap", "oil", "romance", "drama",];


export class LoginComponent extends Component {
  constructor(props) {
    super(props);

    let smallerList = [];
    let biggerList = [];
    for (let index = 0; index < 24; index++) {
      if (index < 12) {
        smallerList.push({
          key: index,
          // word: '',
          word: testWords[index],
        });
      } else {
        biggerList.push({
          key: index,
          // word: '',
          word: testWords[index],
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
      preCheckResult: null,
      keyboardExternalBottom: new Animated.Value(0),
      keyboardExternalOpacity: new Animated.Value(0),
      keyboardExternalDataSource: dictionary24Words,
    };
    setTimeout(this.checkStatusInputting.bind(this), 200);
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

  doFilter(text) {
    let keyboardExternalDataSource = dictionary24Words.filter(word => word.toLowerCase().indexOf(text.toLowerCase()) === 0);
    this.setState({ keyboardExternalDataSource, currentInputtedText: text });
  }

  doCheck24Word() {
    return new Promise((resolve) => {
      Keyboard.dismiss();
      if (this.state.remainWordNumber === 0) {
        let inputtedWords = [];
        this.state.smallerList.forEach(item => inputtedWords.push(item.word));
        this.state.biggerList.forEach(item => inputtedWords.push(item.word));
        AppProcessor.doCheck24Words(inputtedWords).then(() => {
          this.setState({ preCheckResult: i18n.t('LoginComponent_submitButtonText1') });
          resolve(inputtedWords);
        }).catch((error) => {
          resolve(false);
          console.log('check24Words error: ', error);
          this.setState({ preCheckResult: i18n.t('LoginComponent_submitButtonText2') });
        });
      } else {
        this.setState({ preCheckResult: null });
        resolve(null);
      }
    });
  }

  doSignIn() {
    if (this.state.preCheckResult === i18n.t('LoginComponent_submitButtonText2')) {
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
      this.setState({
        smallerList: smallerList,
        biggerList: biggerList,
        preCheckResult: null,
        selectedIndex: -1,
        remainWordNumber: 24,
      });
      return;
    }
    this.doCheck24Word().then((result) => {
      if (result) {
        Actions.getStart({ passPhrase24Words: result });
      }
    });
  }

  render() {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={styles.bodySafeView}>
          <View style={styles.body}>
            <KeyboardAvoidingView behavior="padding" enabled style={styles.avoidingView} keyboardVerticalOffset={constants.keyboardExternalHeight} >
              <View style={styles.bodyContent}>
                <ScrollView style={styles.bodyScroll} >
                  <View style={styles.titleRow}>
                    <Text style={styles.title}>{i18n.t('LoginComponent_title').toUpperCase()}</Text>
                    <TouchableOpacity onPress={Actions.pop}>
                      <Image style={styles.closeIcon} source={require('./../../../assets/imgs/back_icon_red.png')} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.description}>{i18n.t('LoginComponent_description')}</Text>
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
                                borderColor: '#FF4444',
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
                        keyExtractor={(item) => item.key + ''}
                        scrollEnabled={false}
                        extraData={this.state}
                        renderItem={({ item }) => {
                          return (<View style={styles.recoveryPhraseSet}>
                            <Text style={styles.recoveryPhraseIndex}>{item.key + 1}.</Text>
                            <TextInput
                              style={[styles.recoveryPhraseWord, {
                                backgroundColor: (item.word ? 'white' : '#F5F5F5'),
                                borderColor: '#FF4444',
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

                {this.state.keyboardHeight === 0 && this.state.preCheckResult === i18n.t('LoginComponent_submitButtonText2') && <View style={styles.resultStatusArea}>
                  <Text style={[styles.resultTitle, { color: '#FF4444' }]}>{i18n.t('LoginComponent_resultTitle1')}</Text>
                  <Text style={[styles.resultMessage, { color: '#FF4444' }]}>{i18n.t('LoginComponent_resultMessage1')}</Text>
                </View>}
                {this.state.keyboardHeight === 0 && this.state.preCheckResult === i18n.t('LoginComponent_submitButtonText1') && <View style={styles.resultStatusArea}>
                  <Text style={styles.resultTitle}>{i18n.t('LoginComponent_resultTitle2')}</Text>
                  <Text style={styles.resultMessage}>{i18n.t('LoginComponent_resultMessage2')}</Text>
                </View>}
              </View>

              <View style={styles.submitButtonArea}>
                <TouchableOpacity style={[styles.submitButton]} onPress={this.doSignIn.bind(this)} disabled={this.state.remainWordNumber > 0}>
                  <Text style={[styles.submitButtonText,]}>{this.state.preCheckResult || i18n.t('LoginComponent_submitButtonText1')}</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </View>
        </View >
        {this.state.keyboardHeight > 0 &&
          <Animated.View style={[styles.keyboardExternal, { bottom: this.state.keyboardExternalBottom, opacity: this.state.keyboardExternalOpacity, }]}>
            <TouchableOpacity style={styles.nextButton} onPress={() => this.selectedIndex.bind(this)((this.state.selectedIndex + 1) % 24)}>
              <Image style={styles.nextButtonImage} source={require('./../../../assets/imgs/arrow_down_enable.png')} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.prevButton} onPress={() => this.selectedIndex.bind(this)((this.state.selectedIndex + 23) % 24)}>
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
              <Text style={[styles.doneButtonText, { color: this.state.status === statuses.done ? '#0060F2' : 'gray' }]}>{i18n.t('LoginComponent_doneButtonText')}</Text>
            </TouchableOpacity>
          </Animated.View>}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  bodySafeView: {
    flex: 1,
    paddingTop: config.isIPhoneX ? constants.iPhoneXStatusBarHeight : 0,
  },
  body: {
    flex: 1,
    padding: convertWidth(16),
    backgroundColor: 'white',
  },
  bodyScroll: {
    flex: 1,
  },
  avoidingView: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  bodyContent: {
    flex: 1,
    flexDirection: 'column',
    padding: convertWidth(17),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 18,
    paddingLeft: 3,
    paddingRight: 3,
  },
  closeIcon: {
    width: convertWidth(21),
    height: convertWidth(21),
    resizeMode: 'contain',
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
    color: '#FF4444',
    fontSize: 15,
  },

  resultStatusArea: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultTitle: {
    fontFamily: 'Avenir Heavy',
    fontWeight: '900',
    fontSize: 15,
  },
  resultMessage: {
    fontFamily: 'Avenir Heavy',
    fontWeight: '300',
    fontSize: 15,
    textAlign: 'center',
  },

  submitButtonArea: {
    padding: 20,
  },
  submitButton: {
    height: constants.buttonHeight,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF4444',
  },
  submitButtonText: {
    fontFamily: 'Avenir Heavy',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    color: 'white'
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
  },
  prevButton: {
    marginLeft: 10,
  },
  prevButtonImage: {
    width: convertWidth(16),
    height: convertWidth(16),
    resizeMode: 'contain'
  },
  nextButton: {
    marginLeft: 5,
  },
  nextButtonImage: {
    width: convertWidth(16),
    height: convertWidth(16),
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

});

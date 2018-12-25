import React, { Component } from 'react';
import {
  StyleSheet,
  Keyboard,
  Image, View, TouchableOpacity, Text, FlatList, TextInput, Animated, SafeAreaView,
} from 'react-native';

import { Actions } from 'react-native-router-flux';
import { dictionaryPhraseWords, convertWidth } from 'src/utils';
import { AppProcessor, EventEmitterService } from 'src/processors';
import { constants, config } from 'src/configs';

const statuses = {
  done: 'done',
  inputting: 'inputting'
};

// let testWords = ["accident", "sausage", "ticket", "dolphin", "original", "nasty", "theme", "life", "polar", "donor", "office", "weird", "neither", "escape", "flag", "spell", "submit", "salute", "sustain", "habit", "soap", "oil", "romance", "drama",];

// let testWords = ["track", "occur", "mercy", "machine", "guitar", "occur", "main", "extra", "topic", "pen", "fatigue", "whale"];
// let testWords = ["aunt", "domain", "device", "amount", "surprise", "canal", "unaware", "junk", "emotion", "scene", "gesture", "empower"];

export class LoginComponent extends Component {
  constructor(props) {
    super(props);

    let smallerList = [];
    let biggerList = [];
    let numberPhraseWords = 12;
    for (let index = 0; index < numberPhraseWords; index++) {
      if (index < (numberPhraseWords / 2)) {
        smallerList.push({
          key: index,
          word: '',
          // word: testWords[index],
        });
      } else {
        biggerList.push({
          key: index,
          word: '',
          // word: testWords[index],
        });
      }
    }
    this.inputtedRefs = {};
    this.state = {
      smallerList,
      biggerList,
      selectedIndex: -1,
      remainWordNumber: numberPhraseWords,
      keyboardHeight: 0,
      preCheckResult: null,
      keyboardExternalBottom: new Animated.Value(0),
      keyboardExternalOpacity: new Animated.Value(0),
      keyboardExternalDataSource: dictionaryPhraseWords,
      testingResult: null,
      numberPhraseWords,
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

  // changeNumberPhraseWord() {
  //   let numberPhraseWords = this.state.numberPhraseWords === 12 ? 24 : 12
  //   this.setState({ numberPhraseWords });
  //   this.doReset(numberPhraseWords);
  // }

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
    if (index < (this.state.numberPhraseWords / 2)) {
      let inputtedWords = this.state.smallerList;
      inputtedWords[index].word = text;
      this.setState({ smallerList: inputtedWords });
    } else {
      let inputtedWords = this.state.biggerList;
      inputtedWords[index - (this.state.numberPhraseWords / 2)].word = text;
      this.setState({ biggerList: inputtedWords });
    }
    this.checkStatusInputting();
  }
  onFocus(index) {
    let text = index < (this.state.numberPhraseWords / 2) ? this.state.smallerList[index].word : this.state.biggerList[index - (this.state.numberPhraseWords / 2)].word;
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
    let status = countNumberInputtedWord === this.state.numberPhraseWords ? statuses.done : statuses.inputting;
    this.setState({
      preCheckResult: null,
      remainWordNumber: this.state.numberPhraseWords - countNumberInputtedWord,
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
      if (selectedIndex < (this.state.numberPhraseWords / 2)) {
        let inputtedWords = this.state.smallerList;
        inputtedWords[selectedIndex].word = word;
        this.setState({ smallerList: inputtedWords });
      } else {
        let inputtedWords = this.state.biggerList;
        inputtedWords[selectedIndex - (this.state.numberPhraseWords / 2)].word = word;
        this.setState({ biggerList: inputtedWords });
      }
    }
    this.selectedIndex((selectedIndex + 1) % this.state.numberPhraseWords);
  }

  doFilter(text) {
    let keyboardExternalDataSource = dictionaryPhraseWords.filter(word => word.toLowerCase().indexOf(text.toLowerCase()) === 0);
    this.setState({ keyboardExternalDataSource, currentInputtedText: text });
  }

  async loginWithPhraseWords(phraseWords) {
    await AppProcessor.doLogin(phraseWords, false);
    EventEmitterService.emit(EventEmitterService.events.APP_NEED_REFRESH);
  }

  doCheckPhraseWords() {
    return new Promise((resolve) => {
      Keyboard.dismiss();
      if (this.state.remainWordNumber === 0) {
        let inputtedWords = [];
        this.state.smallerList.forEach(item => inputtedWords.push(item.word.toLowerCase()));
        this.state.biggerList.forEach(item => inputtedWords.push(item.word.toLowerCase()));
        console.log('inputtedWords:', inputtedWords);
        AppProcessor.doCheckPhraseWords(inputtedWords).then(() => {
          this.setState({ testingResult: true });
          this.loginWithPhraseWords(inputtedWords);
          resolve(inputtedWords);
        }).catch((error) => {
          this.setState({ testingResult: false });
          resolve(false);
          console.log('doCheckPhraseWords error: ', error);
        });
      } else {
        this.setState({ testingResult: null });
        resolve(null);
      }
    });
  }

  doReset(numberPhraseWords) {
    numberPhraseWords = numberPhraseWords || this.state.numberPhraseWords;
    let smallerList = [];
    let biggerList = [];
    for (let index = 0; index < numberPhraseWords; index++) {
      if (index < (numberPhraseWords / 2)) {
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
      selectedIndex: -1,
      remainWordNumber: numberPhraseWords,
    });
  }

  // doSignIn() {
  //   if (this.state.preCheckResult === i18n.t('LoginComponent_submitButtonText2')) {
  //     this.doReset();
  //     return;
  //   }
  //   this.doCheckPhraseWords().then(async (result) => {
  //     if (result) {
  //       await AppProcessor.doLogin(result, false);
  //       EventEmitterService.emit(EventEmitterService.events.APP_NEED_REFRESH);
  //     }
  //   });
  // }

  render() {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={styles.body}>
          {/*<KeyboardAvoidingView behavior="padding" enabled style={styles.avoidingView} keyboardVerticalOffset={constants.keyboardExternalHeight} >*/}
            <View style={[styles.bodyContent, {paddingLeft: 0, paddingRight: 0}]}>
              <View style={{ flex: 1 }}>
                {/*TOP AREA*/}
                {/*BITMARK Header*/}
                {this.state.testingResult === null &&
                <View style={[styles.topArea, styles.paddingContent]}>
                  <Text style={[styles.title]}>BITMARK HEALTH</Text>
                  <Image style={styles.logo} source={require('assets/imgs/bitmark-health-icon.png')} />
                </View>
                }

                {/*Failed Test*/}
                {this.state.testingResult === false &&
                <View style={[styles.topArea, styles.paddingContent, {backgroundColor: '#FF003C', borderTopLeftRadius: 10, borderTopRightRadius: 10}]}>
                  <Text style={[styles.testResultMessage]}>WRONG COMBINATION</Text>
                </View>
                }

                {/*Successful test*/}
                {this.state.testingResult === true &&
                <View style={[styles.topArea, styles.paddingContent, {backgroundColor: '#0060F2', borderTopLeftRadius: 10, borderTopRightRadius: 10}]}>
                  <Text style={[styles.testResultMessage]}>VAULT UNLOCKED</Text>
                </View>
                }

                {/*CONTENT*/}
                <View style={[styles.contentArea, styles.paddingContent]}>
                  {/*PHRASE WORDS*/}
                  <View style={styles.phraseWordsArea}>
                    <View style={[styles.phraseWordsList]}>
                      {/*SELECTED WORDS*/}
                      {/*Smaller list*/}
                      <FlatList data={this.state.smallerList}
                                keyExtractor={(item, index) => index + ''}
                                scrollEnabled={false}
                                extraData={this.state}
                                renderItem={({ item, index }) => {
                                  return (
                                    <View style={[styles.recoveryPhraseSet,]}>
                                      <Text style={styles.recoveryPhraseIndex}>{index + 1}.</Text>
                                      <View style={[styles.phraseWordContainer]}>
                                        {/*Input word*/}
                                        <TextInput
                                          style={[styles.recoveryPhraseInputWord, {
                                            borderColor: this.state.testingResult === false ? '#FF4444' : '#0060F2',
                                            color: this.state.testingResult === false ? '#FF4444' : '#0060F2',
                                          }]}
                                          ref={(r) => { this.inputtedRefs[item.key] = r; }}
                                          value={item.word.toUpperCase()}
                                          autoCorrect={false}
                                          autoCapitalize="none"
                                          onChangeText={(text) => this.onChangeText.bind(this)(item.key, text)}
                                          onFocus={() => this.onFocus.bind(this)(item.key)}
                                          onSubmitEditing={() => this.onSubmitWord.bind(this)(item.word)}
                                        />
                                      </View>
                                    </View>
                                  )
                                }}
                      />
                      {/*Bigger list*/}
                      <FlatList data={this.state.biggerList}
                                keyExtractor={(item, index) => index + ''}
                                style={{ marginLeft: 9 }}
                                scrollEnabled={false}
                                extraData={this.state}
                                renderItem={({ item, index }) => {
                                  return (
                                    <View style={[styles.recoveryPhraseSet,]}>
                                      <Text style={styles.recoveryPhraseIndex}>{item.key + 1}.</Text>
                                      <View style={[styles.phraseWordContainer]}>
                                        {/*Input word*/}
                                        <TextInput
                                          style={[styles.recoveryPhraseInputWord, {
                                            borderColor: this.state.testingResult === false ? '#FF4444' : '#0060F2',
                                            color: this.state.testingResult === false ? '#FF4444' : '#0060F2',
                                          }]}
                                          ref={(r) => { this.inputtedRefs[item.key] = r; }}
                                          value={item.word.toUpperCase()}
                                          autoCorrect={false}
                                          autoCapitalize="none"
                                          onChangeText={(text) => this.onChangeText.bind(this)(item.key, text)}
                                          onFocus={() => this.onFocus.bind(this)(item.key)}
                                          onSubmitEditing={() => this.onSubmitWord.bind(this)(item.word)}
                                        />
                                      </View>
                                    </View>
                                  )
                                }}
                      />
                    </View>
                  </View>

                  {/*DESC*/}
                  <View style={styles.introductionTextArea}>
                    <Text style={[styles.introductionTitle]}>Access existing vault</Text>
                    <Text style={[styles.introductionDescription]}>
                      Type all 12-word phrase in the exact sequence.
                    </Text>
                  </View>
                </View>

                {/*BOTTOM AREA*/}
                <View style={[styles.bottomArea, styles.paddingContent, {height: 80}]}>
                  {/*Buttons*/}
                  <View style={{flexDirection: 'row'}}>
                    {/*Go Back*/}
                    <TouchableOpacity style={[styles.buttonNext]} onPress={Actions.pop}>
                      <Text style={[styles.buttonNextText]}>GO BACK</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
        </View>

        {/*KEYBOARD & SUGGESTIONS*/}
        {this.state.keyboardHeight > 0 &&
          <Animated.View style={[styles.keyboardExternal, { bottom: this.state.keyboardExternalBottom, opacity: this.state.keyboardExternalOpacity, }]}>
            <TouchableOpacity style={styles.nextButton} onPress={() => this.selectedIndex.bind(this)((this.state.selectedIndex + 1) % this.state.numberPhraseWords)}>
              <Image style={styles.nextButtonImage} source={require('assets/imgs/arrow_down_enable.png')} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.prevButton} onPress={() => this.selectedIndex.bind(this)((this.state.selectedIndex + (this.state.numberPhraseWords - 1)) % this.state.numberPhraseWords)}>
              <Image style={styles.prevButtonImage} source={require('assets/imgs/arrow_up_enable.png')} />
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
            <TouchableOpacity style={styles.doneButton} onPress={this.doCheckPhraseWords.bind(this)} disabled={this.state.status !== statuses.done}>
              <Text style={[styles.doneButtonText, { color: this.state.status === statuses.done ? '#0060F2' : 'gray' }]}>{i18n.t('LoginComponent_doneButtonText')}</Text>
            </TouchableOpacity>
          </Animated.View>}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: 'white',
    padding: convertWidth(16),
  },
  bodyContent: {
    flex: 1,
    backgroundColor: '#F4F2EE',
    borderRadius: 10,
    paddingLeft: convertWidth(16),
    paddingRight: convertWidth(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },

  topArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
  },
  contentArea: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: '100%',
  },
  bottomArea: {
    height: config.isIPhoneX ? 70 : 50,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    paddingBottom: 18,
  },
  paddingContent: {
    paddingLeft: convertWidth(16),
    paddingRight: convertWidth(16)
  },
  logo: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  title: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next W1G' : 'Avenir light',
    fontSize: 10,
    color: 'rgba(0, 0, 0, 0.87)'
  },
  phraseWordsArea: {
    marginTop: 40,
    width: '100%',
    flex: 1,
    justifyContent: 'flex-start'
  },
  phraseWordsList: {
    paddingTop: convertWidth(30),
    paddingBottom: convertWidth(30),
    borderTopWidth: 3,
    borderBottomWidth: 3,
    borderColor: '#FF003C',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  phraseWordContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  recoveryPhraseSet: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginTop: 2,
    paddingTop: 3,
    paddingBottom: 3,
    width: convertWidth(140),
  },
  recoveryPhraseIndex: {
    width: convertWidth(39),
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next W1G' : 'Avenir Light',
    fontWeight: '300',
    fontSize: 10,
    color: 'rgba(0, 0, 0, 0.87)'
  },
  recoveryPhraseInputWord: {
    width: '100%',
    height: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next W1G' : 'Andale Mono',
    fontSize: 13,
    paddingLeft: 5,
    paddingRight: 5,
  },
  introductionTextArea: {
    marginTop: 20,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    width: '100%',
    height: 110,
  },
  introductionTitle: {
    marginTop: 25,
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next W1G' : 'Avenir black',
    color: 'rgba(0, 0, 0, 0.87)',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'left',
  },
  introductionDescription: {
    marginTop: 10,
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next W1G' : 'Avenir book',
    fontWeight: '300',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(0, 0, 0, 0.6)',
    textAlign: 'left',
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
  buttonNext: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next W1G' : 'Avenir black',
    fontSize: 10,
    color: '#FF003C',
    marginLeft: 15,
  },
  buttonNextText: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next W1G' : 'Avenir Black',
    fontWeight: '900',
    fontSize: 10,
    color: '#FF003C'
  },

});

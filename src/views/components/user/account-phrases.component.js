
import React, { Component } from 'react';
import {
  StyleSheet,
  Image, View, TouchableOpacity, Text, FlatList, TextInput, Keyboard, Animated, SafeAreaView, ScrollView
} from 'react-native';
import PropTypes from 'prop-types';

import { AppProcessor, EventEmitterService, } from 'src/processors';
import { convertWidth, dictionaryPhraseWords } from 'src/utils';
import { config, constants } from 'src/configs';
import { Actions } from 'react-native-router-flux';
import { ShadowComponent, ShadowTopComponent } from 'src/views/commons';

const STEPS = {
  warning: 0,
  init: 1,
  writeDownPhraseWordsInform: 2,
  testing: 3,
};

const NUMBER_CHARACTERS_OF_PHRASE_WORD = 8;

const fillUpArrayByEmptyString = (array, length) => {
  let arrayLength = array.length;
  for (let i = 0; i < length - arrayLength; i++) {
    array.push('')
  }

  return array;
};

export class AccountPhraseComponent extends Component {
  static propTypes = {
    isLogout: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.inputtedRefs = {};
    this.state = {
      step: STEPS.warning,
      smallerList: [],
      biggerList: [],
      phraseWords: [],
      randomWords: [],
      selectingIndex: -1,
      remainIndex: [],
      testingResult: null,
      keyboardExternalBottom: new Animated.Value(0),
      keyboardExternalOpacity: new Animated.Value(0),
      keyboardExternalDataSource: dictionaryPhraseWords,
    }
  }

  componentDidMount() {
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.onKeyboardDidShow.bind(this));
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.onKeyboardDidHide.bind(this));
    this.keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', this.onKeyboardWillHide.bind(this));
  }

  accessPhraseWords() {
    AppProcessor.doGetCurrentAccount().then((userInfo) => {
      if (this.props.isLogout) {
        let phraseWords = [];
        for (let index = 0; index < userInfo.phraseWords.length; index++) {
          let word = userInfo.phraseWords[index];
          let characters = userInfo.phraseWords[index].split('');
          fillUpArrayByEmptyString(characters, NUMBER_CHARACTERS_OF_PHRASE_WORD);
          phraseWords.push({ index, word, characters });
        }
        this.goToTest(phraseWords);
      } else {
        this.computePhraseWords(userInfo.phraseWords);
      }
    });
  }

  componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  onKeyboardDidShow(keyboardEvent) {
    let keyboardHeight = keyboardEvent.endCoordinates.height - (config.isIPhoneX ? 35 : 0);
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
  }
  onKeyboardWillHide() {
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


  computePhraseWords(sourcePhraseWords) {
    let smallerList = [];
    let biggerList = [];
    let phraseWords = [];

    for (let index = 0; index < sourcePhraseWords.length; index++) {
      let word = sourcePhraseWords[index];
      let characters = sourcePhraseWords[index].split('');
      fillUpArrayByEmptyString(characters, NUMBER_CHARACTERS_OF_PHRASE_WORD);

      if (index < (sourcePhraseWords.length / 2)) {
        smallerList.push({ word, characters });
      } else {
        biggerList.push({ word, characters });
      }
      phraseWords.push({ index, word, characters });
    }

    this.setState({ step: STEPS.init, phraseWords, smallerList, biggerList });
  }

  goToTest(phraseWords) {
    let numberWorldFilled = phraseWords.length - 3;
    let countPreFill = 0;
    let smallerList = [];
    let biggerList = [];
    for (let index in phraseWords) {
      let word = phraseWords[index].word;
      let characters = word.split('');
      fillUpArrayByEmptyString(characters, NUMBER_CHARACTERS_OF_PHRASE_WORD);

      if (index < (phraseWords.length / 2)) {
        smallerList.push({ word, characters });
      } else {
        biggerList.push({ word, characters });
      }
    }
    while (countPreFill < numberWorldFilled) {
      let randomIndex = Math.floor(Math.random() * phraseWords.length);
      if (!phraseWords[randomIndex].selected) {
        phraseWords[randomIndex].selected = true;
        if (randomIndex < (phraseWords.length / 2)) {
          smallerList[randomIndex].selected = true;
        } else {
          biggerList[randomIndex - (phraseWords.length / 2)].selected = true;
        }
        countPreFill++;
      }
    }
    let randomWords = [];
    let remainIndex = [];
    for (let index = 0; index < phraseWords.length; index++) {
      if (!phraseWords[index].selected) {
        let word = phraseWords[index].word;
        let characters = word.split('');
        fillUpArrayByEmptyString(characters, NUMBER_CHARACTERS_OF_PHRASE_WORD);

        randomWords.push({ word, characters });
        remainIndex.push(index);
      }
    }
    randomWords = randomWords.sort((a, b) => a.word < b.word ? -1 : (a.word > b.word ? 1 : 0));

    randomWords.forEach(item => item.selected = null);
    smallerList.forEach((item, index) => {
      item.word = item.selected ? item.word : '';
      item.characters = item.selected ? item.characters : undefined;
      item.key = index;
    });
    biggerList.forEach((item, index) => {
      item.word = item.selected ? item.word : '';
      item.characters = item.selected ? item.characters : undefined;
      item.key = (phraseWords.length / 2) + index;
    });
    this.setState({
      step: STEPS.testing,
      testingResult: null,
      randomWords,
      phraseWords,
      smallerList,
      biggerList,
      remainIndex,
      selectingIndex: remainIndex[0],
    });
  }

  onChangeText(index, text) {
    text = text ? text.trim().toLowerCase() : '';
    this.doFilter(text);
    if (index < (this.state.phraseWords.length / 2)) {
      let inputtedWords = this.state.smallerList;
      inputtedWords[index].word = text;
      this.setState({ smallerList: inputtedWords });
    } else {
      let inputtedWords = this.state.biggerList;
      inputtedWords[index - (this.state.phraseWords.length / 2)].word = text;
      this.setState({ biggerList: inputtedWords });
    }
  }

  onFocus(index) {
    let text = index < (this.state.phraseWords.length / 2) ? this.state.smallerList[index].word : this.state.biggerList[index - (this.state.phraseWords.length / 2)].word;
    this.setState({
      selectingIndex: index
    });
    this.inputtedRefs[index].focus();
    this.doFilter(text);
  }
  selectedIndex(index) {
    this.onFocus(index);
  }
  onSubmitWord(word) {
    let selectingIndex = this.state.selectingIndex;
    let smallerList = this.state.smallerList;
    let biggerList = this.state.biggerList;

    if (word) {
      word = word ? word.trim().toLowerCase() : '';
      this.inputtedRefs[selectingIndex].focus();
      if (selectingIndex < (this.state.phraseWords.length / 2)) {
        let inputtedWords = this.state.smallerList;
        inputtedWords[selectingIndex].word = word;
        this.setState({ smallerList: inputtedWords });
      } else {
        let inputtedWords = this.state.biggerList;
        inputtedWords[selectingIndex - (this.state.phraseWords.length / 2)].word = word;
        this.setState({ biggerList: inputtedWords });
      }
    }

    if (word) {
      this.checkInputWrods(smallerList, biggerList);
    }
  }

  checkInputWrods(smallerList, biggerList) {
    smallerList = smallerList || this.state.smallerList;
    biggerList = biggerList || this.state.biggerList;
    let testingResult = null;
    if (this.checkIfFinishedInputting()) {
      testingResult = true;

      for (let index = 0; index < this.state.phraseWords.length; index++) {
        if ((index < (this.state.phraseWords.length / 2) && this.state.phraseWords[index].word !== smallerList[index].word) ||
          (index >= (this.state.phraseWords.length / 2) && this.state.phraseWords[index].word !== biggerList[index - (this.state.phraseWords.length / 2)].word)) {
          testingResult = false;
          break;
        }
      }

      if (testingResult) {
        Keyboard.dismiss();
        if (this.props.isLogout) {
          AppProcessor.doLogout().then((result) => {
            if (result) {
              EventEmitterService.emit(EventEmitterService.events.APP_NEED_REFRESH, { indicator: true });
            }
          }).catch(error => {
            EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error })
          })
        } else {
          setTimeout(Actions.pop, 2000);
        }
      }

      this.setState({ testingResult });
    } else {
      // Focus on next word
      this.selectedIndex(this.getNextInputIndex());
    }
  }

  getNextInputIndex() {
    let selectingIndex = this.state.selectingIndex;
    let remainIndex = this.state.remainIndex;

    let tempIndex = remainIndex.findIndex(id => id === selectingIndex);
    let nextIndex = remainIndex[0];

    if (tempIndex !== (remainIndex.length - 1)) {
      nextIndex = remainIndex[tempIndex + 1];
    }

    return nextIndex;
  }

  getPreviousInputIndex() {
    let selectingIndex = this.state.selectingIndex;
    let remainIndex = this.state.remainIndex;

    let tempIndex = remainIndex.findIndex(id => id === selectingIndex);
    let previousIndex = 0;

    if (tempIndex > 0) {
      previousIndex = remainIndex[tempIndex - 1];
    }

    return previousIndex;
  }

  checkIfFinishedInputting() {
    let finishedInputting = true;

    let remainingIndexes = this.state.remainIndex;
    let smallerList = this.state.smallerList;
    let biggerList = this.state.biggerList;

    for (let i = 0; i < remainingIndexes.length; i++) {
      let index = remainingIndexes[i];

      if (index < (this.state.phraseWords.length / 2)) {
        if (!smallerList[index].word) {
          finishedInputting = false;
          break;
        }
      } else {
        if (!biggerList[index - (this.state.phraseWords.length / 2)].word) {
          finishedInputting = false;
          break;
        }
      }
    }

    return finishedInputting;
  }

  doFilter(text) {
    let keyboardExternalDataSource = dictionaryPhraseWords.filter(word => word.toLowerCase().indexOf(text.toLowerCase()) === 0);
    this.setState({ keyboardExternalDataSource });
  }

  resetTest() {
    this.computePhraseWords(this.state.phraseWords);
    this.inputtedRefs = {};

    this.setState({
      step: STEPS.init,
      testingResult: null
    });
  }

  render() {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={styles.wrapper}>
          <View style={styles.body}>
            {/*GENERATE PHRASE WORDS*/}

            {this.state.step === STEPS.warning && <ShadowComponent style={{ flex: 1, }}>
              <ShadowTopComponent style={{ height: 40 }} contentStyle={styles.titleArea}>
                <Text style={styles.titleText}>WARNING</Text>
                <Image style={styles.warningIcon} source={require('assets/imgs2/warning_icon.png')} />
              </ShadowTopComponent>
              <ScrollView style={[styles.bodyContent, styles.paddingContent]} contentContainerStyle={{ flexGrow: 1, }}>
                {!this.props.isLogout && <View style={styles.warningArea}>
                  <Text style={styles.warningTitle}>View your vault key phrase.</Text>
                  {/* <Text style={styles.warningTitle}>{i18n.t('AccountPhraseComponent_warningTitle1')}</Text> */}
                  <Text style={styles.warningMessage}>{i18n.t('AccountPhraseComponent_warningMessage1')}</Text>
                </View>}
                {this.props.isLogout && <View style={styles.warningArea}>
                  <Text style={styles.warningTitle}>Lock your vault.</Text>
                  {/* <Text style={styles.warningTitle}>{i18n.t('AccountPhraseComponent_warningTitle2')}</Text> */}
                  <Text style={styles.warningMessage}>{i18n.t('AccountPhraseComponent_warningMessage2')}</Text>
                </View>}
              </ScrollView>
              <View style={styles.bottomButtonArea}>
                <View style={styles.dotArea}>
                  <View style={styles.activeDot} />
                  <View style={styles.normalDot} />
                  {!this.props.isLogout && <View style={styles.normalDot} />}
                </View>
                <TouchableOpacity style={styles.bottomButton} onPress={Actions.pop}>
                  <Text style={styles.bottomButtonText}>CANCEL</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.bottomButton} onPress={this.accessPhraseWords.bind(this)}>
                  <Text style={styles.bottomButtonText}>NEXT</Text>
                </TouchableOpacity>
              </View>
            </ShadowComponent>}


            {(this.state.step === STEPS.init) &&
              <View style={styles.bodyContent}>
                <View style={{ flex: 1 }}>
                  {/*TOP AREA*/}
                  <View style={[styles.topArea]}>
                    <Text style={[styles.title]}>BITMARK HEALTH</Text>
                    <Image style={styles.logo} source={require('assets/imgs/bitmark-health-icon.png')} />
                  </View>

                  {/*CONTENT*/}
                  <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, }}>
                    <View style={styles.contentArea}>
                      {/*PHRASE WORDS*/}
                      <View style={styles.phraseWordsArea}>
                        <View style={[styles.phraseWordsList]}>
                          <FlatList data={this.state.smallerList}
                            keyExtractor={(item, index) => index + ''}
                            scrollEnabled={false}
                            extraData={this.state}
                            renderItem={({ item, index }) => {
                              return (
                                <View style={styles.recoveryPhraseSet}>
                                  <Text style={styles.recoveryPhraseIndex}>{index + 1}.</Text>
                                  <View style={[styles.phraseWordContainer]}>
                                    {item.characters.map((character, cIndex) => <View style={styles.characterBound} key={'character_' + cIndex}>
                                      <Text style={[styles.character]} >{character.toUpperCase()}</Text>
                                    </View>)}
                                  </View>
                                </View>
                              )
                            }}
                          />
                          <FlatList data={this.state.biggerList}
                            keyExtractor={(item, index) => index + ''}
                            style={{ marginLeft: 20 }}
                            scrollEnabled={false}
                            extraData={this.state}
                            renderItem={({ item, index }) => {
                              return (
                                <View style={styles.recoveryPhraseSet}>
                                  <Text style={styles.recoveryPhraseIndex}>{index + (this.state.phraseWords.length / 2) + 1}.</Text>
                                  <View style={[styles.phraseWordContainer]}>
                                    {item.characters.map((character, cIndex) => <View style={styles.characterBound} key={'character_' + cIndex}>
                                      <Text style={[styles.character]} >{character.toUpperCase()}</Text>
                                    </View>)}
                                  </View>
                                </View>
                              )
                            }}
                          />
                        </View>

                        {/*INFO LINK*/}
                        {(this.state.step === STEPS.init) &&
                          <View style={[styles.infoLinkTextContainer]}>
                            <Image style={styles.infoIcon} source={require('assets/imgs/info-icon.png')} />
                            <TouchableOpacity style={[]} onPress={() => this.setState({ step: STEPS.writeDownPhraseWordsInform })}>
                              <Text style={[styles.infoLinkText, { marginLeft: 5 }]}>Write down your key phrase on a piece of paper and keep it safe.</Text>
                            </TouchableOpacity>
                          </View>
                        }
                      </View>

                      {/*DESC*/}
                      <View style={styles.introductionTextArea}>
                        <Text style={[styles.introductionTitle]}>Your vault key phrase</Text>
                        <Text style={[styles.introductionDescription]}>
                          A 12-word phrase that only you know.
                        </Text>

                        {/*GENERATE HEALTH CODE*/}
                        {(this.state.step === STEPS.init || this.state.step === STEPS.generated) &&
                          <TouchableOpacity style={[styles.button, { marginTop: 20 }]} onPress={() => this.goToTest.bind(this)(this.state.phraseWords)}>
                            <Text style={[styles.buttonText]}>TEST YOUR KEY PHRASE</Text>
                          </TouchableOpacity>
                        }
                      </View>
                    </View>
                  </ScrollView>
                  {/*BOTTOM AREA*/}
                  <View style={[styles.bottomArea]}>
                    <View style={styles.dotArea}>
                      <View style={styles.normalDot} />
                      <View style={styles.activeDot} />
                      <View style={styles.normalDot} />
                    </View>

                    <TouchableOpacity style={[styles.buttonNext]} onPress={Actions.pop}>
                      <Text style={styles.buttonNextText}>DONE</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            }

            {/*WRITE DOWN PHRASE WORDS INFORM STEP*/}
            {this.state.step === STEPS.writeDownPhraseWordsInform &&
              <View style={[styles.bodyContent, { paddingLeft: 0, paddingRight: 0 }]}>
                <View style={{ flex: 1 }}>
                  {/*TOP AREA*/}
                  <View style={[styles.topArea, styles.paddingContent, { backgroundColor: '#FFFFFF', borderTopLeftRadius: 10, borderTopRightRadius: 10 }]}>
                    <Text style={[{ color: 'rgba(0, 0, 0, 0.6)' }]}>WRITE DOWN YOUR KEY PHRASE</Text>
                    <Image style={styles.infoIcon} source={require('assets/imgs/info-icon.png')} />
                  </View>

                  {/*CONTENT*/}
                  <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, }}>
                    <View style={[styles.contentArea, styles.paddingContent, { justifyContent: 'flex-start' }]}>
                      <View>
                        <Text style={[styles.writeDownPhraseWordsInformTitle]}>Write down your key phrase on a piece of paper and keep it safe.</Text>
                      </View>
                      <View>
                        <Text style={[styles.writeDownPhraseWordsInformText]}>Internet services normally require user accounts that are stored on servers in “the cloud”. Servers can be (and are often) hacked, thus your data and privacy are constantly at risk.</Text>
                        <Text style={[styles.writeDownPhraseWordsInformText]}>In contrast, your vault is stored on your phone and secured by a 12-word phrase that only you know. Think of this as a magic phrase — it instantly restores all your data if your phone is ever lost, stolen, or damaged.</Text>
                        <Text style={[styles.writeDownPhraseWordsInformText]}>Keep it safe and protect what’s most important: control of your health.</Text>
                      </View>
                    </View>
                  </ScrollView>

                  {/*BOTTOM AREA*/}
                  <View style={[styles.bottomArea, styles.paddingContent, { justifyContent: 'flex-end' }]}>
                    <TouchableOpacity style={[styles.buttonNext]} onPress={() => { this.setState({ step: STEPS.init }) }}>
                      <Text style={[styles.buttonNextText]}>I GOT IT</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            }

            {/*TEST PHRASE WORDS*/}
            {this.state.step === STEPS.testing &&
              <View style={[styles.bodyContent, { paddingLeft: 0, paddingRight: 0 }]} contentContainerStyle={{ flexGrow: 1, }}>
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
                    <View style={[styles.topArea, styles.paddingContent, { backgroundColor: '#FF003C', borderTopLeftRadius: 10, borderTopRightRadius: 10 }]}>
                      <Text style={[styles.testResultMessage]}>WRONG COMBINATION</Text>
                    </View>
                  }

                  {/*Successful test*/}
                  {this.state.testingResult === true &&
                    <View style={[styles.topArea, styles.paddingContent, { backgroundColor: '#0060F2', borderTopLeftRadius: 10, borderTopRightRadius: 10 }]}>
                      <Text style={[styles.testResultMessage]}>{(this.props.isLogout ? 'VAULT LOCKED' : 'Correct combination').toUpperCase()}</Text>
                    </View>
                  }

                  {/*CONTENT*/}
                  <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, }}>
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
                                <TouchableOpacity style={[styles.recoveryPhraseSet,]}
                                  disabled={item.selected}
                                  onPress={() => {
                                    this.setState({ selectingIndex: index });
                                    this.inputtedRefs[item.key].focus();
                                  }}
                                >
                                  <Text style={styles.recoveryPhraseIndex}>{index + 1}.</Text>
                                  <View style={[styles.phraseWordContainer, item.characters ? {} : { paddingTop: 0, paddingBottom: 0, paddingRight: 0, backgroundColor: 'transparent' }]}>
                                    {/*Selected word*/}
                                    {item.characters && item.characters.map((character, cIndex) => <View style={styles.characterBound} key={'character_' + cIndex}>
                                      <Text style={[styles.character, { color: item.selected ? '#828282' : '#FF4444' }]} >{character.toUpperCase()}</Text>
                                    </View>)}
                                    {/*Input word*/}
                                    {!item.characters &&
                                      <View style={[styles.characterBound, {
                                        backgroundColor: 'white',
                                        borderWidth: 1,
                                        borderColor: this.state.testingResult === false ? '#FF4444' : '#0060F2',
                                        color: this.state.testingResult === false ? '#FF4444' : '#0060F2',
                                      }, item.characters ? {} : { marginLeft: 0, height: 20, paddingLeft: 1, paddingRight: 1, }]}>
                                        <TextInput
                                          style={[styles.recoveryPhraseInputWord, { color: this.state.testingResult === false ? '#FF4444' : '#0060F2', }]}
                                          ref={(r) => { this.inputtedRefs[item.key] = r; }}
                                          value={item.word.toUpperCase()}
                                          returnKeyType={'done'}
                                          autoCorrect={false}
                                          autoCapitalize="none"
                                          onChangeText={(text) => this.onChangeText.bind(this)(item.key, text)}
                                          onFocus={() => this.onFocus.bind(this)(item.key)}
                                          onSubmitEditing={() => this.onSubmitWord.bind(this)(item.word)}
                                        />
                                      </View>
                                    }
                                  </View>
                                </TouchableOpacity>
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
                                <TouchableOpacity style={[styles.recoveryPhraseSet,]}
                                  disabled={item.selected}
                                  onPress={() => {
                                    this.setState({ selectingIndex: index + (this.state.phraseWords.length / 2) });
                                    this.inputtedRefs[item.key].focus();
                                  }}
                                >
                                  <Text style={styles.recoveryPhraseIndex}>{index + (this.state.phraseWords.length / 2) + 1}.</Text>
                                  <View style={[styles.phraseWordContainer, item.characters ? {} : { paddingTop: 0, paddingBottom: 0, paddingRight: 0, backgroundColor: 'transparent' }]}>
                                    {/*Selected word*/}
                                    {item.characters && item.characters.map((character, cIndex) => <View style={styles.characterBound} key={'character_' + cIndex}>
                                      <Text style={[styles.character, { color: item.selected ? '#828282' : '#FF4444' }]} >{character.toUpperCase()}</Text>
                                    </View>)}
                                    {/*Input word*/}
                                    {!item.characters &&
                                      <View style={[styles.characterBound, {
                                        backgroundColor: 'white',
                                        borderWidth: 1,
                                        borderColor: this.state.testingResult === false ? '#FF4444' : '#0060F2',
                                      }, item.characters ? {} : { marginLeft: 0, height: 20, paddingLeft: 1, paddingRight: 1, }]}>
                                        <TextInput
                                          style={[styles.recoveryPhraseInputWord, { color: this.state.testingResult === false ? '#FF4444' : '#0060F2', }]}
                                          ref={(r) => { this.inputtedRefs[item.key] = r; }}
                                          value={item.word.toUpperCase()}
                                          returnKeyType={'done'}
                                          autoCorrect={false}
                                          autoCapitalize="none"
                                          onChangeText={(text) => this.onChangeText.bind(this)(item.key, text)}
                                          onFocus={() => this.onFocus.bind(this)(item.key)}
                                          onSubmitEditing={() => this.onSubmitWord.bind(this)(item.word)}
                                        />
                                      </View>
                                    }
                                  </View>
                                </TouchableOpacity>
                              )
                            }}
                          />
                        </View>
                      </View>

                      {/*DESC*/}
                      <View style={styles.introductionTextArea}>
                        <Text style={[styles.introductionTitle]}>{this.props.isLogout ? 'Lock your vault' : 'Test your key phrase, unlock your vault'}</Text>
                        <Text style={[styles.introductionDescription]}>
                          Enter the three remaining words.
                      </Text>
                      </View>
                    </View>
                  </ScrollView>
                  {/*BOTTOM AREA*/}
                  <View style={[styles.bottomArea, styles.paddingContent, { height: 80 }]}>
                    <View style={styles.dotArea}>
                      <View style={styles.normalDot} />
                      {!this.props.isLogout && <View style={styles.normalDot} />}
                      <View style={styles.activeDot} />
                    </View>

                    {/*Buttons*/}
                    <View style={{ flexDirection: 'row' }}>
                      {/*Go Back*/}
                      <TouchableOpacity style={[styles.buttonNext]} onPress={Actions.pop}>
                        <Text style={[styles.buttonNextText]}>GO BACK</Text>
                      </TouchableOpacity>
                      {this.props.isLogout && <TouchableOpacity style={[styles.buttonNext]} onPress={() => this.checkInputWrods.bind(this)()}>
                        <Text style={[styles.buttonNextText]}>NEXT</Text>
                      </TouchableOpacity>}
                    </View>
                  </View>
                </View>
              </View>
            }
          </View>

          {/*KEYBOARD & SUGGESTIONS*/}
          {this.state.keyboardHeight > 0 &&
            <Animated.View style={[styles.keyboardExternal, { bottom: this.state.keyboardExternalBottom, opacity: this.state.keyboardExternalOpacity, }]}>
              <TouchableOpacity style={styles.nextButton} onPress={() => this.selectedIndex.bind(this)(this.getNextInputIndex.bind(this)())}>
                <Image style={styles.nextButtonImage} source={require('assets/imgs/arrow_down_enable.png')} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.prevButton} onPress={() => this.selectedIndex.bind(this)(this.getPreviousInputIndex.bind(this)())}>
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
            </Animated.View>}
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  body: {
    flex: 1,
    backgroundColor: 'white',
    padding: convertWidth(16),
    paddingTop: convertWidth(16),
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
  titleArea: {
    height: 40,
    paddingLeft: convertWidth(16), paddingRight: convertWidth(16),
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  titleText: {
    fontFamily: 'AvenirNextW1G-Light',
    fontSize: 10, color: 'rgba(0, 0, 0, 0.6)'
  },
  warningIcon: {
    width: 24, height: 24, resizeMode: 'contain'
  },
  warningArea: {
    flex: 1,
    paddingTop: 56,
  },
  warningTitle: {
    fontFamily: 'AvenirNextW1G-Bold',
    fontWeight: '600', fontSize: 14,
    width: '100%',
  },
  warningMessage: {
    marginTop: 20,
    fontFamily: 'AvenirNextW1G-Regular',
    fontWeight: '300', fontSize: 14,
    width: '100%',
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
    justifyContent: 'space-between',
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
    fontFamily: 'AvenirNextW1G-Light',
    fontSize: 10,
    color: 'rgba(0, 0, 0, 0.87)'
  },
  testResultMessage: {
    fontFamily: 'AvenirNextW1G-Bold',
    fontSize: 10,
    color: '#FFFFFF'
  },
  introductionTextArea: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: '100%',
  },
  introductionTitle: {
    marginTop: 25,
    fontFamily: 'AvenirNextW1G-Bold',
    color: 'rgba(0, 0, 0, 0.87)',
    fontSize: 24,
    textAlign: 'left',
  },
  introductionDescription: {
    marginTop: 10,
    fontFamily: 'AvenirNextW1G-Regular',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(0, 0, 0, 0.6)',
    textAlign: 'left',
  },
  phraseWordsArea: {
    marginTop: 40,
    width: '100%',
    flex: 1,
    justifyContent: 'flex-start',
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
    justifyContent: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingTop: 2, paddingBottom: 2,
    paddingRight: 2,
  },
  characterBound: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    height: 16,
    borderRadius: 3, borderWidth: 0.1, borderColor: '#F1F1F1',
    backgroundColor: '#F1F1F1',
    marginLeft: 2,
  },
  character: {
    textAlign: 'center', fontFamily: 'Andale Mono', fontSize: 13,
    color: 'rgba(0, 0, 0, 0.6)',
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
    fontFamily: 'AvenirNextW1G-Light',
    fontSize: 10,
    color: 'rgba(0, 0, 0, 0.87)'
  },
  recoveryPhraseInputWord: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Andale Mono',
    fontSize: 13,
  },
  infoLinkTextContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
    width: '100%',
    paddingLeft: 5,
    paddingRight: 5,
  },
  infoIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain'
  },
  infoLinkText: {
    textDecorationLine: 'underline',
    color: '#0060F2',
    marginLeft: 5,
    fontFamily: 'AvenirNextW1G-Regular',
    fontSize: 14,
  },
  writeDownPhraseWordsInformTitle: {
    marginTop: 50,
    fontFamily: 'AvenirNextW1G-Regular',
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
  },
  writeDownPhraseWordsInformText: {
    marginTop: 20,
    fontFamily: 'AvenirNextW1G-Regular',
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
  },
  button: {
    height: 36,
    paddingLeft: convertWidth(16),
    paddingRight: convertWidth(16),
    backgroundColor: '#0060F2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },
  buttonText: {
    fontFamily: 'AvenirNextW1G-Bold',
    fontSize: 14,
    color: 'white',
  },
  buttonNext: {
    fontFamily: 'AvenirNextW1G-Bold',
    fontSize: 16,
    color: '#FF003C',
    marginLeft: 15,
  },
  buttonNextText: {
    fontFamily: 'AvenirNextW1G-Bold',
    fontSize: 16,
    color: '#FF003C'
  },
  keyboardExternal: {
    position: 'absolute',
    width: '100%',
    height: constants.keyboardExternalHeight,
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    paddingLeft: 8,
    paddingRight: 8,
    backgroundColor: '#EEEFF1',
  },
  selectionList: {
    flex: 1,
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

  bottomButtonArea: {
    padding: convertWidth(20),
    backgroundColor: '#F4F2EE',
    height: 71,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  dotArea: {
    flexDirection: 'row',
  },
  activeDot: {
    width: 8, height: 8,
    borderWidth: 1, borderColor: '#FF003C', borderRadius: 4,
    backgroundColor: '#FF003C',
    marginRight: 8,
  },
  normalDot: {
    width: 8, height: 8,
    borderWidth: 1, borderColor: 'rgba(0, 0, 0, 0.6)', borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    marginRight: 8,
  },
  bottomButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
  },
  bottomButtonText: {
    fontFamily: 'AvenirNextW1G-Bold',
    fontSize: 16, color: '#FF003C',
  }
});
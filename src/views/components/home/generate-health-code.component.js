import React, { Component } from 'react';
import {
  StyleSheet,
  Image, View, TouchableOpacity, Text, FlatList, TextInput, Keyboard, Animated, SafeAreaView
} from 'react-native';

import { AppProcessor, EventEmitterService } from 'src/processors';
import { convertWidth, dictionaryPhraseWords } from 'src/utils';
import { config } from 'src/configs';
import { constants } from "../../../configs";

const STEPS = {
  init: 1,
  generated: 2,
  writeDownPhraseWordsInform: 3,
  testing: 4,
};

const INIT_PHRASE_WORDS = ['', '', '', '', '', '', '', '', '', '', '', ''];
const NUMBER_CHARACTERS_OF_PHRASE_WORD = 8;

const fillUpArrayByEmptyString = (array, length) => {
  let arrayLength = array.length;
  for (let i = 0; i < length - arrayLength; i++) {
    array.push('')
  }

  return array;
};

export class GenerateHealthCodeComponent extends Component {
  constructor(props) {
    super(props);
    this.inputtedRefs = {};
    this.state = {
      step: STEPS.init,
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
    this.computePhraseWords(INIT_PHRASE_WORDS);
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.onKeyboardDidShow.bind(this));
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.onKeyboardDidHide.bind(this));
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

  async loginWithPhraseWords() {
    let phraseWords = this.state.phraseWords.map(item => item.word);
    await AppProcessor.doLogin(phraseWords, false);
    EventEmitterService.emit(EventEmitterService.events.APP_NEED_REFRESH);
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

    this.setState({ phraseWords, smallerList, biggerList });
  }

  async generatePhraseWords() {
    let phraseInfo = await AppProcessor.doGeneratePhrase();
    this.phraseWords = phraseInfo.phraseWords;
    this.computePhraseWords(phraseInfo.phraseWords);
    this.setState({ step: STEPS.generated });
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

    console.log('randomWords:', randomWords);
    console.log('smallerList:', smallerList);
    console.log('biggerList:', biggerList);
    console.log('remainIndex:', remainIndex);
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
    if (index < (this.phraseWords.length / 2)) {
      let inputtedWords = this.state.smallerList;
      inputtedWords[index].word = text;
      this.setState({ smallerList: inputtedWords });
    } else {
      let inputtedWords = this.state.biggerList;
      inputtedWords[index - (this.phraseWords.length / 2)].word = text;
      this.setState({ biggerList: inputtedWords });
    }
    // this.checkStatusInputting();
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
    // this.checkStatusInputting();
  }
  onSubmitWord(word) {
    console.log('word:', word);
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
      let testingResult = null;
      if (this.checkIfFinishedInputting()) {
        testingResult = true;

        for (let index = 0; index < this.state.phraseWords.length; index++) {
          if ((index < (this.state.phraseWords.length / 2) && this.state.phraseWords[index].word !== smallerList[index].word) ||
            (index >= (this.state.phraseWords.length / 2) && this.state.phraseWords[index].word !== biggerList[index - (this.state.phraseWords.length / 2)].word)) {
            testingResult = false;
            console.log('testingResult  false :', index);
            break;
          }
        }

        if (testingResult) {
          this.loginWithPhraseWords();
        }

        this.setState({testingResult});
      } else {
        // Focus on next word
        this.selectedIndex(this.getNextInputIndex());
      }
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
    this.computePhraseWords(INIT_PHRASE_WORDS);
    this.inputtedRefs = {};

    this.setState({
      step: STEPS.init,
      testingResult: null
    });
  }

  render() {
    return (
      <SafeAreaView style={{flex: 1}}>
        <View style={styles.wrapper}>
          <View style={styles.body}>
            {/*GENERATE PHRASE WORDS*/}
            {(this.state.step === STEPS.init || this.state.step === STEPS.generated) &&
            <View style={[styles.bodyContent]}>
              <View style={{ flex: 1 }}>
                {/*TOP AREA*/}
                <View style={[styles.topArea]}>
                  <Text style={[styles.title]}>BITMARK HEALTH</Text>
                  <Image style={styles.logo} source={require('assets/imgs/bitmark-health-icon.png')} />
                </View>

                {/*CONTENT*/}
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
                                        {item.characters.map((character, index) => <Text style={[styles.character]} key={'character_' + index}>{character.toUpperCase()}</Text>)}
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
                                        {item.characters.map((character, index) => <Text style={[styles.character]} key={'character_' + index}>{character.toUpperCase()}</Text>)}
                                      </View>
                                    </View>
                                  )
                                }}
                      />
                    </View>

                    {/*INFO LINK*/}
                    {(this.state.step === STEPS.generated) &&
                    <View style={[styles.infoLinkTextContainer]}>
                      <Image style={styles.infoIcon} source={require('assets/imgs/info-icon.png')}/>
                      <TouchableOpacity style={[]} onPress={() => this.setState({step: STEPS.writeDownPhraseWordsInform})}>
                        <Text style={[styles.infoLinkText, {marginLeft: 5}]}>Write down your key phrase on a piece of paper and keep it safe.</Text>
                      </TouchableOpacity>
                    </View>
                    }
                  </View>

                  {/*DESC*/}
                  <View style={styles.introductionTextArea}>
                    <Text style={[styles.introductionTitle]}>Set your vault key phrase</Text>
                    <Text style={[styles.introductionDescription]}>
                      A 12-word phrase that only you know.
                    </Text>

                    {/*GENERATE HEALTH CODE*/}
                    {(this.state.step === STEPS.init) &&
                    <TouchableOpacity style={[styles.button, {marginTop: 20}]} onPress={this.generatePhraseWords.bind(this)}>
                      <Text style={[styles.buttonText]}>GENERATE KEY PHRASE</Text>
                    </TouchableOpacity>}

                    {/*KEY PHRASE SET!*/}
                    {(this.state.step === STEPS.generated) &&
                    <TouchableOpacity style={[styles.button, {marginTop: 20, backgroundColor: 'rgba(0, 0, 0, 0.12)'}]}>
                      <Text style={[styles.buttonText, {color: '#000000', opacity: 0.4}]}>KEY PHRASE SET!</Text>
                    </TouchableOpacity>}
                  </View>
                </View>

                {/*BOTTOM AREA*/}
                <View style={[styles.bottomArea]}>
                  <Image style={styles.sliderIcon} source={require('assets/imgs/slider-icon-step-3.png')} />

                  <TouchableOpacity style={[styles.buttonNext]} onPress={() => {if (this.state.step === STEPS.generated) {this.goToTest.bind(this)(this.state.phraseWords)}}}>
                    <Text style={[styles.buttonNextText, { opacity: this.state.step === STEPS.init ? 0.3: 1 }]}>NEXT</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            }

            {/*WRITE DOWN PHRASE WORDS INFORM STEP*/}
            {this.state.step === STEPS.writeDownPhraseWordsInform &&
            <View style={[styles.bodyContent, {paddingLeft: 0, paddingRight: 0}]}>
              <View style={{ flex: 1 }}>
                {/*TOP AREA*/}
                <View style={[styles.topArea, styles.paddingContent, {backgroundColor: '#FFFFFF', borderTopLeftRadius: 10, borderTopRightRadius: 10}]}>
                  <Text style={[{color: 'rgba(0, 0, 0, 0.6)'}]}>WRITE DOWN YOUR KEY PHRASE</Text>
                  <Image style={styles.infoIcon} source={require('assets/imgs/info-icon.png')} />
                </View>

                {/*CONTENT*/}
                <View style={[styles.contentArea, styles.paddingContent, {justifyContent: 'flex-start'}]}>
                  <View>
                    <Text style={[styles.writeDownPhraseWordsInformTitle]}>Write down your key phrase on a piece of paper and keep it safe.</Text>
                  </View>
                  <View>
                    <Text style={[styles.writeDownPhraseWordsInformText]}>Internet services normally require user accounts that are stored on servers in “the cloud.” Servers can be (and are often) hacked, thus your data and privacy are constantly at risk.</Text>
                    <Text style={[styles.writeDownPhraseWordsInformText]}>In contrast, your vault is stored on your phone and secured by a 12-word phrase that only you know. Think of this as a magic phrase — it instantly restores all your data if your phone is ever lost, stolen, or damaged.</Text>
                    <Text style={[styles.writeDownPhraseWordsInformText]}>Keep it safe and protect what’s most important: control of your health.</Text>
                  </View>
                </View>

                {/*BOTTOM AREA*/}
                <View style={[styles.bottomArea, styles.paddingContent, {justifyContent: 'flex-end'}]}>
                  <TouchableOpacity style={[styles.buttonNext]} onPress={() => {this.setState({step: STEPS.generated})}}>
                    <Text style={[styles.buttonNextText]}>I GOT IT</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            }

            {/*TEST PHRASE WORDS*/}
            {this.state.step === STEPS.testing &&
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
                                    <TouchableOpacity style={[styles.recoveryPhraseSet,]}
                                                      disabled={item.selected}
                                                      onPress={() => this.setState({ selectingIndex: index })}
                                    >
                                      <Text style={styles.recoveryPhraseIndex}>{index + 1}.</Text>
                                      <View style={[styles.phraseWordContainer]}>
                                        {/*Selected word*/}
                                        {item.characters && item.characters.map((character, index) => <Text style={[styles.character,  {color: item.selected ? '#828282' : '#FF4444'}]} key={'character_' + index}>{character.toUpperCase()}</Text>)}
                                        {/*Input word*/}
                                        {!item.characters &&
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
                                                      onPress={() => this.setState({ selectingIndex: index + (this.state.phraseWords.length / 2) })}
                                    >
                                      <Text style={styles.recoveryPhraseIndex}>{index + (this.state.phraseWords.length / 2) + 1}.</Text>
                                      <View style={[styles.phraseWordContainer]}>
                                        {/*Selected word*/}
                                        {item.characters && item.characters.map((character, index) => <Text style={[styles.character,  {color: item.selected ? '#828282' : '#FF4444'}]} key={'character_' + index}>{character.toUpperCase()}</Text>)}
                                        {/*Input word*/}
                                        {!item.characters &&
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
                    <Text style={[styles.introductionTitle]}>Test your key phrase, unlock your vault</Text>
                    <Text style={[styles.introductionDescription]}>
                      Enter the three remaining words.
                    </Text>
                  </View>
                </View>

                {/*BOTTOM AREA*/}
                <View style={[styles.bottomArea, styles.paddingContent, {height: 80}]}>
                  <Image style={styles.sliderIcon} source={require('assets/imgs/slider-icon-step-4.png')} />

                  {/*Buttons*/}
                  <View style={{flexDirection: 'row'}}>
                    {/*Go Back*/}
                    <TouchableOpacity style={[styles.buttonNext]} onPress={this.resetTest.bind(this)}>
                      <Text style={[styles.buttonNextText]}>GO BACK</Text>
                    </TouchableOpacity>

                    {/*Next*/}
                    <TouchableOpacity style={[styles.buttonNext]} disable={this.state.testingResult !== true} onPress={() => {if (this.state.testingResult === true) {this.setState({step: STEPS.writeDownPhraseWordsInform})}}}>
                      <Text style={[styles.buttonNextText, { opacity: this.state.testingResult === true ? 1 : 0.3 }]}>NEXT</Text>
                    </TouchableOpacity></View>
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
    paddingTop: config.isIPhoneX ? constants.iPhoneXStatusBarHeight : convertWidth(16),
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
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Avenir light',
    fontSize: 10,
    color: 'rgba(0, 0, 0, 0.87)'
  },
  testResultMessage: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Avenir black',
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF'
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
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Avenir black',
    color: 'rgba(0, 0, 0, 0.87)',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'left',
  },
  introductionDescription: {
    marginTop: 10,
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Avenir book',
    fontWeight: '300',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(0, 0, 0, 0.6)',
    textAlign: 'left',
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
  character: {
    flex: 1,
    height: 20,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    backgroundColor: '#F1F1F1',
    textAlign: 'center',
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Andale Mono',
    fontSize: 13,
    lineHeight: 15,
    color: 'rgba(0, 0, 0, 0.6)'
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
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Avenir Light',
    fontWeight: '300',
    fontSize: 10,
    color: 'rgba(0, 0, 0, 0.87)'
  },
  recoveryPhraseInputWord: {
    width: '100%',
    height: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Andale Mono',
    fontSize: 13,
    paddingLeft: 5,
    paddingRight: 5,
  },
  infoLinkTextContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
    width: '100%',
    paddingLeft: 5,
    paddingRight: 5,
    height: 40,
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
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Avenir Book',
    fontSize: 14,
  },
  writeDownPhraseWordsInformTitle: {
    marginTop: 50,
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Avenir Book',
    fontSize: 14,
    fontWeight: '900',
    color: 'rgba(0, 0, 0, 0.6)',
  },
  writeDownPhraseWordsInformText: {
    marginTop: 20,
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Avenir Book',
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
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Avenir Black',
    fontSize: 14,
    fontWeight: '900',
    color: 'white',
  },
  buttonNext: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Avenir black',
    fontSize: 10,
    color: '#FF003C',
    marginLeft: 15,
  },
  buttonNextText: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Avenir Black',
    fontWeight: '900',
    fontSize: 10,
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
});
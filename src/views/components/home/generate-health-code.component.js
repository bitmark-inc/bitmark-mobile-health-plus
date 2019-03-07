import React, { Component } from 'react';
import {
  StyleSheet,
  Image, View, TouchableOpacity, Text, FlatList, TextInput, Keyboard, Animated, SafeAreaView, ScrollView, Alert,
} from 'react-native';

import { Actions } from 'react-native-router-flux';
import { AppProcessor, EventEmitterService } from 'src/processors';
import { convertWidth, dictionaryPhraseWords, delay } from 'src/utils';
import { config, constants } from 'src/configs';
import { CharacterFlapperComponent } from 'src/views/commons';
import { merge } from 'immutable';
import { CommonModel } from "src/processors/models";
import PropTypes from 'prop-types';

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
  static propTypes = {
    migrateFrom24Words: PropTypes.bool,
    sliderStartAt: PropTypes.number,
  };

  constructor(props) {
    super(props);
    this.inputtedRefs = {};
    this.migrateFrom24Words = props.migrateFrom24Words;
    this.sliderStartAt = props.sliderStartAt || 3;
    this.state = {
      step: STEPS.init,
      inputPhraseWordsString: '',
      testingResult: null,
      keyboardExternalBottom: new Animated.Value(0),
      keyboardExternalOpacity: new Animated.Value(0),
      keyboardExternalDataSource: dictionaryPhraseWords,
    };
    this.flapperRefs = {};
  }

  componentDidMount() {
    this.computePhraseWords(INIT_PHRASE_WORDS, {}, true);
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.onKeyboardDidShow.bind(this));
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.onKeyboardDidHide.bind(this));
    this.keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', this.onKeyboardWillHide.bind(this));
  }

  componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
    this.keyboardWillHideListener.remove();
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

  testPhraseWords() {
    let inputPhraseWordsString = this.state.inputPhraseWordsString.trim();
    let testingResult = inputPhraseWordsString == this.phraseWords.join(' ');
    this.setState({testingResult});

    if (testingResult) {
      this.loginWithPhraseWords(this.phraseWords);
    }
  }

  goToTest() {
    this.setState({
      step: STEPS.testing,
      testingResult: null,
    });
  }

  async loginWithPhraseWords(phraseWords) {
    if (this.migrateFrom24Words) {
      Actions.whatNext({twelveWords: phraseWords});
    } else {
      await AppProcessor.doLogin(phraseWords, false);

      // Add metric
      CommonModel.doTrackEvent({
        event_name: 'health_plus_create_new_account',
        account_number: this.bitmarkAccountNumber,
      });

      EventEmitterService.emit(EventEmitterService.events.APP_NEED_REFRESH, { justCreatedBitmarkAccount: true, indicator: true });
    }
  }

  async computePhraseWords(sourcePhraseWords, extState, firstLoad) {
    let smallerList = [];
    let biggerList = [];
    let phraseWords = [];

    for (let index = 0; index < sourcePhraseWords.length; index++) {
      let word = sourcePhraseWords[index];
      let characters = sourcePhraseWords[index].split('');
      fillUpArrayByEmptyString(characters, NUMBER_CHARACTERS_OF_PHRASE_WORD);

      if (!firstLoad) {
        let doFlapper = async () => {
          return new Promise((resolve) => {
            let list = []
            for (let cIndex = 0; cIndex < characters.length; cIndex++) {
              if (this.flapperRefs[`${index}_${cIndex}`]) {
                list.push(this.flapperRefs[`${index}_${cIndex}`].loadFlapper(characters[cIndex].toUpperCase()));
              }
            }
            Promise.all(list).then(resolve);
          });
        }
        doFlapper();
        await delay(100);
      }

      if (index < (sourcePhraseWords.length / 2)) {
        smallerList.push({ word, characters });
      } else {
        biggerList.push({ word, characters });
      }
      phraseWords.push({ index, word, characters });
    }
    this.setState(merge({}, extState, { phraseWords, smallerList, biggerList }));
    this.canGenerateNew = true;
  }

  async generatePhraseWords() {
    if (!this.canGenerateNew) {
      return;
    }
    this.canGenerateNew = false;
    let phraseInfo = await AppProcessor.doGeneratePhrase();
    this.phraseWords = phraseInfo.phraseWords;
    this.bitmarkAccountNumber = phraseInfo.bitmarkAccountNumber;
    // this.computePhraseWords(phraseInfo.phraseWords, { step: STEPS.generated });
    // this.loginWithPhraseWords(); // developer


    this.canGenerateNew = true;
    this.setState({ step: STEPS.generated });
  }

  onChangeText(text) {
    text = text.trimLeft();

    text = text.replace('\n', ' ');

    // Replace double space by single space if any
    if (text.endsWith('  ')) {
      text = `${text.trimRight()} `;
    }

    // Populate suggestion words
    let textForPopulateSuggestion = text;
    if (textForPopulateSuggestion && this.inputPhraseWordsRef._lastNativeSelection.start == this.inputPhraseWordsRef._lastNativeSelection.end) {
      textForPopulateSuggestion = text.substring(0, this.inputPhraseWordsRef._lastNativeSelection.end);
    }

    let words = textForPopulateSuggestion.split(' ');
    let lastWord = words[words.length - 1];
    this.doFilter(lastWord);

    this.setState({inputPhraseWordsString: text, testingResult: null})
  }

  onSubmitWord(word) {
    let inputPhraseWordsString = this.state.inputPhraseWordsString;
    if ((this.inputPhraseWordsRef._lastNativeSelection.start == this.inputPhraseWordsRef._lastNativeSelection.end) && (this.inputPhraseWordsRef._lastNativeSelection.end == inputPhraseWordsString.length)) {
      let words = inputPhraseWordsString.split(' ');
      words[words.length - 1] = word;
      inputPhraseWordsString = `${words.join(' ').trim()} `;
    } else {
      let textBeforeSuggestion = inputPhraseWordsString.substring(0, this.inputPhraseWordsRef._lastNativeSelection.end);
      let words = textBeforeSuggestion.split(' ');
      words[words.length - 1] = word;
      textBeforeSuggestion = `${words.join(' ').trim()} `;

      let textAfterSuggestion = inputPhraseWordsString.substring(this.inputPhraseWordsRef._lastNativeSelection.end);
      inputPhraseWordsString = `${textBeforeSuggestion}${textAfterSuggestion.trim()}`;
    }

    this.setState({inputPhraseWordsString});
  }

  doFilter(text) {
    let keyboardExternalDataSource;
    if (text) {
      keyboardExternalDataSource = dictionaryPhraseWords.filter(word => word.toLowerCase().indexOf(text.toLowerCase()) === 0);
    } else {
      keyboardExternalDataSource = dictionaryPhraseWords;
    }

    this.setState({ keyboardExternalDataSource });
  }

  resetTest() {
    Alert.alert('Are you sure?', 'If you go back, you will lose this key phrase and will need to generate a new one. ', [
      {
        text: 'Cancel', style: 'cancel',
      },
      {
        text: 'OK',
        onPress: () => {
          this.setState({
            step: STEPS.init,
            testingResult: null,
            inputPhraseWordsString: ''
          })
        }
      }]);
  }

  render() {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={styles.wrapper}>
          <View style={styles.body}>
            {/*GENERATE PHRASE WORDS*/}
            {(this.state.step === STEPS.init || this.state.step === STEPS.generated) &&
              <View style={[styles.bodyContent]}>
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
                  <View style={{ flex: 1 }}>
                    {/*TOP AREA*/}
                    <View style={[styles.topArea]}>
                      <Text style={[styles.title]}>BITMARK HEALTH</Text>
                      <Image style={styles.logo} source={require('assets/imgs/bitmark-health-icon.png')} />
                    </View>

                    {/*CONTENT*/}
                    <View style={[styles.contentArea, {justifyContent: 'flex-start'}]}>
                      {/*Desc*/}
                      <Text style={[styles.steps]}>STEP 2 OF 3</Text>
                      <Text style={[styles.introductionTitle]}>Generate vault key phrase</Text>
                      <Text style={[styles.introductionDescription]}>
                        Your vault is stored on your phone and secured by a 12-word key phrase that only you will know. Think of this as a magic phrase — it instantly restores all your data if your phone is ever lost, stolen, or damaged.
                      </Text>

                      {/*Generate Code Container*/}
                      <View style={[styles.generateCodeContainer]}>
                        {/*header*/}
                        <View style={[styles.generateCodeTitle]}>
                          <Text style={[styles.generateCodeTitleText]}>YOUR 12-WORD VAULT KEY PHRASE</Text>
                        </View>

                        {/*content*/}
                        <View style={[styles.generateCodeContent]}>
                          {/*Phrase Words*/}
                          {(this.state.step === STEPS.generated) &&
                          <Text style={[styles.phraseWords]}>{this.phraseWords.join(' ').toLowerCase()}</Text>
                          }

                          {/*GENERATE HEALTH CODE*/}
                          {(this.state.step === STEPS.init) &&
                          <TouchableOpacity style={[styles.button]} onPress={this.generatePhraseWords.bind(this)}>
                            <Text style={[styles.buttonText]}>GENERATE NOW</Text>
                          </TouchableOpacity>
                          }
                        </View>
                      </View>

                      {/*Info Message*/}
                      {this.state.step === STEPS.generated &&
                      <Text style={[styles.infoMessage]}>Write it down and keep it safe. You will need it to unlock your vault in the next
                        step.</Text>
                      }
                    </View>

                    {/*BOTTOM AREA*/}
                    <View style={[styles.bottomArea, {justifyContent: 'flex-end'}]}>
                      <TouchableOpacity style={[styles.buttonNext]} disabled={this.state.step === STEPS.init} onPress={() => { if (this.state.step === STEPS.generated) { this.goToTest.bind(this)(this.phraseWords) } }}>
                        <Text style={[styles.buttonNextText, { opacity: this.state.step === STEPS.init ? 0.3 : 1 }]}>NEXT</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>
              </View>
            }

            {/*WRITE DOWN PHRASE WORDS INFORM STEP*/}
            {this.state.step === STEPS.writeDownPhraseWordsInform &&
              <View style={[styles.bodyContent, { paddingLeft: 0, paddingRight: 0 }]}>
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
                  <View style={{ flex: 1 }}>
                    {/*TOP AREA*/}
                    <View style={[styles.topArea, styles.paddingContent, { backgroundColor: '#FFFFFF', borderTopLeftRadius: 10, borderTopRightRadius: 10 }]}>
                      <Text style={[{ color: 'rgba(0, 0, 0, 0.6)', letterSpacing: 1.5, fontSize: 10, fontFamily: 'AvenirNextW1G-Light' }]}>WRITE DOWN YOUR KEY PHRASE</Text>
                      <Image style={styles.infoIcon} source={require('assets/imgs/info-icon.png')} />
                    </View>

                    {/*CONTENT*/}
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

                    {/*BOTTOM AREA*/}
                    <View style={[styles.bottomArea, styles.paddingContent, { justifyContent: 'flex-end' }]}>
                      <TouchableOpacity style={[styles.buttonNext]} onPress={() => { this.setState({ step: STEPS.generated }) }}>
                        <Text style={[styles.buttonNextText]}>I GOT IT</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>
              </View>
            }

            {/*TEST PHRASE WORDS*/}
            {this.state.step === STEPS.testing &&
              <View style={[styles.bodyContent, { paddingLeft: 0, paddingRight: 0 }]}>
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
                  <View style={{ flex: 1 }}>
                    {/*TOP AREA*/}
                    {/*BITMARK Header*/}
                    {this.state.testingResult !== true &&
                      <View style={[styles.topArea, styles.paddingContent]}>
                        <Text style={[styles.title]}>BITMARK HEALTH</Text>
                        <Image style={styles.logo} source={require('assets/imgs/bitmark-health-icon.png')} />
                      </View>
                    }

                    {/*Successful test*/}
                    {this.state.testingResult === true &&
                      <View style={[styles.topArea, styles.paddingContent, { backgroundColor: '#0060F2', borderTopLeftRadius: 10, borderTopRightRadius: 10 }]}>
                        <Text style={[styles.testResultMessage]}>VAULT UNLOCKED</Text>
                      </View>
                    }

                    {/*CONTENT*/}
                    <View style={[styles.contentArea, styles.paddingContent, {justifyContent: 'flex-start'}]}>
                      {/*Desc*/}
                      <Text style={[styles.steps]}>STEP 3 OF 3</Text>
                      <Text style={[styles.introductionTitle]}>Unlock your vault </Text>
                      <Text style={[styles.introductionDescription]}>
                        Enter your vault key phrase below to unlock your vault.
                      </Text>

                      {/*Generate Code Container*/}
                      <View style={[styles.generateCodeContainer]}>
                        {/*header*/}
                        <View style={[styles.generateCodeTitle]}>
                          <Text style={[styles.generateCodeTitleText]}>YOUR 12-WORD VAULT KEY PHRASE</Text>
                        </View>

                        {/*content*/}
                        <View style={[styles.generateCodeContent]}>
                          {/*Input words*/}
                          <TextInput
                            ref={(r) => { this.inputPhraseWordsRef = r;}}
                            style={[styles.inputPhraseWords, this.state.testingResult === false ? {color: '#FF003C'} : {}]}
                            onChangeText={(text) => this.onChangeText(text)}
                            value={this.state.inputPhraseWordsString}
                            multiline={true}
                            returnKeyType={'done'}
                            secureTextEntry={true}
                          />
                        </View>
                      </View>{/*Info Message*/}

                      {this.state.testingResult === false &&
                      <Text style={[styles.errorMessage]}>There was a problem with your vault key phrase. Please re-enter it above or go back to generate a new key phrase.</Text>
                      }
                    </View>


                    {/*BOTTOM AREA*/}
                    <View style={[styles.bottomArea, styles.paddingContent]}>
                      {/*Back*/}
                      <TouchableOpacity style={[styles.buttonNext, {marginLeft: 0}]} onPress={this.resetTest.bind(this)}>
                        <Text style={[styles.buttonNextText]}>BACK</Text>
                      </TouchableOpacity>

                      {/*Unlock*/}
                      <TouchableOpacity style={[styles.buttonNext]} onPress={this.testPhraseWords.bind(this)} disabled={!this.state.inputPhraseWordsString}>
                        <Text style={[styles.buttonNextText, { opacity: this.state.inputPhraseWordsString == '' ? 0.3 : 1 }]}>UNLOCK</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>
              </View>
            }
          </View>

          {/*KEYBOARD & SUGGESTIONS*/}
          {this.state.keyboardHeight > 0 &&
            <Animated.View style={[styles.keyboardExternal, { bottom: this.state.keyboardExternalBottom, opacity: this.state.keyboardExternalOpacity, }]}>
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
            </Animated.View>
          }
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
    height: 70,
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
    color: 'rgba(0, 0, 0, 0.87)',
    letterSpacing: 1.5,
  },
  testResultMessage: {
    fontFamily: 'AvenirNextW1G-Bold',
    fontSize: 10,
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  introductionTitle: {
    fontFamily: 'AvenirNextW1G-Bold',
    color: 'rgba(0, 0, 0, 0.87)',
    fontSize: 24,
    textAlign: 'left',
    letterSpacing: 0.15,
  },
  introductionDescription: {
    marginTop: 10,
    fontFamily: 'AvenirNextW1G-Regular',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(0, 0, 0, 0.6)',
    textAlign: 'left',
    letterSpacing: 0.25,
  },
  infoIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain'
  },
  writeDownPhraseWordsInformTitle: {
    marginTop: 50,
    fontFamily: 'AvenirNextW1G-Bold',
    fontSize: 14,
    letterSpacing: 0.25,
    color: 'rgba(0, 0, 0, 0.6)',
  },
  writeDownPhraseWordsInformText: {
    marginTop: 20,
    fontFamily: 'AvenirNextW1G-Regular',
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
    letterSpacing: 0.25,
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
    letterSpacing: 0.75,
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
    color: '#FF003C',
    letterSpacing: 0.75,
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
    marginLeft: 5,
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
  steps: {
    marginTop: 20,
    marginBottom: 10,
    fontFamily: 'AvenirNextW1G-Light',
    fontSize: 10,
    color: 'rgba(0, 0, 0, 0.87)',
    letterSpacing: 1.5,
    lineHeight: 16,
  },
  generateCodeContainer: {
    width: '100%',
    marginTop: 60,
    borderBottomWidth: 3,
    borderBottomColor: '#FF003C',
  },
  generateCodeTitle: {
    backgroundColor: '#FF003C',
    height: 30,
    paddingLeft: 5,
    justifyContent: 'center'
  },
  generateCodeTitleText: {
    color: '#FFFFFF',
    fontFamily: 'AvenirNextW1G-Bold',
    fontSize: 14,
    letterSpacing: 0.25,
  },
  generateCodeContent: {
    height: 130,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  phraseWords: {
    color: '#000000',
    fontFamily: 'Andale Mono',
    fontSize: 15,
    lineHeight: 20,
  },
  infoMessage: {
    marginTop: 30,
    color: '#000000',
    fontFamily: 'AvenirNextW1G-Demi',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  errorMessage: {
    marginTop: 30,
    color: '#FF003C',
    fontFamily: 'AvenirNextW1G-Regular',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  inputPhraseWords: {
    height: 130,
    width: '100%',
    color: '#0060F2',
    fontFamily: 'Andale Mono',
    fontSize: 15,
    lineHeight: 20,
  },
});
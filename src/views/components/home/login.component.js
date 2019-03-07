import React, { Component } from 'react';
import {
  StyleSheet,
  Keyboard,
  Image, View, TouchableOpacity, Text, FlatList, TextInput, Animated, SafeAreaView, ScrollView,
} from 'react-native';

import { Actions } from 'react-native-router-flux';
import { dictionaryPhraseWords, convertWidth } from 'src/utils';
import { AppProcessor, EventEmitterService } from 'src/processors';
import { constants, config } from 'src/configs';
import PropTypes from 'prop-types';
import { CommonModel } from "src/processors/models";

// let testWords = ["accident", "sausage", "ticket", "dolphin", "original", "nasty", "theme", "life", "polar", "donor", "office", "weird", "neither", "escape", "flag", "spell", "submit", "salute", "sustain", "habit", "soap", "oil", "romance", "drama",];
// let testWords = ["track", "occur", "mercy", "machine", "guitar", "occur", "main", "extra", "topic", "pen", "fatigue", "whale"];
// let testWords = ["aunt", "domain", "device", "amount", "surprise", "canal", "unaware", "junk", "emotion", "scene", "gesture", "empower"];

export class LoginComponent extends Component {
  static propTypes = {
    migrateFrom24Words: PropTypes.bool,
    phraseWords: PropTypes.any,
    backAction: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      inputPhraseWordsString: '',
      testingResult: null,
      keyboardExternalBottom: new Animated.Value(0),
      keyboardExternalOpacity: new Animated.Value(0),
      keyboardExternalDataSource: dictionaryPhraseWords,
    };
    this.flapperRefs = {};
  }

  componentDidMount() {
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

  async testPhraseWords() {
    let testingResult;
    let inputPhraseWordsString = this.state.inputPhraseWordsString.trim();
    let phraseWords = inputPhraseWordsString.split(' ').map(word => word.toLowerCase());

    try {
      if (this.props.phraseWords) {
        testingResult = inputPhraseWordsString == this.props.phraseWords.join(' ');
      } else {
        await AppProcessor.doCheckPhraseWords(phraseWords);
        testingResult = true;
      }
    } catch {
      testingResult = false;
    }

    this.setState({testingResult});

    if (testingResult) {
      this.loginWithPhraseWords(phraseWords);
    }

    this.applyNewTextInputColor();
  }

  applyNewTextInputColor() {
    // Trick to apply new color for TextInput Component
    // Reset text then re-input text
    let inputPhraseWordsString = this.state.inputPhraseWordsString;
    this.setState({inputPhraseWordsString: ''});
    setTimeout(() => {
      this.setState({inputPhraseWordsString: inputPhraseWordsString});
    }, 0);
  }

  back() {
    if (this.props.backAction) {
      this.props.backAction();
    } else {
      Actions.pop();
    }
  }

  async loginWithPhraseWords(phraseWords) {
    if (this.props.migrateFrom24Words) {
      Actions.whatNext({twelveWords: phraseWords});
    } else if (this.props.phraseWords) {
      // login with new account
      await AppProcessor.doLogin(phraseWords, false);

      // Add metric
      CommonModel.doTrackEvent({
        event_name: 'health_plus_create_new_account',
        account_number: this.bitmarkAccountNumber,
      });

      EventEmitterService.emit(EventEmitterService.events.APP_NEED_REFRESH, { justCreatedBitmarkAccount: true, indicator: true });
    } else {
      // Login with existing account
      await AppProcessor.doLogin(phraseWords, false);
      EventEmitterService.emit(EventEmitterService.events.APP_NEED_REFRESH, { justCreatedBitmarkAccount: false, indicator: true });
    }
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

  checkIfCursorInputAtTheEnd(inputText) {
    let startCursor = this.inputPhraseWordsRef._lastNativeSelection.start;
    let endCursor = this.inputPhraseWordsRef._lastNativeSelection.end;
    return (startCursor == endCursor) && (endCursor == inputText.length);
  }

  onSubmitWord(word) {
    let inputPhraseWordsString = this.state.inputPhraseWordsString;
    if (!inputPhraseWordsString || this.checkIfCursorInputAtTheEnd(inputPhraseWordsString)) {
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

  render() {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={styles.body}>
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
                  <View style={[styles.generateCodeContainer, {marginTop: 100}]}>
                    {/*header*/}
                    <View style={[styles.generateCodeTitle]}>
                      <Text style={[styles.generateCodeTitleText]}>YOUR 12-WORD VAULT KEY PHRASE</Text>
                    </View>

                    {/*content*/}
                    <View style={[styles.generateCodeContent]}>
                      {/*Input words*/}
                      <TextInput
                        ref={(r) => { this.inputPhraseWordsRef = r;}}
                        style={[styles.inputPhraseWords, {color: this.state.testingResult === false ? '#FF003C' : '#0060F2'}]}
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
                  <TouchableOpacity style={[styles.buttonNext, {marginLeft: 0}]} onPress={this.back.bind(this)}>
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
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
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

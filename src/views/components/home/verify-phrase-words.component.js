import React, { Component } from 'react';
import {
  StyleSheet,
  Keyboard,
  Image, View, TouchableOpacity, Text, TextInput, SafeAreaView, ScrollView,
} from 'react-native';

import { Actions } from 'react-native-router-flux';
import { convertWidth } from 'src/utils';
import { AppProcessor, EventEmitterService } from 'src/processors';
import PropTypes from 'prop-types';
import { CommonModel } from "src/processors/models";

// let testWords = ["accident", "sausage", "ticket", "dolphin", "original", "nasty", "theme", "life", "polar", "donor", "office", "weird", "neither", "escape", "flag", "spell", "submit", "salute", "sustain", "habit", "soap", "oil", "romance", "drama",];
// let testWords = ["track", "occur", "mercy", "machine", "guitar", "occur", "main", "extra", "topic", "pen", "fatigue", "whale"];
// let testWords = ["aunt", "domain", "device", "amount", "surprise", "canal", "unaware", "junk", "emotion", "scene", "gesture", "empower"];

export class VerifyPhraseWordsComponent extends Component {
  static propTypes = {
    phraseWords: PropTypes.any,
    backAction: PropTypes.func,
    successAction: PropTypes.any,
    actionType: PropTypes.any,
  };

  constructor(props) {
    super(props);

    // console.log('this.props.phraseWords.join(\' \'):', this.props.phraseWords.join(' '));
    this.state = {
      inputPhraseWordsString: '',
      testingResult: null,
    };
  }

  async testPhraseWords() {
    let testingResult;
    let inputPhraseWordsString = this.state.inputPhraseWordsString.trim();
    let inputPhraseWords = inputPhraseWordsString.split(' ').filter((word => word.trim() != '')).map(word => word.toLowerCase());

    try {
      if (this.props.actionType == 'logout') {
        let userInfo = await AppProcessor.doGetCurrentAccount();
        testingResult = inputPhraseWords.join(' ') == userInfo.phraseWords.join(' ');
      } else if (this.props.phraseWords) {
        testingResult = inputPhraseWords.join(' ') == this.props.phraseWords.join(' ');
      } else {
        await AppProcessor.doCheckPhraseWords(inputPhraseWords);
        testingResult = true;
      }
    } catch {
      testingResult = false;
    }

    this.setState({testingResult});

    if (testingResult) {
      if (this.props.successAction) {
        this.props.successAction(inputPhraseWords);
      } else {
        this.loginWithPhraseWords(inputPhraseWords);
      }
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
    if (this.props.actionType == 'createNewAccount') {
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

    text = text.replace('\n', '');

    // Replace double space by single space if any
    if (text.endsWith('  ')) {
      text = `${text.trimRight()} `;
    }

    this.setState({inputPhraseWordsString: text, testingResult: null})
  }

  onSubmitEditing() {
    Keyboard.dismiss();
  }

  getDescComponent() {
    switch (this.props.actionType) {
      case 'testPhraseWords':
        return TestPhraseWordsDescComponent;
      case 'logout':
        return LogoutDescComponent;
      default:
        return LoginDescComponent;
    }
  }

  getTestingErrorMessage() {
    switch (this.props.actionType) {
      case 'testPhraseWords':
      case 'logout':
        return 'There was a problem with your vault key phrase. Please re-enter it above.';
      default:
        return 'There was a problem with your vault key phrase. Please re-enter it above or go back to generate a new key phrase.';
    }
  }

  render() {
    let DescComponent = this.getDescComponent();
    let testingErrorMessage = this.getTestingErrorMessage();

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
                  <DescComponent/>

                  {/*Generate Code Container*/}
                  <View style={[styles.generateCodeContainer]}>
                    {/*header*/}
                    <View style={[styles.generateCodeTitle]}>
                      <Text style={[styles.generateCodeTitleText]}>ENTER 12-WORD VAULT KEY PHRASE</Text>
                    </View>

                    {/*content*/}
                    <View style={[styles.generateCodeContent]}>
                      {/*Input words*/}
                      <TextInput
                        ref={(r) => { this.inputPhraseWordsRef = r;}}
                        style={[styles.inputPhraseWords, {color: this.state.testingResult === false ? '#FF003C' : '#0060F2'}]}
                        onChangeText={(text) => this.onChangeText(text)}
                        onSubmitEditing={() => this.onSubmitEditing()}
                        value={this.state.inputPhraseWordsString}
                        multiline={true}
                        returnKeyType={'done'}
                        secureTextEntry={true}
                      />
                    </View>
                  </View>{/*Info Message*/}

                  {this.state.testingResult === false &&
                  <Text style={[styles.errorMessage]}>{testingErrorMessage}</Text>
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

class LoginDescComponent extends Component {
  render() {
    return (
      <View>
        <Text style={[styles.steps]}>STEP 3 OF 3</Text>
        <Text style={[styles.introductionTitle]}>Unlock your vault </Text>
        <Text style={[styles.introductionDescription]}>
          Enter your vault key phrase below to unlock your vault.
        </Text>
      </View>
    )
  }
}

class TestPhraseWordsDescComponent extends Component {
  render() {
    return (
      <View>
        <Text style={[styles.introductionTitle, {marginTop: 30}]}>Test your key phrase</Text>
        <Text style={[styles.introductionDescription]}>
          Enter your vault key phrase below to test your vault key phrase.
        </Text>
      </View>
    )
  }
}

class LogoutDescComponent extends Component {
  render() {
    return (
      <View>
        <Text style={[styles.introductionTitle, {marginTop: 30}]}>Lock your vault</Text>
        <Text style={[styles.introductionDescription]}>
          Enter your vault key phrase below to lock your vault on this device. You will need to enter your vault key phrase again to unlock your vault.
        </Text>
      </View>
    )
  }
}


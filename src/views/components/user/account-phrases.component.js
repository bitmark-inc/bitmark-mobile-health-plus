import React, { Component } from 'react';
import {
  StyleSheet,
  Keyboard,
  Image, View, TouchableOpacity, Text, SafeAreaView, ScrollView, FlatList, TextInput, KeyboardAvoidingView, Animated
} from 'react-native';

import PropTypes from 'prop-types';

import { Actions } from 'react-native-router-flux';
import { AppProcessor, EventEmitterService } from 'src/processors';
import { convertWidth, dictionaryPhraseWords } from 'src/utils';
import { config, constants, } from 'src/configs';
import { ShadowComponent, ShadowTopComponent } from 'src/views/commons';

const STEPS = {
  warning: 1,
  phraseWord: 2,
  testing: 3,
}

const NUMBER_CHARACTERS_OF_PHRASE_WORD = 8;

const fillUpArrayByEmptyString = (word, length) => {
  let arrayLength = word.length;
  for (let i = 0; i < length - arrayLength; i++) {
    word += ' ';
  }

  return word;
};

export class AccountPhraseComponent extends Component {
  static propTypes = {
    isLogout: PropTypes.bool,
  };
  constructor(props) {
    super(props);
    this.state = {
      step: STEPS.warning,
      smallerList: [],
      biggerList: [],
      phraseWords: [],
      testingResult: null,
      testInputs: {},
      selectedIndex: -1,
      keyboardExternalOpacity: new Animated.Value(0),
      keyboardExternalDataSource: dictionaryPhraseWords,
    }
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
    let keyboardHeight = keyboardEvent.endCoordinates.height - (config.isIPhoneX ? 35 : 0);
    this.setState({ keyboardHeight });

    let listAnimations = [];
    listAnimations.push(Animated.spring(this.state.keyboardExternalOpacity, {
      toValue: 1,
      duration: 200,
    }));
    Animated.parallel(listAnimations).start();
  }

  onKeyboardDidHide() {
    this.setState({ keyboardHeight: 0 });
    let listAnimations = [];
    listAnimations.push(Animated.spring(this.state.keyboardExternalOpacity, {
      toValue: 0,
      duration: 200,
    }));
    Animated.parallel(listAnimations).start();
  }

  accessPhraseWords() {
    AppProcessor.doGetCurrentAccount().then((userInfo) => {
      if (!userInfo) {
        return;
      }
      console.log('userInfo :', userInfo);
      let smallerList = [];
      let biggerList = [];
      let phraseWords = [];
      for (let index in userInfo.phraseWords) {
        if (index < (userInfo.phraseWords.length / 2)) {
          smallerList.push({ word: fillUpArrayByEmptyString(userInfo.phraseWords[index], NUMBER_CHARACTERS_OF_PHRASE_WORD) });
        } else {
          biggerList.push({ word: fillUpArrayByEmptyString(userInfo.phraseWords[index], NUMBER_CHARACTERS_OF_PHRASE_WORD) });
        }
        phraseWords.push({ index, word: fillUpArrayByEmptyString(userInfo.phraseWords[index], NUMBER_CHARACTERS_OF_PHRASE_WORD) });
      }
      if (this.props.isLogout) {
        this.goToTest(phraseWords);
      } else {
        this.setState({ phraseWords, smallerList, biggerList, step: STEPS.phraseWord });
      }
    }).catch((error => {
      console.log('error:', error);
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, {
        error,
        onClose: Actions.pop
      });
    }));
  }
  goToTest(phraseWords) {
    let numberWorldFilled = phraseWords.length - 3;
    let countPreFill = 0;
    let smallerList = [];
    let biggerList = [];
    for (let index in phraseWords) {
      if (index < (phraseWords.length / 2)) {
        smallerList.push({ word: phraseWords[index].word });
      } else {
        biggerList.push({ word: phraseWords[index].word });
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

    smallerList.forEach(item => item.word = item.selected ? item.word : '');
    biggerList.forEach(item => item.word = item.selected ? item.word : '');

    this.setState({
      step: STEPS.testing,
      phraseWords,
      smallerList,
      biggerList,
    });
  }

  filterTest(text) {
    text = text || '';
    let keyboardExternalDataSource = dictionaryPhraseWords.filter(word => word.toLowerCase().indexOf(text.toLowerCase()) === 0);
    this.setState({ keyboardExternalDataSource });
  }

  testInputText(index, text) {
    let testInputs = this.state.testInputs;
    testInputs[index] = text;
    this.setState({ testInputs });
    this.filterTest(text);
  }

  onFocus(index) {
    this.setState({ selectedIndex: index, testingResult: null });
    this[`recoveryPhraseWordInput_${index}`].focus();
    this.filterTest.bind(this)(this.state.testInputs[index]);
  }

  testPhrases(testInputs) {
    let indexInputs = Object.keys(testInputs);
    if (indexInputs.length === 3) {
      let inputtedWords = [];
      this.state.smallerList.concat(this.state.biggerList).forEach(item => inputtedWords.push(item.word));
      for (let index of indexInputs) {
        inputtedWords[index] = testInputs[index];
      }
      inputtedWords.forEach(item => item = item.toLowerCase().trim());
      AppProcessor.doCheckPhraseWords(inputtedWords).then(() => {
        this.setState({ testingResult: true });
      }).catch(() => {
        this.setState({ testingResult: false });
      });
    }
  }

  onSubmitWord(word) {
    let selectedIndex = this.state.selectedIndex;
    if (selectedIndex >= 0) {
      let testInputs = this.state.testInputs;
      testInputs[selectedIndex] = word;
      this.setState({ testInputs });
      this.testPhrases(testInputs);
    }
  }

  resetTest() {
    this.setState({
      testingResult: null,
      testInputs: {},
      selectedIndex: -1,
    });
  }

  doLogout() {
    AppProcessor.doLogout().then((result) => {
      if (result) {
        EventEmitterService.emit(EventEmitterService.events.APP_NEED_REFRESH, { indicator: true });
      }
    }).catch(error => {
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error })
    })
  }

  render() {
    return (
      <SafeAreaView style={styles.bodySafeView}>
        <View style={styles.body}>
          <View style={styles.bodyContent}>

            {this.state.step === STEPS.warning && <ShadowComponent style={{ flex: 1, }}>
              <ShadowTopComponent style={{ height: 40 }} contentStyle={styles.titleArea}>
                <Text style={styles.titleText}>WARNING</Text>
                <Image style={styles.warningIcon} source={require('assets/imgs2/warning_icon.png')} />
              </ShadowTopComponent>
              <ScrollView style={styles.content}>
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
                  <View style={styles.normalDot} />
                </View>
                <TouchableOpacity style={styles.bottomButton} onPress={Actions.pop}>
                  <Text style={styles.bottomButtonText}>CANCEL</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.bottomButton} onPress={this.accessPhraseWords.bind(this)}>
                  <Text style={styles.bottomButtonText}>NEXT</Text>
                </TouchableOpacity>
              </View>
            </ShadowComponent>}

            {this.state.step === STEPS.phraseWord && <ShadowComponent style={{ flex: 1 }}>
              <View style={[styles.titleArea, { backgroundColor: '#F4F2EE', }]}>
                <Text style={styles.titleText}>BITMARK HEALTH</Text>
                <Image style={styles.warningIcon} source={require('assets/imgs2/health_app_icon.png')} />
              </View>

              <ScrollView style={styles.content} contentContainerStyle={{ flexDirection: 'column', justifyContent: 'space-between', flexGrow: 1, paddingBottom: 20 }}>
                <View style={styles.phraseWordsArea}>
                  <FlatList data={this.state.smallerList}
                    keyExtractor={(item, index) => index + ''}
                    scrollEnabled={false}
                    extraData={this.state}
                    renderItem={({ item, index }) => {
                      return (
                        <View style={styles.recoveryPhraseSet}>
                          <Text style={styles.recoveryPhraseIndex}>{index + 1}.</Text>
                          <View style={styles.recoveryPhraseValue}>
                            {item.word.split('').map((char, cIndex) =>
                              <Text key={STEPS.phraseWord + 's' + cIndex} style={styles.recoveryPhraseWord}>{char}</Text>
                            )}
                          </View>
                        </View>
                      )
                    }}
                  />
                  <FlatList data={this.state.biggerList}
                    keyExtractor={(item, index) => index + ''}
                    style={{ marginLeft: 9 }}
                    scrollEnabled={false}
                    extraData={this.state}
                    renderItem={({ item, index }) => {
                      return (
                        <View style={styles.recoveryPhraseSet}>
                          <Text style={styles.recoveryPhraseIndex}>{index + (this.state.phraseWords.length / 2) + 1}.</Text>
                          <View style={styles.recoveryPhraseValue}>
                            {item.word.split('').map((char, cIndex) =>
                              <Text key={STEPS.phraseWord + 'b' + cIndex} style={styles.recoveryPhraseWord}>{char}</Text>
                            )}
                          </View>
                        </View>
                      )
                    }}
                  />
                </View>
                <TouchableOpacity style={styles.infoArea} >
                  <Image style={styles.infoIcon} source={require('assets/imgs/info-icon.png')} />
                  <Text style={[styles.infoLinkText, { marginLeft: 5 }]}>Write down your key phrase on a piece of paper and keep it safe.</Text>
                </TouchableOpacity>
                <Text style={styles.vaultTitle}>Your vault key phrase</Text>
                <Text style={styles.vaultMessage}>A {this.state.phraseWords.length}-word phrase that only you know.</Text>
                <TouchableOpacity style={styles.testButton} onPress={() => this.goToTest.bind(this)(this.state.phraseWords)}>
                  <Text style={styles.testButtonText}>{'TEST YOUR key phrase'.toUpperCase()}</Text>
                </TouchableOpacity>
              </ScrollView>


              <View style={styles.bottomButtonArea}>
                <View style={styles.dotArea}>
                  <View style={styles.normalDot} />
                  <View style={styles.activeDot} />
                  <View style={styles.normalDot} />
                </View>
                <TouchableOpacity style={styles.bottomButton} onPress={Actions.pop}>
                  <Text style={styles.bottomButtonText}>GO BACK</Text>
                </TouchableOpacity>
              </View>

            </ShadowComponent>}

            {this.state.step === STEPS.testing && <ShadowComponent style={{ flex: 1 }}>
              {this.state.testingResult === null && <View style={[styles.titleArea, { backgroundColor: '#F4F2EE', }]}>
                <Text style={styles.titleText}>BITMARK HEALTH</Text>
                <Image style={styles.warningIcon} source={require('assets/imgs2/health_app_icon.png')} />
              </View>}
              {this.state.testingResult === false && <View style={[styles.titleArea, { backgroundColor: '#FF003C', }]}>
                <Text style={styles.titleText}>WRONG COMBINATION</Text>
              </View>}
              {this.state.testingResult === true && <View style={[styles.titleArea, { backgroundColor: '#0060F2', }]}>
                <Text style={styles.titleText}>Correct combination</Text>
                <Image style={styles.warningIcon} source={require('assets/imgs2/health_app_icon.png')} />
              </View>}
              <KeyboardAvoidingView behavior="padding" enabled style={{ flex: 1 }} >
                <ScrollView style={styles.content} contentContainerStyle={{ flexDirection: 'column', justifyContent: 'space-between', flexGrow: 1, paddingBottom: 20 }}>
                  <View style={styles.phraseWordsArea}>
                    <FlatList data={this.state.smallerList}
                      keyExtractor={(item, index) => index + ''}
                      scrollEnabled={false}
                      extraData={this.state}
                      renderItem={({ item, index }) => {
                        return (
                          <TouchableOpacity style={[styles.recoveryPhraseSet,]} disabled={!!item.word} onPress={() => this.onFocus.bind(this)(index)}>
                            <Text style={styles.recoveryPhraseIndex}>{index + 1}</Text>
                            {!!item.word && <View style={[styles.recoveryPhraseValue]}>
                              {item.word.split('').map((char, cIndex) =>
                                <Text key={STEPS.testing + 's' + cIndex} style={styles.recoveryPhraseWord}>{char}</Text>
                              )}
                            </View>}
                            {!item.word && <View style={[styles.recoveryPhraseValue, {
                              borderWidth: 1,
                              borderColor: this.state.testingResult === false ? '#FF003C' : '#0060F2'
                            }]}>
                              <TextInput style={styles.recoveryPhraseWordInput}
                                onSubmitEditing={this.testPhrases.bind(this)(this.state.testInputs)}
                                value={this.state.testInputs[index]}
                                onChangeText={(text) => this.testInputText.bind(this)(index, text)}
                                ref={ref => this[`recoveryPhraseWordInput_${index}`] = ref}
                                autoCapitalize='none'
                              />
                            </View>}
                          </TouchableOpacity>
                        )
                      }}
                    />
                    <FlatList data={this.state.biggerList}
                      keyExtractor={(item, index) => index + ''}
                      style={{ marginLeft: 9 }}
                      scrollEnabled={false}
                      extraData={this.state}
                      renderItem={({ item, index }) => {
                        return (
                          <TouchableOpacity style={[styles.recoveryPhraseSet,]} disabled={!!item.word} onPress={() => this.onFocus.bind(this)((this.state.phraseWords.length / 2) + index)}>
                            <Text style={styles.recoveryPhraseIndex}>{index + (this.state.phraseWords.length / 2) + 1}.</Text>
                            {!!item.word && <View style={[styles.recoveryPhraseValue]}>
                              {item.word.split('').map((char, cIndex) =>
                                <Text key={STEPS.testing + 'b' + cIndex} style={styles.recoveryPhraseWord}>{char}</Text>
                              )}
                            </View>}
                            {!item.word && <View style={[styles.recoveryPhraseValue, {
                              borderWidth: 1,
                              borderColor: this.state.testingResult === false ? '#FF003C' : '#0060F2'
                            }]}>
                              <TextInput style={styles.recoveryPhraseWordInput}
                                onSubmitEditing={this.testPhrases.bind(this)(this.state.testInputs)}
                                value={this.state.testInputs[(this.state.phraseWords.length / 2) + index]}
                                onChangeText={(text) => this.testInputText.bind(this)((this.state.phraseWords.length / 2) + index, text)}
                                ref={ref => this[`recoveryPhraseWordInput_${(this.state.phraseWords.length / 2) + index}`] = ref}
                                autoCapitalize='none'
                              />
                            </View>}
                          </TouchableOpacity>
                        )
                      }}
                    />
                  </View>
                  <Text style={[styles.vaultTitle, { marginTop: 66, }]}>Test your key phrase, unlock your vault</Text>
                  <Text style={styles.vaultMessage}>Enter the three remaining words.</Text>
                </ScrollView>
              </KeyboardAvoidingView>
              <View style={styles.bottomButtonArea}>
                <View style={styles.dotArea}>
                  <View style={styles.normalDot} />
                  <View style={styles.normalDot} />
                  <View style={styles.activeDot} />
                </View>
                {this.state.testingResult !== true && <TouchableOpacity style={styles.bottomButton} onPress={Actions.pop}>
                  <Text style={styles.bottomButtonText}>GO BACK</Text>
                </TouchableOpacity>}
              </View>

            </ShadowComponent>}
          </View>
        </View>
        {this.state.keyboardHeight > 0 &&
          <Animated.View style={[styles.keyboardExternal, { bottom: this.state.keyboardHeight, opacity: this.state.keyboardExternalOpacity, }]}>
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
                  return (<TouchableOpacity style={styles.selectionItem} onPress={() => this.onSubmitWord.bind(this)(item)}>
                    <Text style={[styles.selectionItemText, { color: this.state.currentInputtedText === item ? 'blue' : 'gray' }]}>{item}</Text>
                  </TouchableOpacity>)
                }}
              />
            </View>}
          </Animated.View>}
      </SafeAreaView>
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
    flex: 1,
  },
  bodyContent: {
    flex: 1, flexDirection: 'column',
    width: "100%",
  },
  content: {
    flex: 1, flexDirection: 'column', backgroundColor: '#F4F2EE',
    padding: convertWidth(16),
  },
  titleArea: {
    height: 40,
    paddingLeft: convertWidth(16), paddingRight: convertWidth(16),
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  titleText: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next W1G' : 'Avenir Black',
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
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next W1G' : 'Avenir Black',
    fontWeight: '600', fontSize: 14,
    width: '100%',
  },
  warningMessage: {
    marginTop: 20,
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next W1G' : 'Avenir Black',
    fontWeight: '300', fontSize: 14,
    width: '100%',
  },

  phraseWordsArea: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 22,
    paddingTop: 25, paddingBottom: 25,
    borderTopWidth: 3, borderTopColor: '#FF003C', borderBottomWidth: 3, borderBottomColor: '#FF003C',
  },
  recoveryPhraseSet: {
    flex: 1,
    flexDirection: 'column',
    marginTop: 2,
    paddingTop: 3,
    paddingBottom: 3,
    width: convertWidth(140),
  },
  recoveryPhraseIndex: {
    width: convertWidth(39),
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next W1G' : 'Avenir Light',
    fontWeight: '300',
    fontSize: 15,
    color: 'rgba(0, 0, 0, 0.87)'
  },
  recoveryPhraseValue: {
    backgroundColor: 'white',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 24,
    padding: 2,
  },
  recoveryPhraseWord: {
    flex: 1,
    borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 2,
    backgroundColor: '#F1F1F1',
    textAlign: 'center', fontSize: 13, color: 'rgba(0, 0, 0, 0.6)',
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Andale Mono',
    height: '100%',
  },
  recoveryPhraseWordInput: {
    flex: 1,
    fontFamily: 'Andale Mono', fontSize: 13,
  },
  infoArea: {
    flexDirection: 'row',
    paddingLeft: convertWidth(2), paddingRight: convertWidth(2),
    backgroundColor: '#F4F2EE',
    marginTop: 16,
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
  vaultTitle: {
    marginTop: 25,
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Avenir black',
    color: 'rgba(0, 0, 0, 0.87)', fontSize: 24, fontWeight: '900', textAlign: 'left',
  },
  vaultMessage: {
    marginTop: 10,
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Avenir book',
    fontWeight: '300', fontSize: 14, color: 'rgba(0, 0, 0, 0.6)', textAlign: 'left',
  },
  testButton: {
    backgroundColor: '#0060F2',
    borderWidth: 1, borderColor: '#0060F2', borderRadius: 4,
    width: convertWidth(218),
    height: 36,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 26,
    marginBottom: 20,
  },
  testButtonText: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Avenir Black',
    fontWeight: '700', fontSize: 14, color: 'white',
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
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next W1G' : 'Avenir Heavy',
    fontSize: 16, color: '#FF003C', fontWeight: '700',
  }

});

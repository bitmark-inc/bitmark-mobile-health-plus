import React, { Component } from 'react';
import {
  StyleSheet,
  Image, View, TouchableOpacity, Text, SafeAreaView, ScrollView, FlatList,
} from 'react-native';

import PropTypes from 'prop-types';

import { convertWidth } from './../../utils';
import { config } from './../../configs';
import { Actions } from 'react-native-router-flux';
import { constants } from '../../constants';
import { AppProcessor } from '../../processors';
import { EventEmitterService } from '../../services';

const STEPS = {
  warning: 1,
  phrase24Word: 2,
  testing: 3,
}

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
      phrase24Words: [],
      randomWords: [],
      selectingIndex: -1,
      remainIndex: [],
      testingResult: null,
    }
  }
  accessPhrase24Words() {
    AppProcessor.doGetCurrentAccount().then((userInfo) => {
      if (!userInfo) {
        return;
      }
      console.log('userInfo :', userInfo);
      let smallerList = [];
      let biggerList = [];
      let phrase24Words = [];
      for (let index in userInfo.phrase24Words) {
        if (index < 12) {
          smallerList.push({ word: userInfo.phrase24Words[index] });
        } else {
          biggerList.push({ word: userInfo.phrase24Words[index] });
        }
        phrase24Words.push({ index, word: userInfo.phrase24Words[index] });
      }
      if (this.props.isLogout) {
        this.goToTest(phrase24Words);
      } else {
        this.setState({ phrase24Words, smallerList, biggerList, step: STEPS.phrase24Word });
      }
    }).catch((error => {
      console.log('error:', error);
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, {
        error,
        onClose: Actions.pop
      });
    }));
  }
  goToTest(phrase24Words) {
    console.log('phrase24Words :', phrase24Words);
    let numberWorldFilled = 20;
    let countPreFill = 0;
    let smallerList = [];
    let biggerList = [];
    for (let index in phrase24Words) {
      if (index < 12) {
        smallerList.push({ word: phrase24Words[index].word });
      } else {
        biggerList.push({ word: phrase24Words[index].word });
      }
    }
    console.log('run1')

    while (countPreFill < numberWorldFilled) {
      let randomIndex = Math.floor(Math.random() * phrase24Words.length);
      if (!phrase24Words[randomIndex].selected) {
        phrase24Words[randomIndex].selected = true;
        if (randomIndex < 12) {
          smallerList[randomIndex].selected = true;
        } else {
          biggerList[randomIndex - 12].selected = true;
        }
        countPreFill++;
      }
    }
    let randomWords = [];
    let remainIndex = [];
    for (let index = 0; index < phrase24Words.length; index++) {
      if (!phrase24Words[index].selected) {
        randomWords.push({ word: phrase24Words[index].word });
        remainIndex.push(index);
      }
    }
    console.log('run2')
    randomWords = randomWords.sort((a, b) => a.word < b.word ? -1 : (a.word > b.word ? 1 : 0));

    randomWords.forEach(item => item.selected = null);
    smallerList.forEach(item => item.word = item.selected ? item.word : '');
    biggerList.forEach(item => item.word = item.selected ? item.word : '');
    console.log('run3', randomWords,
      phrase24Words,
      smallerList,
      biggerList,
      remainIndex)
    this.setState({
      step: STEPS.testing,
      randomWords,
      phrase24Words,
      smallerList,
      biggerList,
      remainIndex,
      selectingIndex: remainIndex[0],
    });
  }
  selectRandomWord(item) {
    console.log('selectingIndex :', this.state.selectingIndex, this.state.remainIndex);
    let randomWords = this.state.randomWords;
    let remainIndex = this.state.remainIndex;

    randomWords.forEach(it => it.selected = it.word === item.word ? true : it.selected);
    let smallerList = this.state.smallerList;
    let biggerList = this.state.biggerList;
    let selectingIndex = this.state.selectingIndex;
    if (selectingIndex < 12) {
      smallerList[selectingIndex].word = item.word;
    } else {
      biggerList[selectingIndex - 12].word = item.word;
    }

    let testingResult = null;
    if (remainIndex.length === 1) {
      testingResult = true;
      console.log(smallerList, biggerList, this.state.phrase24Words);

      for (let index = 0; index < this.state.phrase24Words.length; index++) {
        if ((index < 12 && this.state.phrase24Words[index].word !== smallerList[index].word) ||
          (index >= 12 && this.state.phrase24Words[index].word !== biggerList[index - 12].word)) {
          testingResult = false;
          console.log('testingResult  false :', index);
          break;
        }
      }
    } else {
      let tempIndex = remainIndex.findIndex(id => id === selectingIndex);
      selectingIndex = remainIndex[(tempIndex + 1) % remainIndex.length];
      remainIndex.splice(tempIndex, 1);
    }
    console.log('selectingIndex :', selectingIndex, remainIndex);
    this.setState({ randomWords, smallerList, biggerList, remainIndex, selectingIndex, testingResult });
  }

  resetTest() {
    let randomWords = this.state.randomWords;
    let smallerList = this.state.smallerList;
    let biggerList = this.state.biggerList;

    randomWords.forEach(item => item.selected = null);
    smallerList.forEach(item => item.word = item.selected ? item.word : '');
    biggerList.forEach(item => item.word = item.selected ? item.word : '');
    let remainIndex = [];
    for (let index = 0; index < this.state.phrase24Words.length; index++) {
      if (!this.state.phrase24Words[index].selected) {
        remainIndex.push(index);
      }
    }
    console.log('remainIndex :', remainIndex);
    this.setState({
      testingResult: null,
      randomWords,
      smallerList,
      biggerList,
      remainIndex,
      selectingIndex: remainIndex[0],
    });
  }

  doLogout() {
    AppProcessor.doLogout().then(() => {
      EventEmitterService.emit(EventEmitterService.events.APP_NEED_REFRESH);
    }).catch(error => {
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error })
    })
  }

  render() {
    console.log('this.state', this.state);
    return (
      <SafeAreaView style={styles.bodySafeView}>
        <View style={styles.body}>
          <View style={styles.bodyContent}>
            <View style={styles.titleArea}>
              <Text style={styles.titleText}>{(this.props.isLogout ? 'Log out' : (this.state.step === STEPS.testing ? 'TEST Recovery Phrase' : 'Recovery phrase')).toUpperCase()}</Text>
              <TouchableOpacity onPress={Actions.pop}>
                {this.state.step !== STEPS.testing && <Image style={styles.titleBackIcon} source={require('./../../../assets/imgs/back_icon_red.png')} />}
                {this.state.step === STEPS.testing && <Text style={styles.titleCancelText}>Cancel</Text>}
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ flex: 1 }}>
              {this.state.step === STEPS.warning && <View style={styles.content}>
                <View style={styles.warningIconArea}>
                  <Image style={styles.warningIcon} source={require('./../../../assets/imgs/warning_icon.png')} />
                </View>
                {!this.props.isLogout && <Text style={styles.warningMessage}>
                  Your recovery phrase is the only way to restore your Bitmark account if your phone is lost, stolen, broken, or upgraded.{'\n\n'}
                  We will show you a list of words to write down on a piece of paper and keep safe.{'\n\n'}
                  Make sure you are in a private location before writing down your recovery phrase.
              </Text>}
                {this.props.isLogout && <Text style={styles.warningMessage}>
                  Logging out of this account will allow you to access and manage a different account on this device.{'\n\n'}
                  Your current account will be removed from this device. If you wish to restore it in the future, you will need to enter your Recovery Phrase.
              </Text>}
              </View>}

              {this.state.step === STEPS.phrase24Word && <View style={styles.content}>
                <Text style={styles.phrase24WordMessage}>
                  Please write down your recovery phrase in the exact sequence below:
              </Text>
                <View style={styles.phrase24WordsArea}>
                  <FlatList data={this.state.smallerList}
                    keyExtractor={(item, index) => index + ''}
                    scrollEnabled={false}
                    extraData={this.state}
                    renderItem={({ item, index }) => {
                      return (
                        <View style={styles.recoveryPhraseSet}>
                          <Text style={styles.recoveryPhraseIndex}>{index + 1}.</Text>
                          <Text style={styles.recoveryPhraseWord}>{item.word}</Text>
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
                          <Text style={styles.recoveryPhraseIndex}>{index + 13}.</Text>
                          <Text style={styles.recoveryPhraseWord}>{item.word}</Text>
                        </View>
                      )
                    }}
                  />
                </View>

              </View>}

              {this.state.step === STEPS.testing && <View style={styles.content}>
                <Text style={styles.phrase24WordMessage}>
                  {this.props.isLogout ? 'To continue, tap the words to put them in the correct order for your recovery phrase:'
                    : 'Tap the words to put them in the correct order for your recovery phrase:'}
                </Text>
                <View style={styles.phrase24WordsArea}>
                  <FlatList data={this.state.smallerList}
                    keyExtractor={(item, index) => index + ''}
                    scrollEnabled={false}
                    extraData={this.state}
                    renderItem={({ item, index }) => {
                      console.log('render 1', item);
                      return (
                        <TouchableOpacity style={[styles.recoveryPhraseSet,]}
                          disabled={item.selected}
                          onPress={() => this.setState({ selectingIndex: index })}
                        >
                          <Text style={styles.recoveryPhraseIndex}>{index + 1}.</Text>
                          <Text style={[styles.recoveryPhraseWord, {
                            color: item.selected ? '#828282' : '#FF4444',
                            backgroundColor: item.word ? 'white' : '#F5F5F5',
                            borderWidth: this.state.selectingIndex === index ? 1 : 0,
                            borderColor: '#FF4444'
                          }]}>{item.word}</Text>
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
                      console.log('render 2', item);
                      return (
                        <TouchableOpacity style={[styles.recoveryPhraseSet,]}
                          disabled={item.selected}
                          onPress={() => this.setState({ selectingIndex: index + 12 })}
                        >
                          <Text style={styles.recoveryPhraseIndex}>{index + 13}.</Text>
                          <Text style={[styles.recoveryPhraseWord, {
                            color: item.selected ? '#828282' : '#FF4444',
                            backgroundColor: item.word ? 'white' : '#F5F5F5',
                            borderWidth: this.state.selectingIndex === (index + 12) ? 1 : 0,
                            borderColor: '#FF4444'
                          }]}>{item.word}</Text>
                        </TouchableOpacity>
                      )
                    }}
                  />
                </View>

                {this.state.testingResult === null && <FlatList data={this.state.randomWords}
                  keyExtractor={(item, index) => index + ''}
                  scrollEnabled={false}
                  horizontal={false}
                  numColumns={4}
                  contentContainerStyle={{ flexDirection: 'column' }}
                  extraData={this.state}
                  renderItem={({ item }) => {
                    console.log('render 3', item);
                    return (
                      <TouchableOpacity style={[styles.recoveryPhraseChooseButton, {
                        borderColor: item.selected ? 'white' : '#FF4444'
                      }]}
                        disabled={item.selected}
                        onPress={() => this.selectRandomWord(item)}>
                        <Text style={[styles.recoveryPhraseChooseButtonText, {
                          color: item.selected ? 'white' : 'black'
                        }]}>{item.word}</Text>
                      </TouchableOpacity>
                    )
                  }}
                />}
                {this.state.testingResult === false && <View style={styles.testingResultArea}>
                  <Text style={styles.errorTitle}>Error!</Text>
                  <Text style={styles.errorMessage}>Please try again!</Text>
                </View>}
                {this.state.testingResult === true && <View style={styles.testingResultArea}>
                  <Text style={styles.successTitle}>Success!</Text>
                  <Text style={styles.successMessage}>Keep your written copy private in a secure and safe location. </Text>
                </View>}
              </View>}

              {this.state.step === STEPS.warning && <View style={styles.bottomButtonArea}>
                <TouchableOpacity style={styles.bottomButton} onPress={this.accessPhrase24Words.bind(this)}>
                  <Text style={styles.bottomButtonText}>SUBMIT</Text>
                </TouchableOpacity>
              </View>}

              {this.state.step === STEPS.phrase24Word && <View style={styles.bottomButtonArea}>
                {!this.props.isLogout && <TouchableOpacity style={[styles.bottomButton, { borderWidth: 1, borderColor: '#FF4444', backgroundColor: 'white', }]} onPress={() => this.goToTest.bind(this)(this.state.phrase24Words)}>
                  <Text style={[styles.bottomButtonText, { color: '#FF4444' }]}>{'Test recover phrase'.toUpperCase()}</Text>
                </TouchableOpacity>}
                <TouchableOpacity style={[styles.bottomButton, { marginTop: 10, }]} onPress={() => this.props.isLogout ? this.goToTest.bind(this)(this.state.phrase24Words) : Actions.pop()}>
                  <Text style={[styles.bottomButtonText,]}>{'Done'.toUpperCase()}</Text>
                </TouchableOpacity>
              </View>}

              {this.state.step === STEPS.testing && (this.state.testingResult !== null) && <View style={styles.bottomButtonArea}>
                <TouchableOpacity style={styles.bottomButton} onPress={this.state.testingResult ? (this.props.isLogout ? this.doLogout.bind(this) : Actions.pop) : this.resetTest.bind(this)}>
                  <Text style={styles.bottomButtonText}>{(this.state.testingResult ? (this.props.isLogout ? 'log out' : 'done') : 'retry').toUpperCase()}</Text>
                </TouchableOpacity>
              </View>}
            </ScrollView>
          </View>
        </View>
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
    paddingTop: convertWidth(16) + (config.isIPhoneX ? constants.iPhoneXStatusBarHeight : 0),
    flex: 1,
  },
  bodyContent: {
    flex: 1,
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: "#FF4444",
    width: "100%",
  },
  content: {
    padding: convertWidth(20),
    paddingTop: convertWidth(15),
    flexDirection: 'column',
    flex: 1,
  },
  titleArea: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: convertWidth(20),
    paddingTop: convertWidth(15),
    paddingBottom: 0,
  },
  titleText: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 18,
  },
  titleBackIcon: {
    width: convertWidth(21),
    height: 21 * convertWidth(21) / 21,
    resizeMode: 'contain',
  },
  titleCancelText: {
    fontFamily: 'Avenir Black',
    fontWeight: '300',
    fontSize: 16,
    color: "#FF4444"
  },


  warningIconArea: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 34,
  },
  warningIcon: {
    width: convertWidth(137),
    height: 36 * convertWidth(137) / 137,
  },
  warningMessage: {
    marginTop: 20,
    fontFamily: 'Avenir Black',
    fontWeight: '300',
    fontSize: 17,
  },

  phrase24WordMessage: {
    fontFamily: 'Avenir Light',
    fontWeight: '300',
    fontSize: 16,
    marginTop: 16,
  },
  phrase24WordsArea: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
  },
  recoveryPhraseSet: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    paddingTop: 3,
    paddingBottom: 3,
    height: 28,
    width: convertWidth(140),
  },
  recoveryPhraseIndex: {
    width: convertWidth(39),
    fontFamily: 'Avenir Light',
    fontWeight: '300',
    fontSize: 15,
    color: '#C1C1C1'
  },
  recoveryPhraseWord: {
    fontFamily: 'Avenir Light',
    fontWeight: '300',
    fontSize: 15,
    color: '#FF4444',
    flex: 1,
  },

  recoveryPhraseChooseButton: {
    borderWidth: 1,
    borderColor: '#FF4444',
    padding: 4,
    marginRight: 10,
    marginTop: 27,
  },
  recoveryPhraseChooseButtonText: {
    fontFamily: 'Avenir Light',
    fontWeight: '300',
    fontSize: 15,
    color: '#FF4444',
  },
  testingResultArea: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorTitle: {
    fontFamily: 'Avenir Heavy',
    fontWeight: '600',
    fontSize: 15,
    color: '#FF4444'
  },
  errorMessage: {
    fontFamily: 'Avenir Heavy',
    fontWeight: '300',
    fontSize: 15,
    color: '#FF4444',
    textAlign: 'center',
  },
  successTitle: {
    fontFamily: 'Avenir Heavy',
    fontWeight: '600',
    fontSize: 15,
  },
  successMessage: {
    fontFamily: 'Avenir Heavy',
    fontWeight: '300',
    fontSize: 15,
    textAlign: 'center',
  },

  bottomButtonArea: {
    padding: convertWidth(20),
  },
  bottomButton: {
    height: 45,
    backgroundColor: '#FF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomButtonText: {
    fontFamily: 'Avenir Heavy',
    fontSize: 16,
    color: 'white',
  }

});

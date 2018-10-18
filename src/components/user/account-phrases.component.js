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
  phraseWord: 2,
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
      phraseWords: [],
      randomWords: [],
      selectingIndex: -1,
      remainIndex: [],
      testingResult: null,
    }
  }
  accessPhraseWords() {
    AppProcessor.doGetCurrentAccount(this.props.isLogout).then((userInfo) => {
      if (!userInfo) {
        return;
      }
      console.log('userInfo :', userInfo);
      let smallerList = [];
      let biggerList = [];
      let phraseWords = [];
      for (let index in userInfo.phraseWords) {
        if (index < (userInfo.phraseWords.length / 2)) {
          smallerList.push({ word: userInfo.phraseWords[index] });
        } else {
          biggerList.push({ word: userInfo.phraseWords[index] });
        }
        phraseWords.push({ index, word: userInfo.phraseWords[index] });
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
    console.log('phraseWords :', phraseWords);
    let numberWorldFilled = 20;
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
    let randomWords = [];
    let remainIndex = [];
    for (let index = 0; index < phraseWords.length; index++) {
      if (!phraseWords[index].selected) {
        randomWords.push({ word: phraseWords[index].word });
        remainIndex.push(index);
      }
    }
    randomWords = randomWords.sort((a, b) => a.word < b.word ? -1 : (a.word > b.word ? 1 : 0));

    randomWords.forEach(item => item.selected = null);
    smallerList.forEach(item => item.word = item.selected ? item.word : '');
    biggerList.forEach(item => item.word = item.selected ? item.word : '');

    this.setState({
      step: STEPS.testing,
      randomWords,
      phraseWords,
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
    if (selectingIndex < (this.state.phraseWords.length / 2)) {
      smallerList[selectingIndex].word = item.word;
    } else {
      biggerList[selectingIndex - (this.state.phraseWords.length / 2)].word = item.word;
    }

    let testingResult = null;
    if (remainIndex.length === 1) {
      testingResult = true;
      console.log(smallerList, biggerList, this.state.phraseWords);

      for (let index = 0; index < this.state.phraseWords.length; index++) {
        if ((index < (this.state.phraseWords.length / 2) && this.state.phraseWords[index].word !== smallerList[index].word) ||
          (index >= (this.state.phraseWords.length / 2) && this.state.phraseWords[index].word !== biggerList[index - (this.state.phraseWords.length / 2)].word)) {
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
    for (let index = 0; index < this.state.phraseWords.length; index++) {
      if (!this.state.phraseWords[index].selected) {
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
              <Text style={styles.titleText}>{(this.props.isLogout ? i18n.t('AccountPhraseComponent_titleText1')
                : (this.state.step === STEPS.testing ? i18n.t('AccountPhraseComponent_titleText2') : i18n.t('AccountPhraseComponent_titleText3'))).toUpperCase()}</Text>
              <TouchableOpacity onPress={Actions.pop}>
                {this.state.step !== STEPS.testing && <Image style={styles.titleBackIcon} source={require('./../../../assets/imgs/back_icon_red.png')} />}
                {this.state.step === STEPS.testing && <Text style={styles.titleCancelText}>{i18n.t('AccountPhraseComponent_titleCancelText')}</Text>}
              </TouchableOpacity>
            </View>

            {this.state.step === STEPS.warning && <View style={{ flex: 1 }}>
              <ScrollView style={styles.content}>
                <View style={styles.warningIconArea}>
                  <Image style={styles.warningIcon} source={require('./../../../assets/imgs/warning_icon.png')} />
                </View>
                {!this.props.isLogout && <Text style={styles.warningMessage}>
                  {i18n.t('AccountPhraseComponent_warningMessage1')}
                </Text>}
                {this.props.isLogout && <Text style={styles.warningMessage}>
                  {i18n.t('AccountPhraseComponent_warningMessage2')}
                </Text>}
              </ScrollView>

              <View style={styles.bottomButtonArea}>
                <TouchableOpacity style={styles.bottomButton} onPress={this.accessPhraseWords.bind(this)}>
                  <Text style={styles.bottomButtonText}>{i18n.t('AccountPhraseComponent_bottomButtonText1')}</Text>
                </TouchableOpacity>
              </View>
            </View>}

            {this.state.step === STEPS.phraseWord && <View style={{ flex: 1 }}>
              <ScrollView style={styles.content}>
                <Text style={styles.phraseWordMessage}>
                  {i18n.t('AccountPhraseComponent_phraseWordMessage1')}
                </Text>
                <View style={styles.phraseWordsArea}>
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

              </ScrollView>

              <View style={styles.bottomButtonArea}>
                {!this.props.isLogout && <TouchableOpacity style={[styles.bottomButton, { borderWidth: 1, borderColor: '#FF4444', backgroundColor: 'white', }]} onPress={() => this.goToTest.bind(this)(this.state.phraseWords)}>
                  <Text style={[styles.bottomButtonText, { color: '#FF4444' }]}>{i18n.t('AccountPhraseComponent_bottomButtonText2').toUpperCase()}</Text>
                </TouchableOpacity>}
                <TouchableOpacity style={[styles.bottomButton, { marginTop: 10, }]} onPress={() => this.props.isLogout ? this.goToTest.bind(this)(this.state.phraseWords) : Actions.pop()}>
                  <Text style={[styles.bottomButtonText,]}>{i18n.t('AccountPhraseComponent_bottomButtonText3').toUpperCase()}</Text>
                </TouchableOpacity>
              </View>
            </View>}

            {this.state.step === STEPS.testing && <View style={{ flex: 1 }}>
              <ScrollView style={styles.content}>
                <Text style={styles.phraseWordMessage}>
                  {this.props.isLogout ? i18n.t('AccountPhraseComponent_phraseWordMessage2')
                    : i18n.t('AccountPhraseComponent_phraseWordMessage3')}
                </Text>
                <View style={styles.phraseWordsArea}>
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
                          onPress={() => this.setState({ selectingIndex: index + (this.state.phraseWords.length / 2) })}
                        >
                          <Text style={styles.recoveryPhraseIndex}>{index + 13}.</Text>
                          <Text style={[styles.recoveryPhraseWord, {
                            color: item.selected ? '#828282' : '#FF4444',
                            backgroundColor: item.word ? 'white' : '#F5F5F5',
                            borderWidth: this.state.selectingIndex === (index + (this.state.phraseWords.length / 2)) ? 1 : 0,
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
                  contentContainerStyle={{ flexDirection: 'column', paddingBottom: 20, }}
                  extraData={this.state}
                  renderItem={({ item }) => {
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
                  <Text style={styles.errorTitle}>{i18n.t('AccountPhraseComponent_errorTitle')}</Text>
                  <Text style={styles.errorMessage}>{i18n.t('AccountPhraseComponent_errorMessage')}</Text>
                </View>}
                {this.state.testingResult === true && <View style={styles.testingResultArea}>
                  <Text style={styles.successTitle}>{i18n.t('AccountPhraseComponent_successTitle')}</Text>
                  <Text style={styles.successMessage}>{this.props.isLogout ? i18n.t('AccountPhraseComponent_successMessage1') : i18n.t('AccountPhraseComponent_successMessage2')}</Text>
                </View>}
              </ScrollView>

              <View style={styles.bottomButtonArea}>
                <TouchableOpacity style={styles.bottomButton} onPress={this.state.testingResult ? (this.props.isLogout ? this.doLogout.bind(this) : Actions.pop) : this.resetTest.bind(this)}>
                  <Text style={styles.bottomButtonText}>{(this.state.testingResult ?
                    (this.props.isLogout ? i18n.t('AccountPhraseComponent_bottomButtonText4') : i18n.t('AccountPhraseComponent_bottomButtonText5')) :
                    i18n.t('AccountPhraseComponent_bottomButtonText6')).toUpperCase()}</Text>
                </TouchableOpacity>
              </View>

            </View>}
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

  phraseWordMessage: {
    fontFamily: 'Avenir Light',
    fontWeight: '300',
    fontSize: 16,
    marginTop: 16,
  },
  phraseWordsArea: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
    paddingBottom: 20,
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
    marginTop: 10,
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
    paddingBottom: 20,
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

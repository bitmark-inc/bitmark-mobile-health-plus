
import React from 'react';
import PropTypes from 'prop-types';
import {
  Text, View, TouchableOpacity, TouchableWithoutFeedback, TextInput, Image, FlatList,
  Keyboard,
  StatusBar,
} from 'react-native';
import defaultStyles from './../../../commons/styles';
import signStyle from './sign-in.component.style';
import { BitmarkAutoCompleteComponent, BitmarkComponent } from './../../../commons/components';
import { dictionary24Words, convertWidth } from './../../../utils';
import { AppProcessor } from '../../../processors';
import { iosConstant } from '../../../configs/ios/ios.config';

let PreCheckResults = {
  success: 'SUBMIT',
  error: 'RETRY'
};

// madelena testnet
// let testWords = ["acid", "dinner", "west", "satisfy", "ranch", "include", "remove", "vanish", "visual", "shift", "delay", "spot", "table", "feed", "volume", "oblige", "crisp", "bracket", "acoustic", "nurse", "where", "wreck", "fly", "marriage",];
// madelena livenet
// let testWords = ["absent", "ostrich", "injury", "pill", "episode", "permit", "endless", "happy", "thing", "devote", "robust", "earth", "punch", "robot", "jelly", "demand", "topple", "diamond", "climb", "turn", "reveal", "suspect", "fat", "assault",];

// victor testnet
// let testWords = ["access", "say", "write", "artwork", "broom", "wife", "patch", "skill", "snack", "cabin", "best", "target", "night", "notable", "appear", "life", "blame", "enter", "glide", "vocal", "chuckle", "biology", "spy", "inspire",];

// let testWords = ["accident", "sausage", "ticket", "dolphin", "original", "nasty", "theme", "life", "polar", "donor", "office", "weird", "neither", "escape", "flag", "spell", "submit", "salute", "sustain", "habit", "soap", "oil", "romance", "drama",];
// let testWords = ["accuse", "angry", "thing", "alone", "day", "guitar", "gown", "possible", "rotate", "erupt", "teach", "myth", "final", "rule", "conduct", "term", "mom", "soldier", "prepare", "bench", "hurt", "banana", "joy", "asset",];
export class SignInComponent extends React.Component {

  constructor(props) {
    super(props);
    this.onChangeText = this.onChangeText.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onSubmitWord = this.onSubmitWord.bind(this);
    this.selectIndex = this.selectIndex.bind(this);
    this.checkStatusInputting = this.checkStatusInputting.bind(this);
    this.doCheck24Word = this.doCheck24Word.bind(this);
    this.submit24Words = this.submit24Words.bind(this);
    this.doSignIn = this.doSignIn.bind(this);

    let smallerList = [];
    let biggerList = [];
    for (let index = 0; index < 24; index++) {
      if (index < 12) {
        smallerList.push({
          key: index,
          // word: testWords[index],
          word: '',
        });
      } else {
        biggerList.push({
          key: index,
          // word: testWords[index],
          word: '',
        });
      }
    }
    this.inputtedRefs = {};

    this.state = {
      smallerList,
      biggerList,
      selectedIndex: -1,
      remainWordNumber: 24,
      dataSource: dictionary24Words,
      keyBoardHeight: 0,
    };
    // setTimeout(this.checkStatusInputting, 200);
  }

  onChangeText(index, text) {
    text = text ? text.trim() : '';
    if (this.autoCompleteElement) {
      this.autoCompleteElement.filter(text);
    }
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
    this.setState({
      selectedIndex: index
    });
    this.fullRef.setFocusElement(this.inputtedRefs[index]);
    if (this.autoCompleteElement) {
      let text = index < 12 ? this.state.smallerList[index].word : this.state.biggerList[index - 12].word;
      this.autoCompleteElement.filter(text);
    }
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
    this.selectIndex((selectedIndex + 1) % 24);
  }

  selectIndex(index) {
    this.inputtedRefs[index].focus();
    this.onFocus(index);
    this.checkStatusInputting();
  }

  checkStatusInputting() {
    let countNumberInputtedWord = 0;
    this.state.smallerList.forEach(item => {
      countNumberInputtedWord = countNumberInputtedWord + (item.word ? 1 : 0)
    });
    this.state.biggerList.forEach(item => {
      countNumberInputtedWord = countNumberInputtedWord + (item.word ? 1 : 0)
    });
    this.setState({
      preCheckResult: null,
      remainWordNumber: 24 - countNumberInputtedWord,
    });
    let status = countNumberInputtedWord === 24 ? BitmarkAutoCompleteComponent.statuses.done : BitmarkAutoCompleteComponent.statuses.inputting;
    if (this.autoCompleteElement) {
      this.autoCompleteElement.setStatus(status);
    }
  }

  async doCheck24Word() {
    return new Promise((resolve) => {
      Keyboard.dismiss();
      if (this.state.remainWordNumber === 0) {
        let inputtedWords = [];
        this.state.smallerList.forEach(item => inputtedWords.push(item.word));
        this.state.biggerList.forEach(item => inputtedWords.push(item.word));
        AppProcessor.doCheck24Words(inputtedWords).then(() => {
          this.setState({ preCheckResult: PreCheckResults.success });
          resolve(true);
        }).catch((error) => {
          resolve(false);
          console.log('check24Words error: ', error);
          this.setState({ preCheckResult: PreCheckResults.error });
        });
      } else {
        this.setState({ preCheckResult: null });
        resolve(true);
      }
    });
  }

  doSignIn() {
    this.doCheck24Word().then((result) => {
      if (result) {
        this.props.navigation.navigate('FaceTouchId', { doContinue: this.submit24Words })
      }
    });
  }

  async submit24Words() {
    if (this.state.preCheckResult === PreCheckResults.error) {
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
    let inputtedWords = [];
    this.state.smallerList.forEach(item => inputtedWords.push(item.word));
    this.state.biggerList.forEach(item => inputtedWords.push(item.word));
    return await AppProcessor.doLogin(inputtedWords);
  }

  render() {
    return (
      <BitmarkComponent
        backgroundColor={'#F5F5F5'}
        ref={(ref) => this.fullRef = ref}
        header={(<TouchableWithoutFeedback onPress={Keyboard.dismiss} >
          <View style={[defaultStyles.header, { backgroundColor: '#F5F5F5' }]}>
            <StatusBar hidden={false} />
            <TouchableOpacity style={[defaultStyles.headerLeft, { width: 50 }]} onPress={() => { this.props.navigation.goBack() }}>
              <Image style={defaultStyles.headerLeftIcon} source={require('./../../../../assets/imgs/header_blue_icon.png')} />
            </TouchableOpacity>
            <Text style={[defaultStyles.headerTitle, { maxWidth: convertWidth(375) - 100 }]}>RECOVERY PHRASE SIGN-IN</Text>
            <TouchableOpacity style={[defaultStyles.headerRight, { width: 50 }]}>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
        )}
        contentContainerStyle={{ backgroundColor: 'white' }}
        contentInScroll={true}
        content={(<TouchableWithoutFeedback onPress={Keyboard.dismiss} >
          <TouchableOpacity activeOpacity={1} style={signStyle.mainContent}>
            <Text style={[signStyle.writeRecoveryPhraseContentMessage,]}>Please type all 24 words of your recovery phrase in the exact sequence below:</Text>
            <View style={[signStyle.writeRecoveryPhraseArea]}>
              <View style={signStyle.writeRecoveryPhraseContentHalfList}>
                <FlatList data={this.state.smallerList}
                  scrollEnabled={false}
                  extraData={this.state}
                  renderItem={({ item }) => {
                    return (<View style={signStyle.recoveryPhraseSet}>
                      <Text style={signStyle.recoveryPhraseIndex}>{item.key + 1}.</Text>
                      <TextInput
                        style={[signStyle.recoveryPhraseWord, {
                          backgroundColor: (item.word ? 'white' : '#F5F5F5'),
                          borderColor: '#0060F2',
                          borderWidth: (item.key === this.state.selectedIndex ? 1 : 0),
                        }]}
                        ref={(r) => { this.inputtedRefs[item.key] = r; }}
                        onChangeText={(text) => this.onChangeText(item.key, text)}
                        onFocus={() => this.onFocus(item.key)}
                        value={item.word}
                        autoCorrect={false}
                        autoCapitalize="none"
                        onSubmitEditing={() => this.onSubmitWord(item.word)}
                      />
                    </View>)
                  }}
                />
              </View>

              <View style={[signStyle.writeRecoveryPhraseContentHalfList, { marginLeft: 33, }]}>
                <FlatList data={this.state.biggerList}
                  scrollEnabled={false}
                  extraData={this.state}
                  renderItem={({ item }) => {
                    return (<View style={signStyle.recoveryPhraseSet}>
                      <Text style={signStyle.recoveryPhraseIndex}>{item.key + 1}.</Text>
                      <TextInput
                        style={[signStyle.recoveryPhraseWord, {
                          backgroundColor: (item.word ? 'white' : '#F5F5F5'),
                          borderColor: '#0060F2',
                          borderWidth: (item.key === this.state.selectedIndex ? 1 : 0),
                        }]}
                        ref={(r) => { this.inputtedRefs[item.key] = r; }}
                        onChangeText={(text) => this.onChangeText(item.key, text)}
                        onFocus={() => this.onFocus(item.key)}
                        value={item.word}
                        autoCorrect={false}
                        autoCapitalize="none"
                        onSubmitEditing={() => this.onSubmitWord(item.word)}
                      />
                    </View>)
                  }}
                />
              </View>
            </View>
            <View style={signStyle.recoveryPhraseTestResult}>
              <Text style={[signStyle.recoveryPhraseTestTitle, { color: this.state.preCheckResult === PreCheckResults.success ? '#0060F2' : '#FF003C' }]}>
                {this.state.preCheckResult === PreCheckResults.success ? 'Success!' : (this.state.preCheckResult === PreCheckResults.error ? 'Wrong Recovery Phrase!' : '')}
              </Text>
              <Text style={[signStyle.recoveryPhraseTestMessage, { color: this.state.preCheckResult === PreCheckResults.success ? '#0060F2' : '#FF003C' }]}>
                {this.state.preCheckResult === PreCheckResults.success ? 'Keep your written copy private in a secure and safe location.' : (this.state.preCheckResult === PreCheckResults.error ? 'Please try again!' : '')}
              </Text>
            </View>
          </TouchableOpacity>
        </TouchableWithoutFeedback>
        )}
        footerHeight={45 + iosConstant.blankFooter / 2}
        footer={(
          <TouchableOpacity style={[signStyle.submitButton, {
            backgroundColor: !this.state.remainWordNumber ? '#0060F2' : 'gray'
          }]} onPress={this.doSignIn} disabled={this.state.remainWordNumber > 0}>
            <Text style={[signStyle.submitButtonText]}>{this.state.preCheckResult || PreCheckResults.success}</Text>
          </TouchableOpacity>
        )}
        keyboardExternal={(
          <BitmarkAutoCompleteComponent ref={(ref) => this.autoCompleteElement = ref}
            dataSource={this.state.dataSource}
            onSelectWord={this.onSubmitWord}
            goToNextInputField={() => this.selectIndex((this.state.selectedIndex + 1) % 24)}
            goToPrevInputField={() => this.selectIndex((this.state.selectedIndex + 23) % 24)}
            onDone={this.doCheck24Word}
          />
        )}
      />
    );
  }
}

SignInComponent.propTypes = {
  screenProps: PropTypes.shape({
    enableJustCreatedBitmarkAccount: PropTypes.func,
  }),
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.shape({
        justCreatedBitmarkAccount: PropTypes.bool,
      })
    })
  })
}
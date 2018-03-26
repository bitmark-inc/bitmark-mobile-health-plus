
import React from 'react';
import PropTypes from 'prop-types';
import {
  Text, View, TouchableOpacity, TouchableWithoutFeedback, TextInput, Image, FlatList,
  Keyboard,
  ScrollView,
  StatusBar,
  Platform,
  Dimensions,
} from 'react-native';
import defaultStyles from './../../../commons/styles';
import signStyle from './sign-in.component.style';
import { BitmarkAutoCompleteComponent } from './../../../commons/components';
import { android, ios } from './../../../configs';
import { dictionary24Words, convertWidth } from './../../../utils';
import { AppController } from '../../../managers';

let deviceSize = Dimensions.get('window');
let constant = Platform.select({ ios: ios.constant, android: android.constant });

let PreCheckResults = {
  success: 'SUBMIT',
  error: 'RETRY'
};

// let testWords = ["account",
//   "pulse",
//   "disease",
//   "funny",
//   "sound",
//   "aim",
//   "rice",
//   "ozone",
//   "clay",
//   "skate",
//   "garbage",
//   "bottom",
//   "credit",
//   "club",
//   "easily",
//   "lumber",
//   "song",
//   "noodle",
//   "gaze",
//   "duty",
//   "enable",
//   "butter",
//   "citizen",
//   "cradle",];

export class SignInComponent extends React.Component {

  constructor(props) {
    super(props);
    this.onChangeText = this.onChangeText.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onSubmitWord = this.onSubmitWord.bind(this);
    this.onKeyboardDidHide = this.onKeyboardDidHide.bind(this);
    this.onKeyboardDidShow = this.onKeyboardDidShow.bind(this);
    this.selectIndex = this.selectIndex.bind(this);
    this.checkStatusInputing = this.checkStatusInputing.bind(this);
    this.submit24Words = this.submit24Words.bind(this);

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
    // setTimeout(this.checkStatusInputing, 200);
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
    this.checkStatusInputing();
  }

  onFocus(index) {
    this.setState({
      selectedIndex: index
    });
    if (this.autoCompleteElement) {
      this.autoCompleteElement.setTextInputElement(this.inputtedRefs[index]);
      this.autoCompleteElement.showKeyboardInput();
      let text = index < 12 ? this.state.smallerList[index].word : this.state.biggerList[index - 12].word;
      this.autoCompleteElement.filter(text);
    }
  }

  onKeyboardDidHide() {
    this.setState({ keyBoardHeight: 0 });
    this.checkStatusInputing();
  }
  onKeyboardDidShow(ke) {
    this.setState({ keyBoardHeight: ke.endCoordinates.height });
    setTimeout(() => {
      if (this.scrollRef) {
        if ((this.state.selectedIndex > 6 && this.state.selectedIndex < 12) || this.state.selectedIndex > 18) {
          this.scrollRef.scrollToEnd({ animated: true });
        } else {
          this.scrollRef.scrollTo({ x: 0, y: 0, animated: true });
        }
      }
    }, 1000);
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
    this.onFocus(index);
    this.checkStatusInputing();
  }

  checkStatusInputing() {
    let countNumberInputtedWord = 0;
    this.state.smallerList.forEach(item => {
      countNumberInputtedWord = countNumberInputtedWord + (item.word ? 1 : 0)
    });
    this.state.biggerList.forEach(item => {
      countNumberInputtedWord = countNumberInputtedWord + (item.word ? 1 : 0)
    });
    if (countNumberInputtedWord === 24) {
      let inputtedWords = [];
      this.state.smallerList.forEach(item => inputtedWords.push(item.word));
      this.state.biggerList.forEach(item => inputtedWords.push(item.word));
      AppController.doCheck24Words(inputtedWords).then(() => {
        this.setState({ preCheckResult: PreCheckResults.success });
      }).catch((error) => {
        console.log('check24Words error: ', error);
        this.setState({ preCheckResult: PreCheckResults.error });
      });
    } else {
      this.setState({ preCheckResult: null });
    }
    this.setState({
      remainWordNumber: 24 - countNumberInputtedWord,
    });
    let status = countNumberInputtedWord === 24 ? BitmarkAutoCompleteComponent.statuses.done : BitmarkAutoCompleteComponent.statuses.inputing;
    if (this.autoCompleteElement) {
      this.autoCompleteElement.setStatus(status);
    }
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
    return await AppController.doLogin(inputtedWords);
  }

  render() {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={signStyle.body}>
          <StatusBar hidden={false} />
          <View style={[defaultStyles.header, { backgroundColor: '#F5F5F5' }]}>
            <TouchableOpacity style={[defaultStyles.headerLeft, { width: convertWidth(50) }]} onPress={() => { this.props.navigation.goBack() }}>
              <Image style={defaultStyles.headerLeftIcon} source={require('./../../../../assets/imgs/header_blue_icon.png')} />
            </TouchableOpacity>
            <Text style={[defaultStyles.headerTitle, { maxWidth: convertWidth(285) }]}>RECOVERY PHRASE SIGN-IN</Text>
            <TouchableOpacity style={[defaultStyles.headerRight, { width: convertWidth(50) }]}>
            </TouchableOpacity>
          </View>

          <ScrollView scrollEnabled={this.state.keyBoardHeight === 0}>
            <TouchableOpacity activeOpacity={1} style={{ flex: 1 }}>
              <View style={signStyle.mainContent}>
                <Text style={[signStyle.writeRecoveryPhraseContentMessage,]}>
                  Please type all 24 words of your recovery phrase in the exact sequence below:
             </Text>
                <View style={[signStyle.writeRecoveryPhraseArea, {
                  height: (this.state.keyBoardHeight
                    ? deviceSize.height - constant.headerSize.height - this.state.keyBoardHeight - constant.autoCompleteHeight - 66
                    : 'auto')
                }]}>
                  <ScrollView alwaysBounceVertical={true} alwaysBounceHorizontal={false} ref={(sr) => { this.scrollRef = sr; }}>
                    <TouchableOpacity activeOpacity={1} style={signStyle.writeRecoveryPhraseContentList}>
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
                    </TouchableOpacity>
                  </ScrollView>
                </View>
                {this.state.preCheckResult && <View style={signStyle.recoveryPhraseTestResult}>
                  <Text style={[signStyle.recoveryPhraseTestTitle, { color: this.state.preCheckResult === PreCheckResults.success ? '#0060F2' : '#FF003C' }]}>
                    {this.state.preCheckResult === PreCheckResults.success ? 'Success!' : 'Wrong Recovery Phrase!'}
                  </Text>
                  <Text style={[signStyle.recoveryPhraseTestMessage, { color: this.state.preCheckResult === PreCheckResults.success ? '#0060F2' : '#FF003C' }]}>
                    {this.state.preCheckResult === PreCheckResults.success ? 'Keep your written copy private in a secure and safe location.' : 'Please try again!'}
                  </Text>
                </View>}
                {!this.state.keyBoardHeight && <TouchableOpacity style={[signStyle.submitButton, {
                  backgroundColor: !this.state.remainWordNumber ? '#0060F2' : 'gray'
                }]} onPress={() => this.props.navigation.navigate('FaceTouchId', { doContinue: this.submit24Words })} disabled={this.state.remainWordNumber > 0}>
                  <Text style={[signStyle.submitButtonText]}>{this.state.preCheckResult || PreCheckResults.success}</Text>
                </TouchableOpacity>}
              </View>
            </TouchableOpacity>
          </ScrollView>

          <BitmarkAutoCompleteComponent ref={(ref) => this.autoCompleteElement = ref}
            dataSource={this.state.dataSource}
            autoCorrect={false}
            onlyDisplayWhenCalled={true}
            onSelectWord={this.onSubmitWord}
            onKeyboardDidShow={this.onKeyboardDidShow}
            onKeyboardDidHide={this.onKeyboardDidHide}
            goToNextInputField={() => this.selectIndex((this.state.selectedIndex + 1) % 24)}
            goToPrevInputField={() => this.selectIndex((this.state.selectedIndex + 23) % 24)}
          >
          </BitmarkAutoCompleteComponent>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

SignInComponent.propTypes = {
  screenProps: PropTypes.shape({
    enableJustCreatedBitmarkAccount: PropTypes.func,
    refreshScaling: PropTypes.func,
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
import React, { Component } from 'react';
import {
  StyleSheet,
  Image, View, TouchableOpacity, Text, SafeAreaView, ScrollView, Alert,
} from 'react-native';

import { Actions } from 'react-native-router-flux';
import { AppProcessor } from 'src/processors';
import { convertWidth } from 'src/utils';
import { CharacterFlapperComponent } from 'src/views/commons';
import PropTypes from 'prop-types';

const STEPS = {
  init: 1,
  generated: 2,
};

export class GenerateHealthCodeComponent extends Component {
  static propTypes = {
    migrateFrom24Words: PropTypes.bool,
    sliderStartAt: PropTypes.number,
  };

  constructor(props) {
    super(props);
    this.canGenerateNew = true;
    this.migrateFrom24Words = props.migrateFrom24Words;
    this.sliderStartAt = props.sliderStartAt || 3;
    this.state = {
      step: STEPS.init,
      inputPhraseWordsString: '',
    };
    this.flapperRefs = {};
  }

  goToTest() {
    Actions.login({migrateFrom24Words: this.migrateFrom24Words, phraseWords: this.phraseWords, backAction: this.regeneratePhraseWords.bind(this)});
  }

  async generatePhraseWords() {
    if (!this.canGenerateNew) {
      return;
    }
    this.canGenerateNew = false;
    let phraseInfo = await AppProcessor.doGeneratePhrase();
    this.phraseWords = phraseInfo.phraseWords;
    this.bitmarkAccountNumber = phraseInfo.bitmarkAccountNumber;

    this.canGenerateNew = true;
    this.setState({ step: STEPS.generated });
  }

  regeneratePhraseWords() {
    Alert.alert('Are you sure?', 'If you go back, you will lose this key phrase and will need to generate a new one. ', [
      {
        text: 'Cancel', style: 'cancel',
      },
      {
        text: 'OK',
        onPress: () => {
          Actions.pop();
          this.setState({
            step: STEPS.init,
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
                        <TouchableOpacity style={[styles.button, {width: 218}]} onPress={this.generatePhraseWords.bind(this)}>
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
          </View>
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
});
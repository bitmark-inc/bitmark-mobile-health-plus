import React, { Component } from 'react';
import {
  StyleSheet,
  Image, View, TouchableOpacity, Text, SafeAreaView, ScrollView,
} from 'react-native';

import { Actions } from 'react-native-router-flux';
import { AppProcessor } from 'src/processors';
import { convertWidth } from 'src/utils';

export class AccountPhraseComponent extends Component {
  constructor(props) {
    super(props);
    this.canGenerateNew = true;
    this.state = {
      phraseWords: []
    };
  }

  componentDidMount() {
    this.getPhraseWords();
  }

  goToTest() {
    Actions.verifyPhraseWords({phraseWords: this.state.phraseWords, backAction: Actions.pop, successAction: this.goToAccountPage.bind(this), actionType: 'testPhraseWords'});
  }

  goToAccountPage() {
    Actions.popTo('account');
  }

  getPhraseWords() {
    AppProcessor.doGetCurrentAccount().then((userInfo) => {
      this.setState({ phraseWords: userInfo.phraseWords });
    });
  }

  render() {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={styles.wrapper}>
          <View style={styles.body}>
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
                    <Text style={[styles.introductionTitle, {marginTop: 30}]}>Your vault key phrase</Text>
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
                        <Text style={[styles.phraseWords]}>{this.state.phraseWords.join(' ').toLowerCase()}</Text>
                      </View>
                    </View>

                    {/*Info Message*/}
                    <Text style={[styles.infoMessage]}>Write it down and keep it in a safe location.</Text>
                  </View>

                  {/*BOTTOM AREA*/}
                  <View style={[styles.bottomArea, {justifyContent: 'space-between'}]}>
                    {/*TEST KEY PHRASE*/}
                    <TouchableOpacity style={[styles.buttonNext, {marginLeft: 0}]} onPress={() => { this.goToTest.bind(this)(this.phraseWords) }}>
                      <Text style={[styles.buttonNextText]}>TEST KEY PHRASE</Text>
                    </TouchableOpacity>

                    {/*DONE*/}
                    <TouchableOpacity style={[styles.buttonNext]} onPress={() => { Actions.pop() }}>
                      <Text style={[styles.buttonNextText]}>DONE</Text>
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
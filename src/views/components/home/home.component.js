import React, { Component } from 'react';
import {
  StyleSheet,
  Image, View, TouchableOpacity, Text, SafeAreaView, Linking
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import Hyperlink from 'react-native-hyperlink';

import { convertWidth } from 'src/utils';
import { config, constants } from 'src/configs';

const ONBOARDING_STATES = {
  ONBOARDING_1: 'ONBOARDING_1',
  ONBOARDING_2: 'ONBOARDING_2'
};


export class HomeComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ONBOARDING_STATE: ONBOARDING_STATES.ONBOARDING_1
    }
  }

  render() {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={styles.body}>
          {/*ONBOARDING SCREEN 1*/}
          {(this.state.ONBOARDING_STATE == ONBOARDING_STATES.ONBOARDING_1) &&
            <View style={styles.bodyContent}>
              {/*TOP AREA*/}
              <View style={[styles.topArea]}>
                <Text style={[styles.title]}>BITMARK HEALTH</Text>
                <Image style={styles.logo} source={require('assets/imgs/bitmark-health-icon.png')} />
              </View>

              {/*CONTENT*/}
              <View style={styles.contentArea}>
                {/*IMAGE*/}
                <View style={[styles.introductionImageArea, { alignItems: 'flex-end', justifyContent: 'flex-end', width: '100%' }]}>
                  <Image style={[styles.onBoardingImage1, config.isIPhoneX ? { position: 'absolute', right: -18 } : {}]} source={require('assets/imgs/onboarding_1.png')} />
                </View>
                {/*DESC*/}
                <View style={styles.introductionTextArea}>
                  <Text style={[styles.introductionTitle]}>Control your health</Text>
                  <Text style={[styles.introductionDescription]}>
                    Take ownership of your health history and control how it is shared with healthcare providers, family, and researchers.
                  </Text>
                </View>
              </View>

              {/*BOTTOM AREA*/}
              <View style={[styles.bottomArea]}>
                <Image style={styles.sliderIcon} source={require('assets/imgs/slider-icon-step-1.png')} />
                <TouchableOpacity style={[styles.buttonNext]} onPress={() => this.setState({ ONBOARDING_STATE: ONBOARDING_STATES.ONBOARDING_2 })}>
                  <Text style={[styles.buttonText, { color: '#FF003C' }]}>NEXT</Text>
                </TouchableOpacity>
              </View>
            </View>
          }

          {/*ONBOARDING SCREEN 2*/}
          {(this.state.ONBOARDING_STATE == ONBOARDING_STATES.ONBOARDING_2) &&
            <View style={styles.bodyContent}>
              {/*TOP AREA*/}
              <View style={[styles.topArea]}>
                <Text style={[styles.title]}>BITMARK HEALTH</Text>
                <Image style={styles.logo} source={require('assets/imgs/bitmark-health-icon.png')} />
              </View>

              {/*CONTENT*/}
              <View style={styles.contentArea}>
                {/*IMAGE*/}
                <View style={styles.introductionImageArea}>
                  <Image style={styles.onBoardingImage2} source={require('assets/imgs/onboarding_2.png')} />
                </View>
                {/*DESC*/}
                <View style={styles.introductionTextArea}>
                  <Text style={[styles.introductionTitle]}>Create your health vault</Text>
                  <Text style={[styles.introductionDescription]}>
                    Your unique health vault locks data away from unauthorized 3rd-party access.
                </Text>

                  {/*Terms and Privacy Policy */}
                  <Hyperlink style={[styles.introductionDescription, styles.hyperLinkText]} linkText={url => url === 'https://bitmark.com/legal/terms' ? 'Terms' : 'Privacy Policy'} onPress={(url) => Linking.openURL(url)}>
                    <Text style={[styles.introductionDescription, styles.hyperLinkText, { marginTop: 0 }]}>
                      By creating a vault, you agree to our <Text style={[{ textDecorationLine: 'underline' }, styles.hyperLinkText]}>https://bitmark.com/legal/terms</Text> and <Text style={[{ textDecorationLine: 'underline' }, styles.hyperLinkText]}>https://bitmark.com/legal/privacy.</Text>
                    </Text>
                  </Hyperlink>
                </View>
              </View>

              {/*BOTTOM AREA*/}
              <View style={[styles.bottomArea]}>
                <Image style={styles.sliderIcon} source={require('assets/imgs/slider-icon-step-2.png')} />

                {/*Login link*/}
                <TouchableOpacity style={[styles.buttonNext, { marginBottom: 2 }]} onPress={Actions.login}>
                  <Text style={[styles.linkButtonText]}>Already have a vault?</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.buttonNext]} onPress={() => Actions.generateHealthCode()}>
                  <Text style={[styles.buttonText, { color: '#FF003C' }]}>NEXT</Text>
                </TouchableOpacity>
              </View>
            </View>
          }
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
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
  },
  bottomArea: {
    height: 90,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: 16,
  },
  title: {
    fontFamily: 'AvenirNextW1G-Light',
    fontSize: 10,
    color: 'rgba(0, 0, 0, 0.87)'
  },
  logo: {
    width: 23,
    height: 23,
    resizeMode: 'contain',
  },
  sliderIcon: {
    width: 56,
    height: 8,
    resizeMode: 'contain',
    marginBottom: 4,
  },
  onBoardingImage1: {
    resizeMode: 'contain',
    width: config.isIPhoneX ? convertWidth(250) : convertWidth(206),
    height: config.isIPhoneX ? (385 * convertWidth(250) / 250) : (318 * convertWidth(206) / 206),
  },
  onBoardingImage2: {
    resizeMode: 'contain',
    width: convertWidth(241),
    height: 323 * convertWidth(241) / 241,
  },
  introductionImageArea: {

  },
  introductionTextArea: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: '100%',
  },
  introductionTitle: {
    marginTop: 25,
    fontFamily: 'AvenirNextW1G-Bold',
    color: 'rgba(0, 0, 0, 0.87)',
    fontSize: 24,
    textAlign: 'left',
  },
  introductionDescription: {
    marginTop: 15,
    fontFamily: 'AvenirNextW1G-Regular',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(0, 0, 0, 0.6)',
    textAlign: 'left',
  },
  hyperLinkText: {
    fontFamily: 'AvenirNextW1G-LightItalic',
    color: 'rgba(0, 0, 0, 0.6)',
  },
  buttonNext: {
    fontFamily: 'AvenirNextW1G-Bold',
    fontSize: 16,
    color: '#FF003C',
  },
  buttonText: {
    fontFamily: 'AvenirNextW1G-Bold',
    fontSize: 16,
  },
  linkButtonText: {
    fontFamily: 'AvenirNextW1G-Regular',
    fontSize: 16,
    color: '#0060F2',
    textDecorationLine: 'underline'
  },
});

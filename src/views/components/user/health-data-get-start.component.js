import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, Image, TouchableOpacity, SafeAreaView,
  StyleSheet,
} from 'react-native'

import { Actions } from 'react-native-router-flux';
import { EventEmitterService, AppProcessor } from 'src/processors';
import { convertWidth } from 'src/utils';

const ONBOARDING_STATES = {
  ONBOARDING_1: 'ONBOARDING_1',
  ONBOARDING_2: 'ONBOARDING_2',
  ONBOARDING_3: 'ONBOARDING_3'
};


export class HealthDataGetStartComponent extends React.Component {
  static propTypes = {
    resetToInitialState: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.state = {
      ONBOARDING_STATE: ONBOARDING_STATES.ONBOARDING_1
    }
  }

  requestHealthKitPermission() {
    EventEmitterService.emit(EventEmitterService.events.APP_PROCESSING, true);
    AppProcessor.doRequireHealthKitPermission().then(() => {
      this.setState({ ONBOARDING_STATE: ONBOARDING_STATES.ONBOARDING_3 });
    }).then(() => {
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESSING, false);
    }).catch(error => {
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
      console.log('doRequireHealthKitPermission error :', error);
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESSING, false);
    });
  }

  goBack() {
    this.props.resetToInitialState && this.props.resetToInitialState();
    Actions.pop();
  }

  render() {
    return (
      <SafeAreaView style={styles.safeAreaView}>
        <View style={styles.body}>
          {/*ONBOARDING SCREEN 1*/}
          {(this.state.ONBOARDING_STATE == ONBOARDING_STATES.ONBOARDING_1) &&
            <View style={{ flex: 1 }}>
              {/*TOP BAR*/}
              <View style={styles.topBar}>
                {/*Back Icon*/}
                <TouchableOpacity style={styles.closeButton} onPress={() => { Actions.pop() }}>
                  <Image style={styles.closeIcon} source={require('assets/imgs/back-icon-black.png')} />
                </TouchableOpacity>
              </View>

              {/*CONTENT*/}
              <View style={styles.bodyContent}>
                {/*TOP AREA*/}
                <View style={[styles.topArea, styles.paddingContent]}>
                  <Text style={[styles.title]}>LEARN ABOUT YOUR HEALTH</Text>
                  <Image style={styles.logo} source={require('assets/imgs/bitmark-health-icon.png')} />
                </View>

                {/*CONTENT*/}
                <View style={[styles.contentArea, styles.paddingContent, { justifyContent: 'flex-start' }]}>
                  {/*DESC*/}
                  <View style={styles.introductionTextArea}>
                    <Text style={[styles.introductionTitle, { marginTop: 50, fontSize: 14 }]}>Why should I care?</Text>
                    <Text style={[styles.introductionDescription, { marginTop: 25 }]}>
                      Personal health data is becoming a key component of the modern healthcare ecosystem, including medical research, ongoing care,
                    prediction and prevention.{'\n'}{'\n'}
                      Protecting all your health data in one place gives you a comprehensive view of your health, which translates into better healthcare
                    and outcomes.{'\n'}{'\n'}
                      Bitmark Health is the first step towards controlling your health by unlocking the value of your health data.
                  </Text>
                  </View>
                </View>

                {/*BOTTOM AREA*/}
                <View style={[styles.bottomArea, styles.paddingContent]}>
                  <TouchableOpacity style={[styles.buttonNext]} onPress={() => this.setState({ ONBOARDING_STATE: ONBOARDING_STATES.ONBOARDING_2 })}>
                    <Text style={[styles.buttonText, { color: '#FF003C' }]}>NEXT</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          }

          {/*ONBOARDING SCREEN 2*/}
          {(this.state.ONBOARDING_STATE == ONBOARDING_STATES.ONBOARDING_2) &&
            <View style={{ flex: 1 }}>
              {/*TOP BAR*/}
              <View style={styles.topBar}>
                {/*Back Icon*/}
                <TouchableOpacity style={styles.closeButton} onPress={() => this.setState({ ONBOARDING_STATE: ONBOARDING_STATES.ONBOARDING_1 })}>
                  <Image style={styles.closeIcon} source={require('assets/imgs/back-icon-black.png')} />
                </TouchableOpacity>
              </View>

              <View style={styles.bodyContent}>
                {/*TOP AREA*/}
                <View style={[styles.topArea, styles.paddingContent]}>
                  <Text style={[styles.title]}>LEARN ABOUT YOUR HEALTH</Text>
                  <Image style={styles.logo} source={require('assets/imgs/bitmark-health-icon.png')} />
                </View>

                {/*CONTENT*/}
                <View style={[styles.contentArea]}>
                  {/*IMAGE*/}
                  <View style={[styles.introductionImageArea, { alignItems: 'flex-end', justifyContent: 'center', width: '100%', flex: 1 }]}>
                    <Image style={styles.onBoardingImage2} source={require('assets/imgs/health-data-onboarding-1.png')} />
                  </View>

                  {/*DESC*/}
                  <View style={[styles.introductionTextArea, styles.paddingContent]}>
                    <Text style={[styles.introductionTitle]}>Learn about your health</Text>
                    <Text style={[styles.introductionDescription, { fontSize: 16 }]}>
                      We’ll start by looking at two common categories of health data: daily steps and daily sleep. Please allow access to these to start learning about your health.
                  </Text>
                  </View>
                </View>

                {/*BOTTOM AREA*/}
                <View style={[styles.bottomArea, styles.paddingContent]}>
                  <TouchableOpacity style={[styles.buttonNext]} onPress={this.requestHealthKitPermission.bind(this)}>
                    <Text style={[styles.buttonText, { color: '#FF003C' }]}>ALLOW ACCESS</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          }

          {/*ONBOARDING SCREEN 3*/}
          {(this.state.ONBOARDING_STATE == ONBOARDING_STATES.ONBOARDING_3) &&
            <View style={{ flex: 1 }}>
              <View style={styles.bodyContent}>
                {/*TOP AREA*/}
                <View style={[styles.topArea, styles.paddingContent]}>
                  <Text style={[styles.title]}>LEARN ABOUT YOUR HEALTH</Text>
                  <Image style={styles.logo} source={require('assets/imgs/bitmark-health-icon.png')} />
                </View>

                {/*CONTENT*/}
                <View style={[styles.contentArea]}>
                  {/*IMAGE*/}
                  <View style={[styles.introductionImageArea, { alignItems: 'flex-end', justifyContent: 'center', width: '100%', flex: 1 }]}>
                    <Image style={styles.onBoardingImage2} source={require('assets/imgs/health-data-onboarding-1.png')} />
                  </View>

                  {/*DESC*/}
                  <View style={[styles.introductionTextArea, styles.paddingContent]}>
                    <Text style={[styles.introductionTitle]}>You’re all set!</Text>
                    <Text style={[styles.introductionDescription, { fontSize: 16 }]}>
                      Your first day of health data will be waiting for you to sign and view tomorrow morning.
                  </Text>
                  </View>
                </View>

                {/*BOTTOM AREA*/}
                <View style={[styles.bottomArea, styles.paddingContent]}>
                  <TouchableOpacity style={[styles.buttonNext]} onPress={this.goBack.bind(this)}>
                    <Text style={[styles.buttonText, { color: '#FF003C' }]}>DONE</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          }
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: 'white',
  },
  body: {
    flex: 1,
    backgroundColor: 'white',
    padding: convertWidth(16),
    paddingTop: 0,
  },

  bodyContent: {
    flex: 1,
    backgroundColor: '#F4F2EE',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  paddingContent: {
    paddingLeft: convertWidth(16),
    paddingRight: convertWidth(16),
  },
  topArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderWidth: 1,
    borderColor: '#F5F5F5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  contentArea: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
  },
  bottomArea: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    paddingBottom: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    width: '100%',
    marginBottom: 12,
  },
  closeButton: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    width: convertWidth(16),
    height: convertWidth(16),
    resizeMode: 'contain',
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
  buttonNext: {
    fontFamily: 'AvenirNextW1G-Bold',
    fontSize: 16,
    color: '#FF003C',
  },
  buttonText: {
    fontFamily: 'AvenirNextW1G-Bold',
    fontSize: 16,
  },
  onBoardingImage2: {
    resizeMode: 'contain',
    width: convertWidth(320),
    height: 300 * convertWidth(320) / 320,
  },
});
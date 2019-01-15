import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View, TouchableOpacity, Text, SafeAreaView, Image
} from 'react-native';


import { Actions } from 'react-native-router-flux';
import { AppProcessor, EventEmitterService, DataProcessor } from 'src/processors';
import { convertWidth } from 'src/utils';

export class BitmarkHealthDataComponent extends Component {
  static propTypes = {
    list: PropTypes.array,
  };

  constructor(props) {
    super(props);
  }

  goBack() {
    Actions.popTo('user');
  }

  issueDailyHealthData() {
    AppProcessor.doBitmarkHealthData(this.props.list, {
      indicator: true, title: i18n.t('BitmarkHealthDataComponent_alertTitle'), message: ''
    }).then(results => {
      if (results) {
        console.log('daily-health-data-results:', results);
        DataProcessor.doGetUserDataBitmarks().then(userBitmarks => {
          Actions.dailyHealthDataFullCard({ dailyHealthDataBitmarks: userBitmarks.dailyHealthDataBitmarks, goBack: this.goBack.bind(this) });
        });
      }
    }).catch(error => {
      console.log('doDailyBitmarkHealthData error:', error);
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
    });
  }

  render() {
    return (
      <SafeAreaView style={styles.safeAreaView}>
        <View style={styles.body}>
          <View style={{flex: 1}}>
            {/*TOP BAR*/}
            <View style={styles.topBar}>
              {/*Back Icon*/}
              <TouchableOpacity style={styles.closeButton} onPress={Actions.pop}>
                <Image style={styles.closeIcon} source={require('assets/imgs/back-icon-black.png')} />
              </TouchableOpacity>
            </View>

            <View style={styles.bodyContent}>
              {/*TOP AREA*/}
              <View style={[styles.topArea, styles.paddingContent]}>
                <Text style={[styles.title]}>SIGN FOR YOUR DAILY DATA</Text>
                <Image style={styles.logo} source={require('assets/imgs/bitmark-health-icon.png')}/>
              </View>

              {/*CONTENT*/}
              <View style={[styles.contentArea]}>
                {/*IMAGE*/}
                <View style={[styles.introductionImageArea, { alignItems: 'flex-end', justifyContent: 'center', width: '100%', flex:1 }]}>
                  <Image style={styles.onBoardingImage2} source={require('assets/imgs/health-data-onboarding-1.png')} />
                </View>

                {/*DESC*/}
                <View style={[styles.introductionTextArea, styles.paddingContent]}>
                  <Text style={[styles.introductionTitle]}>Sign for your daily data</Text>
                  <Text style={[styles.introductionDescription, {fontSize: 16}]}>
                    Your daily health data has been collected. Please sign for it, and we’ll prepare it for viewing.
                  </Text>
                </View>
              </View>

              {/*BOTTOM AREA*/}
              <View style={[styles.bottomArea, styles.paddingContent]}>
                <TouchableOpacity style={[styles.buttonNext]} onPress={this.issueDailyHealthData.bind(this)}>
                  <Text style={[styles.buttonText, {color: '#FF003C'}]}>SIGN NOW</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
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
    paddingTop: convertWidth(16),
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
    height: 80,
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
  }
});

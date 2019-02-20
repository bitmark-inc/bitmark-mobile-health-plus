import React, { Component } from 'react';
import {
  StyleSheet,
  View, TouchableOpacity, Text, SafeAreaView,
  Image,
  NativeModules,
  NativeEventEmitter
} from 'react-native';

import { convertWidth } from 'src/utils';
import { ShadowTopComponent } from "src/views/commons";
import { EventEmitterService, DataProcessor } from "src/processors";
import PropTypes from 'prop-types';
import LottieView from 'lottie-react-native';
import { IndexDBService, LocalFileService } from "src/processors/services";
import { AccountModel } from "src/processors/models";
const BitmarkSDKEvents = new NativeEventEmitter(NativeModules.BitmarkSDKWrapper);

const UPGRADE_STATE = {
  UPGRADING: 0,
  UPGRADE_COMPLETED: 1,
  UPGRADE_ERROR: 2,
};

const COMPLETED_PROGRESS_BAR_VALUE = 0.41;
const INIT_PROGRESS_BAR_VALUE = 0.01;

export class UpgradeComponent extends Component {
  static propTypes = {
    twelveWords: PropTypes.any
  };

  constructor(props) {
    super(props);
    this.twelveWords = props.twelveWords;
    console.log('twelveWords:', this.twelveWords);

    this.state = {
      upgradeState: UPGRADE_STATE.UPGRADING,
      progress: INIT_PROGRESS_BAR_VALUE
    }
  }

  async componentDidMount() {
    BitmarkSDKEvents.addListener(
      "onMigrationProgress",
      progress => this.updateProgressBar(progress)
    );
    await this.migrateTo12Words();
  }

  componentWillUnmount() {
    // BitmarkSDKEvents.removeCurrentListener();
  }

  async migrateTo12Words() {
    let success = true;
    this.twentyFourWordsAccountNumber = (await DataProcessor.getAccountInfoForMigration()).bitmarkAccountNumber;
    try {
      let twelveWordsAccountNumber = await AccountModel.migrateFrom24WordsTo12Words(this.twelveWords);
      await this.migrateLocalData(this.twentyFourWordsAccountNumber, twelveWordsAccountNumber);
    } catch (err) {
      success = false;
      this.setState({
        upgradeState: UPGRADE_STATE.UPGRADE_ERROR,
        progress: INIT_PROGRESS_BAR_VALUE
      })
    }

    // If migrate successfully
    if (success) {
      console.log('Migrate successfully!');
      this.setState({
        upgradeState: UPGRADE_STATE.UPGRADE_COMPLETED,
        progress: COMPLETED_PROGRESS_BAR_VALUE
      })
    }
  }

  async resumeMigrationTo12Words() {
    console.log('resumeMigrationTo12Words...');
    this.setState({
      upgradeState: UPGRADE_STATE.UPGRADING,
      progress: INIT_PROGRESS_BAR_VALUE
    });

    let success = true;

    try {
      let twelveWordsAccountNumber = await AccountModel.resumeMigration24WordsTo12Words();
      await this.migrateLocalData(this.twentyFourWordsAccountNumber, twelveWordsAccountNumber);
    } catch (err) {
      console.log('err:', err);
      success = false;
      this.setState({
        upgradeState: UPGRADE_STATE.UPGRADE_ERROR,
        progress: INIT_PROGRESS_BAR_VALUE
      })
    }

    // If Resume Migration successfully
    console.log('success:', success);
    if (success) {
      console.log('Resume Migration successfully!');
      this.setState({
        upgradeState: UPGRADE_STATE.UPGRADE_COMPLETED,
        progress: COMPLETED_PROGRESS_BAR_VALUE
      })
    }
  }

  async migrateLocalData(twentyFourWordsAccountNumber, twelveWordsAccountNumber) {
    await IndexDBService.upgradeDataFrom24Words(twentyFourWordsAccountNumber, twelveWordsAccountNumber);
    await LocalFileService.initializeLocalStorage(twelveWordsAccountNumber);
    await LocalFileService.moveFilesToNewAccount(twentyFourWordsAccountNumber, twelveWordsAccountNumber);
    await DataProcessor.doLogin();
  }

  updateProgressBar(progressResponse) {
    let progress = progressResponse.progress;
    let progressVal = (COMPLETED_PROGRESS_BAR_VALUE - 0.03) * progress;
    this.setState({progress: progressVal});
  }

  reloadApp() {
    EventEmitterService.emit(EventEmitterService.events.APP_NEED_REFRESH, { justCreatedBitmarkAccount: false, indicator: true });
  }

  render() {
    console.log('this.state.progress:', this.state.progress);
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={styles.body}>
          <View style={styles.bodyContent}>
            {/*UPGRADING*/}
            {this.state.upgradeState == UPGRADE_STATE.UPGRADING &&
            <View style={{flex: 1}}>
              {/*TOP AREA*/}
              <ShadowTopComponent style={{ height: 40 }} contentStyle={[styles.topArea, styles.paddingContent]}>
                <Text style={[styles.title]}>UPGRADE IN PROCESS...</Text>
              </ShadowTopComponent>

              {/*CONTENT*/}
              <View style={[styles.contentArea, styles.paddingContent]}>
                {/*Upgrade progress container*/}
                <View style={[styles.progressContainer]}>
                  <Text style={[styles.introductionDescription, {marginTop: 56}]}>Your account is now being upgraded.</Text>
                  <View style={[styles.progressBar]}>
                    <LottieView
                      style={{ width: 400, height: 400 }}
                      ref={animation => {
                        this.animation = animation;
                      }}
                      progress={this.state.progress}
                      loop={false}
                      source={require('assets/animation/progress-bar.json')}
                      autoPlay={false}
                    />
                  </View>
                </View>

                {/*Desc*/}
                <View style={styles.introductionTextArea}>
                  <Text style={[styles.introductionDescription]}>
                    {
                      `Please do not switch to another app during this time.\n\nAfter the upgrade, your existing properties will be updated automatically. No data or information will be lost in the process.`
                    }
                  </Text>
                </View>
              </View>
            </View>
            }

            {/*SUCCESS*/}
            {this.state.upgradeState == UPGRADE_STATE.UPGRADE_COMPLETED &&
            <View style={{flex: 1}}>
              {/*TOP AREA*/}
              <ShadowTopComponent style={{ height: 40 }} contentStyle={[styles.topArea, styles.paddingContent]}>
                <Text style={[styles.title]}>UPGRADE COMPLETE!</Text>
              </ShadowTopComponent>

              {/*CONTENT*/}
              <View style={[styles.contentArea, styles.paddingContent]}>
                {/*Desc*/}
                <View style={styles.introductionTextArea}>
                  <Text style={[styles.introductionDescription, {marginTop: 56}]}>
                    {`Your account upgrade has been finished!`}
                  </Text>

                  {/*Success animation*/}
                  <View style={[styles.animationContainer]}>
                    <LottieView
                      style={{ width: 80, height: 80 }}
                      ref={animation => {
                        this.successAnimation = animation;
                      }}
                      loop={false}
                      source={require('assets/animation/check-mark-success.json')}
                      autoPlay={true}
                    />
                  </View>
                </View>
              </View>

              {/*BOTTOM AREA*/}
              <View style={[styles.bottomArea, styles.paddingContent]}>
                <TouchableOpacity style={[styles.buttonNext]} onPress={() => {this.reloadApp.bind(this)()}}>
                  <Text style={[styles.buttonText, { color: '#FF003C' }]}>VIEW YOUR ACCOUNT</Text>
                </TouchableOpacity>
              </View>
            </View>
            }

            {/*ERROR*/}
            {this.state.upgradeState == UPGRADE_STATE.UPGRADE_ERROR &&
            <View style={{flex: 1}}>
              {/*TOP AREA*/}
              <ShadowTopComponent style={{ height: 40 }} contentStyle={[styles.topArea, styles.paddingContent, {backgroundColor: '#FF003C'}]}>
                <Text style={[styles.title]}>WE’RE SORRY!</Text>
              </ShadowTopComponent>

              {/*CONTENT*/}
              <View style={[styles.contentArea, styles.paddingContent]}>
                {/*Desc*/}
                <View style={styles.introductionTextArea}>
                  <Text style={[styles.introductionDescription, {marginTop: 56}]}>
                    {
                      `It looks like something went wrong during migration, but no data was lost. Please tap below to try again.\n\nRemember: the process takes about 5 minutes and please do not leave the app while the migration is running. You also need internet access during this time.`
                    }
                  </Text>
                </View>

                <View style={[styles.imageContainer]}>
                  <Image style={[styles.retryIcon]} source={require('assets/imgs/retry-icon.png')}></Image>
                </View>
              </View>

              {/*BOTTOM AREA*/}
              <View style={[styles.bottomArea, styles.paddingContent]}>
                <TouchableOpacity style={[styles.buttonNext]} onPress={() => {this.resumeMigrationTo12Words.bind(this)()}}>
                  <Text style={[styles.buttonText, { color: '#FF003C' }]}>TRY AGAIN</Text>
                </TouchableOpacity>
              </View>
            </View>
            }
          </View>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  paddingContent: {
    paddingLeft: convertWidth(16),
    paddingRight: convertWidth(16)
  },

  topArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
    backgroundColor: '#0060F2',
  },
  contentArea: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  bottomArea: {
    height: 90,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    paddingBottom: 16,
  },
  title: {
    fontFamily: 'AvenirNextW1G-Bold',
    fontSize: 10,
    letterSpacing: 1.5,
    color: '#FFFFFF'
  },
  introductionTextArea: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: '100%',
  },
  introductionDescription: {
    fontFamily: 'AvenirNextW1G-Regular',
    fontSize: 17,
    lineHeight: 20,
    color: 'rgba(0, 0, 0, 0.6)',
    textAlign: 'left',
    letterSpacing: 0.25,
  },
  buttonNext: {
    fontFamily: 'AvenirNextW1G-Bold',
    fontSize: 16,
    color: '#FF003C',
  },
  buttonText: {
    fontFamily: 'AvenirNextW1G-Bold',
    fontSize: 16,
    letterSpacing: 0.75,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  progressBar: {
    marginTop: -120,
    height: 280,
    alignItems: 'center',
    width: '100%'
  },
  animationContainer: {
    marginTop: 50,
    width: '100%',
    alignItems: 'center'
  },
  imageContainer: {
    marginTop: 25,
    alignItems: 'center',
    width: '100%',
  },
  retryIcon: {
    height: 96,
    width: 96,
    resizeMode: 'contain'
  }
});

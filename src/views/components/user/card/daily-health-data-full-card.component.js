import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, Image, SafeAreaView, TouchableOpacity, StyleSheet, ScrollView
} from 'react-native'

import moment from "moment";
import { styles as cardStyles } from './bitmark-card.style.component';
import { styles as dailyHealthCardStyles } from './daily-health-data-card.style.component';
import { DailyHealthDataUtil, convertWidth } from "src/utils";
import { CirclePercentComponent, StepsChartComponent, SleepChartComponent } from "src/views/commons";
import { Actions } from "react-native-router-flux";
import { HealthKitService } from "src/processors/services";
import { AppProcessor, EventEmitterService, CacheData } from "src/processors";
import { searchAgain } from "src/views/controllers";
import { config } from "src/configs";
import ReactNative from "react-native";
let { ActionSheetIOS } = ReactNative;

export class DailyHealthDataFullCardComponent extends React.Component {
  static propTypes = {
    dailyHealthDataBitmarks: PropTypes.array,
    resetToInitialState: PropTypes.func,
    goBack: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {};
    this.lastBitmark = this.props.dailyHealthDataBitmarks[0];
  }

  async componentDidMount() {
    this.populateDataForVisualization();

    await this.getOtherData();
  }

  async getOtherData() {
    let otherData = await HealthKitService.doGetOtherAllowedHKPermissionLabels();
    let isAbleToDisplayAppleHealthPermissionForm = await HealthKitService.isAbleToDisplayAppleHealthPermissionForm();

    this.setState({ otherData, isAbleToDisplayAppleHealthPermissionForm });
  }

  async requestOtherHealthPermissions() {
    await HealthKitService.initHealthKit(true);
    await AppProcessor.processing(this.getOtherData());
  }

  async populateDataForVisualization() {
    let dailyHealthDataBitmarks = this.props.dailyHealthDataBitmarks;

    let { stepsPercent, sleepPercent, yesterdayDataSteps, yesterdayDataSleepTimeInMinutes } = await DailyHealthDataUtil.populateDataForStepsAndSleepPercents(dailyHealthDataBitmarks);

    let last7DaysData = await DailyHealthDataUtil.populateDataForCharts(dailyHealthDataBitmarks);

    let stepsChartData = await DailyHealthDataUtil.populateDataForStepsChart(last7DaysData);

    let sleepChartData = await DailyHealthDataUtil.populateDataForSleepChart(last7DaysData);

    let { averageSteps, yesterdayCompareToAverageSteps } = DailyHealthDataUtil.populateStepsAverage(last7DaysData, stepsChartData);

    let { averageSleep, yesterdayCompareToAverageSleep } = DailyHealthDataUtil.populateSleepAverage(last7DaysData, sleepChartData);

    this.setState({
      stepsPercent,
      sleepPercent,
      yesterdayDataSteps,
      yesterdayDataSleepTimeInMinutes,
      stepsChartData,
      sleepChartData,
      averageSteps,
      yesterdayCompareToAverageSteps,
      averageSleep,
      yesterdayCompareToAverageSleep
    });
  }

  deleteBitmark(bitmark) {
    ActionSheetIOS.showActionSheetWithOptions({
      title: `This health data will be deleted`,
      options: [i18n.t('BitmarkDetailComponent_cancelButtonDeleteModal'), i18n.t('BitmarkDetailComponent_deleteButtonDeleteModal')],
      destructiveButtonIndex: 1,
      cancelButtonIndex: 0,
    },
      (buttonIndex) => {
        if (buttonIndex === 1) {
          AppProcessor.doTransferBitmark(bitmark, config.zeroAddress).then(async () => {
            await searchAgain();
            this.props.resetToInitialState && this.props.resetToInitialState();
            Actions.pop();
          }).catch(error => {
            console.log('DailyHealthDataFullCardComponent doTransferBitmark error:', error);
            EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
          })
        }
      });
  }

  render() {
    let lastBitmark = this.lastBitmark;

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <View style={[styles.body]}>
          <View style={[styles.topBar]}>
            {/*Back button*/}
            <TouchableOpacity style={{ paddingLeft: convertWidth(16) }} onPress={this.props.goBack || Actions.pop}>
              <Image style={styles.backIcon} source={require('assets/imgs/back-icon-black.png')} />
            </TouchableOpacity>

            {/*EMR Icon*/}
            <TouchableOpacity style={{ paddingRight: convertWidth(16) }} onPress={() => { Actions.account() }}>
              <Image style={styles.profileIcon} source={(CacheData.userInformation.currentEMRData && CacheData.userInformation.currentEMRData.avatar) ? {
                uri: CacheData.userInformation.currentEMRData.avatar
              } : require('assets/imgs/profile-icon.png')} />
            </TouchableOpacity>
          </View>
          <View style={[styles.bodyContent]}>
            {/*TOP BAR*/}

            {/*CARD*/}
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 8 }}>
              <View style={[styles.shadowBox, cardStyles.cardContainer, { borderRadius: 10 }]}>
                {/*CARD TOP BAR*/}
                <View style={[cardStyles.cardTopBar, { backgroundColor: '#FFFFFF' }]}>
                  <Text style={[cardStyles.cardTitle]}>HEALTH DATA</Text>
                </View>

                {/*VISUALIZATION*/}
                {/*Steps and Sleep Percent*/}
                <View style={[dailyHealthCardStyles.visualization]}>
                  {/*STEPS*/}
                  {this.state.stepsPercent != undefined ? (
                    <CirclePercentComponent percent={Math.abs(this.state.stepsPercent)} radius={52} value={this.state.yesterdayDataSteps} bottomText={'GOAL = 10k'} imageSource={require('assets/imgs/steps.png')} imageStyle={dailyHealthCardStyles.stepsImageStyle} />
                  ) : (
                      <View>
                        <Text style={[dailyHealthCardStyles.missingDayText]}>DAY MISSED</Text>
                        <Image style={[dailyHealthCardStyles.missingDayIcon]} source={require('assets/imgs/missing-day-steps.png')} />
                      </View>
                    )
                  }

                  {/*SLEEP*/}
                  {this.state.sleepPercent != undefined ? (
                    <CirclePercentComponent style={{ marginLeft: 25 }} percent={Math.abs(this.state.sleepPercent)} radius={52} value={this.state.yesterdayDataSleepTimeInMinutes} bottomText={'GOAL = 8h'} imageSource={require('assets/imgs/sleep.png')} imageStyle={dailyHealthCardStyles.sleepImageStyle} />
                  ) : (
                      <View style={{ marginLeft: 25 }}>
                        <Text style={[dailyHealthCardStyles.missingDayText]}>DAY MISSED</Text>
                        <Image style={[dailyHealthCardStyles.missingDayIcon]} source={require('assets/imgs/missing-day-sleep.png')} />
                      </View>
                    )
                  }
                </View>

                {/*CONTENT*/}
                <View style={[cardStyles.cardContent]}>
                  {/*Header*/}
                  <Text style={[cardStyles.cardHeader]}>Track your daily activity</Text>
                  {/*Status*/}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    {lastBitmark &&
                      <Text style={[cardStyles.cardText]}>{'RECORDED ON ' + moment(lastBitmark.asset.metadata['Collection Date']).add(1, 'minute').format('YYYY MMM DD').toUpperCase()}</Text>
                    }
                  </View>

                  {/*STEPS CHART*/}
                  <View style={[dailyHealthCardStyles.stepsContainer]}>
                    <View style={[dailyHealthCardStyles.stepsHeaderContainer]}>
                      <Image style={[dailyHealthCardStyles.stepsIcon]} source={require('assets/imgs/steps.png')} />
                      <Text style={[dailyHealthCardStyles.stepsHeaderText]}>STEPS</Text>
                      {/*Average Text*/}
                      {this.state.averageSteps != undefined &&
                        <View style={[dailyHealthCardStyles.stepsAverageContainer]}>
                          <Text style={[dailyHealthCardStyles.averageText]}>AVERAGE = </Text>
                          <Text style={[dailyHealthCardStyles.averageNumber]}>{this.state.averageSteps}</Text>
                          {this.state.yesterdayCompareToAverageSteps != undefined &&
                            <Text style={[dailyHealthCardStyles.averageText, { color: this.state.yesterdayCompareToAverageSteps >= 0 ? '#5FD855' : '#FF003C' }]}> ({(this.state.yesterdayCompareToAverageSteps >= 0 ? '+' : '-') + Math.abs(this.state.yesterdayCompareToAverageSteps)}%)</Text>
                          }
                        </View>
                      }
                    </View>
                    {this.state.stepsChartData &&
                      <StepsChartComponent dataSource={this.state.stepsChartData} height={200} />
                    }
                  </View>

                  {/*SLEEP CHART*/}
                  <View style={[dailyHealthCardStyles.stepsContainer, { marginTop: 16 }]}>
                    <View style={[dailyHealthCardStyles.stepsHeaderContainer, { flexDirection: 'column' }]}>
                      <Text style={[dailyHealthCardStyles.stepsHeaderText]}>SLEEP</Text>
                      <Image style={[dailyHealthCardStyles.sleepIcon]} source={require('assets/imgs/sleep.png')} />
                      {/*Average Text*/}
                      {this.state.averageSleep != undefined &&
                        <View style={[dailyHealthCardStyles.stepsAverageContainer, { top: 0 }]}>
                          <Text style={[dailyHealthCardStyles.averageText]}>AVERAGE = </Text>
                          <Text style={[dailyHealthCardStyles.averageNumber]}>{this.state.averageSleep}</Text>
                          {this.state.yesterdayCompareToAverageSleep != undefined &&
                            <Text style={[dailyHealthCardStyles.averageText, { color: this.state.yesterdayCompareToAverageSleep >= 0 ? '#5FD855' : '#FF003C' }]}> ({(this.state.yesterdayCompareToAverageSleep >= 0 ? '+' : '-') + Math.abs(this.state.yesterdayCompareToAverageSleep)}%)</Text>
                          }
                        </View>
                      }
                    </View>
                    {this.state.sleepChartData &&
                      <SleepChartComponent dataSource={this.state.sleepChartData} height={140} />
                    }
                  </View>

                  {/*OTHER DATA*/}
                  <View>
                    <Text style={[styles.otherDataHeader]}>OTHER DATA</Text>
                    {this.state.otherData &&
                      <View style={[styles.otherDataContainer]}>
                        <Text style={[styles.otherDataText]}>{this.state.otherData.join(', ').toUpperCase()}</Text>
                      </View>
                    }

                    {/*Show AppleKit Permission forms*/}
                    {this.state.isAbleToDisplayAppleHealthPermissionForm &&
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                        <Image style={styles.infoIcon} source={require('assets/imgs/info-icon.png')} />
                        <TouchableOpacity onPress={() => this.requestOtherHealthPermissions.bind(this)()}>
                          <Text style={[styles.linkButtonText]}>Add more data from Apple Health</Text>
                        </TouchableOpacity>
                      </View>
                    }
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  bodyContent: {
    flex: 1,
    flexDirection: 'column',
    width: "100%",
    padding: convertWidth(16),
    paddingTop: convertWidth(10),
  },
  shadowBox: {
    borderColor: '#F5F5F5',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
  },
  topBar: {
    height: 56,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backIcon: {
    width: 14,
    height: 16,
    resizeMode: 'contain'
  },
  profileIcon: {
    width: 32,
    height: 32,
    resizeMode: 'cover',
    borderWidth: 0.1, borderRadius: 16, borderColor: 'white',
  },
  otherDataHeader: {
    marginTop: 20,
    fontFamily: 'AvenirNextW1G-Light',
    fontSize: 10,
    color: 'rgba(0, 0, 0, 0.87)',
    letterSpacing: 1.5
  },
  otherDataContainer: {
    marginTop: 10,
    flexWrap: 'wrap',
  },
  otherDataText: {
    fontFamily: 'Andale Mono',
    fontSize: 10,
    lineHeight: 16,
    color: 'rgba(0, 0, 0, 0.6)',
    letterSpacing: 0.25
  },
  linkButtonText: {
    marginLeft: 10,
    fontFamily: 'AvenirNextW1G-Regular',
    fontSize: 12,
    color: '#0060F2',
    textDecorationLine: 'underline',
    letterSpacing: 0.25,
  },
  infoIcon: {
    marginLeft: 3,
    width: 20,
    height: 20,
    resizeMode: 'contain'
  }

});
import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, Image
} from 'react-native'

import moment from "moment";
import { styles as cardStyles } from './bitmark-card.style.component';
import { styles as dailyHealthCardStyles } from './daily-health-data-card.style.component';
import { DailyHealthDataUtil } from "src/utils";
import { CirclePercentComponent } from "src/views/commons";

export class DailyHealthDataCardComponent extends React.Component {
  static propTypes = {
    dailyHealthDataBitmarks: PropTypes.array,
  };

  constructor(props) {
    super(props);
    this.state = {};
    this.lastBitmark = this.props.dailyHealthDataBitmarks[0];
  }

  async componentDidMount() {
    this.populateDataForVisualization();
  }

  async populateDataForVisualization() {
    let dailyHealthDataBitmarks = this.props.dailyHealthDataBitmarks;

    let {stepsPercent, sleepPercent, yesterdayDataSteps, yesterdayDataSleepTimeInMinutes} = await DailyHealthDataUtil.populateDataForStepsAndSleepPercents(dailyHealthDataBitmarks);

    this.setState({stepsPercent, sleepPercent, yesterdayDataSteps, yesterdayDataSleepTimeInMinutes});
  }

  render() {
    let lastBitmark = this.lastBitmark;

    return (
      <View style={[cardStyles.cardContainer]}>
        {/*TOP BAR*/}
        <View style={[cardStyles.cardTopBar, {backgroundColor: '#FFFFFF'}]}>
          <Text style={[cardStyles.cardTitle]}>HEALTH DATA</Text>
          <Image style={cardStyles.cardIcon} source={require('assets/imgs/health-data-card-icon.png')} />
        </View>

        {/*VISUALIZATION*/}
        {/*Steps and Sleep Percent*/}
        <View style={[dailyHealthCardStyles.visualization]}>
          {this.state.stepsPercent != undefined ? (
            <CirclePercentComponent percent={Math.abs(this.state.stepsPercent)} radius={52} value={this.state.yesterdayDataSteps} bottomText={'GOAL = 10k'} imageSource={require('assets/imgs/steps.png')} imageStyle={dailyHealthCardStyles.stepsImageStyle}/>
          ) : (
            <View>
              <Text style={[dailyHealthCardStyles.missingDayText]}>DAY MISSED</Text>
              <Image style={[dailyHealthCardStyles.missingDayIcon]} source={require('assets/imgs/missing-day-steps.png')}/>
            </View>
          )
          }

          {this.state.sleepPercent != undefined ? (
            <CirclePercentComponent style={{marginLeft: 25}} percent={Math.abs(this.state.sleepPercent)} radius={52} value={this.state.yesterdayDataSleepTimeInMinutes} bottomText={'GOAL = 8h'} imageSource={require('assets/imgs/sleep.png')} imageStyle={dailyHealthCardStyles.sleepImageStyle}/>
          ) : (
            <View style={{marginLeft: 25}}>
              <Text style={[dailyHealthCardStyles.missingDayText]}>DAY MISSED</Text>
              <Image style={[dailyHealthCardStyles.missingDayIcon]} source={require('assets/imgs/missing-day-sleep.png')}/>
            </View>
          )
          }
        </View>

        {/*CONTENT*/}
        <View style={[cardStyles.cardContent]}>
          {/*Header*/}
          <Text style={[cardStyles.cardHeader]}>Track your daily activity</Text>
          {/*Status*/}
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            {lastBitmark &&
            <Text style={[cardStyles.cardText]}>{'RECORDED ON ' + moment(lastBitmark.asset.metadata['Collection Date']).add(1, 'day').format('MMM DD, YYYY').toUpperCase()}</Text>
            }
          </View>
        </View>
      </View>
    );
  }
}
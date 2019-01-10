import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, Image
} from 'react-native'

import moment from "moment";
import { styles as cardStyles } from './bitmark-card.style.component';
import { styles as dailyHealthCardStyles } from './daily-health-data-card.style.component';
import { FileUtil, humanFileSize, DailyHealthDataUtil } from "src/utils";
import { CirclePercentComponent } from "src/views/commons";

export class DailyHealthDataCardComponent extends React.Component {
  static propTypes = {
    dailyHealthDataBitmarks: PropTypes.array,
  };

  constructor(props) {
    super(props);
    this.state = {};
    this.yesterdayBitmark = DailyHealthDataUtil.getYesterdayDailyHealthBitmark(this.props.dailyHealthDataBitmarks);
  }

  async componentDidMount() {
    if (this.yesterdayBitmark) {
      let fileStat = await FileUtil.stat(this.yesterdayBitmark.asset.filePath);
      this.setState({fileSize: humanFileSize(fileStat.size)});
    }

    this.populateDataForVisualization();
  }

  async populateDataForVisualization() {
    let dailyHealthDataBitmarks = this.props.dailyHealthDataBitmarks;

    let {stepsPercent, sleepPercent} = await DailyHealthDataUtil.populateDataForStepsAndSleepPercents(dailyHealthDataBitmarks);

    this.setState({stepsPercent, sleepPercent});
  }

  render() {
    let bitmark = this.yesterdayBitmark;

    return (
      <View style={[cardStyles.cardContainer]}>
        {/*TOP BAR*/}
        <View style={[cardStyles.cardTopBar, {backgroundColor: '#FFFFFF'}]}>
          <Text style={[cardStyles.cardTitle]}>HEALTH KIT DATA</Text>
          <Image style={cardStyles.cardIcon} source={require('assets/imgs/health-data-card-icon.png')} />
        </View>

        {/*VISUALIZATION*/}
        {/*Steps and Sleep Percent*/}
        <View style={[dailyHealthCardStyles.visualization]}>
          {this.state.stepsPercent != undefined ? (
            <CirclePercentComponent percent={Math.abs(this.state.stepsPercent)} radius={52} negative={this.state.stepsPercent < 0} imageSource={require('assets/imgs/steps.png')} imageStyle={dailyHealthCardStyles.stepsImageStyle}/>
          ) : (
            <View>
              <Text style={[dailyHealthCardStyles.missingDayText]}>DAY MISSED</Text>
              <Image style={[dailyHealthCardStyles.missingDayIcon]} source={require('assets/imgs/missing-day-steps.png')}/>
            </View>
          )
          }

          {this.state.sleepPercent != undefined ? (
            <CirclePercentComponent style={{marginLeft: 25}} percent={Math.abs(this.state.sleepPercent)} radius={52} negative={this.state.sleepPercent < 0} imageSource={require('assets/imgs/sleep.png')} imageStyle={dailyHealthCardStyles.sleepImageStyle}/>
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
          <Text style={[cardStyles.cardHeader]}>Learn about your health</Text>
          {/*Status*/}
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            {bitmark &&
            <Text style={[cardStyles.cardText]}>{bitmark.asset.created_at ? ('RECORDED ON ' + moment(bitmark.asset.created_at).format('YYYY MMM DD').toUpperCase()) : 'REGISTERING...'}</Text>
            }
            {this.state.fileSize &&
            <Text style={[cardStyles.cardText]}>{this.state.fileSize}</Text>
            }
          </View>

          {/*REF*/}
          {bitmark &&
          <View style={{flexDirection: 'row'}}>
            <View style={{flex: 1}}></View>
            <View style={[dailyHealthCardStyles.assetNameContainer]}>
              <Text style={[dailyHealthCardStyles.assetName]}>REF: {bitmark.asset.name}</Text>
            </View>
          </View>
          }
        </View>
      </View>
    );
  }
}
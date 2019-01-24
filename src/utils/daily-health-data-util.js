import moment from "moment";
import { FileUtil } from "./index";

const STEPS_GOAL = 10000; // steps
const SLEEP_IN_MINUTES_GOAL = 8 * 60; // minutes

class DailyHealthDataUtil {
  static async readDailyHealthData(bitmark) {
    try {
      let result = await FileUtil.readFile(bitmark.asset.viewFilePath);
      return JSON.parse(result);
    } catch {
      return null;
    }
  }

  static getDailyStepsFromData(dailyData) {
    let steps = undefined;
    if (dailyData.StepCount) {
      steps = 0;
      dailyData.StepCount.forEach(item => {
        steps += parseInt(item.value);
      })
    }

    return steps;
  }

  static getDailySleepFromData(dailyData) {
    let sleep = undefined;
    if (dailyData.SleepAnalysis) {
      dailyData.SleepAnalysis.forEach(item => {
        if (item.value == 'INBED' && item.startDate && item.endDate && moment(item.endDate).diff(moment(item.startDate), 'minutes') > 0) {
          sleep = {
            startDate: item.startDate,
            endDate: item.endDate
          }
        }
      })
    }

    return sleep;
  }

  static getRelativePercent(number1, number2) {
    return Math.round((number1 - number2) * 100 / number2);
  }

  static getPercent(number1, number2) {
    return Math.round(number1 * 100 / number2);
  }

  static getMinutesInHours(mins) {
    let h = mins / 60 | 0;
    let m = mins % 60 | 0;

    return `${h}h${m}m`;
  }

  static getYesterdayDailyHealthBitmark(dailyHealthDataBitmarks) {
    let yesterdayBitmark;
    let latestBitmark = dailyHealthDataBitmarks[0];
    let lastCollectionDate = moment(latestBitmark.asset.metadata['Collection Date']);

    let YESTERDAY = moment().subtract(1, 'days').startOf('day');

    if (lastCollectionDate.isSame(YESTERDAY, 'd')) {
      yesterdayBitmark = latestBitmark;
    }

    return yesterdayBitmark;
  }

  static async populateDataForStepsAndSleepPercents(dailyHealthDataBitmarks) {
    let stepsPercent;
    let sleepPercent;
    let yesterdayDataSteps;
    let yesterdayDataSleepTimeInMinutes;

    let yesterdayBitmark = this.getYesterdayDailyHealthBitmark(dailyHealthDataBitmarks);
    if (yesterdayBitmark) {
      let yesterdayData = await this.readDailyHealthData(yesterdayBitmark);

      if (yesterdayData) {
        yesterdayDataSteps = this.getDailyStepsFromData(yesterdayData);
        let yesterdayDataSleep = this.getDailySleepFromData(yesterdayData);

        // Compare to the goal
        if (yesterdayDataSteps != undefined) {
          stepsPercent = this.getPercent(yesterdayDataSteps, STEPS_GOAL);
        }

        if (yesterdayDataSleep != undefined) {
          let yesterdayDataSleepTime = moment(yesterdayDataSleep.endDate).diff(moment(yesterdayDataSleep.startDate), 'minutes');
          sleepPercent = this.getPercent(yesterdayDataSleepTime, SLEEP_IN_MINUTES_GOAL);
          yesterdayDataSleepTimeInMinutes = this.getMinutesInHours(yesterdayDataSleepTime);
        }
      }
    }

    return {stepsPercent, sleepPercent, yesterdayDataSteps, yesterdayDataSleepTimeInMinutes};
  }

  static async populateDataForCharts(dailyHealthDataBitmarks) {
    let currentDate = moment();
    let sevenDaysAgo = currentDate.date(currentDate.date() - 7).hour(0).minute(0).second(0);

    let last7DaysBitmarks = dailyHealthDataBitmarks.filter(bitmark => {
      let saveTime = moment(bitmark.asset.metadata['Collection Date']);
      return saveTime.diff(sevenDaysAgo, 'days') >= 0;
    });

    let last7DaysData = [];
    for (let i = 0; i < last7DaysBitmarks.length; i++) {
      let dailyBitmark = last7DaysBitmarks[i];
      let dailyData = await this.readDailyHealthData(dailyBitmark);

      if (dailyData) {
        let steps = this.getDailyStepsFromData(dailyData);
        let sleep = this.getDailySleepFromData(dailyData);
        let date = moment(dailyBitmark.asset.metadata['Collection Date']);

        last7DaysData.push({
          date,
          steps,
          sleep
        })
      }
    }

    return last7DaysData;
  }

  static populateDataForStepsChart(last7DaysData) {
    let stepsChartData = [];
    let currentDate = moment();

    for (let i = 7; i >= 1; i--) {
      let date = moment().date(currentDate.date() - i).hour(23).minute(59).second(0).millisecond(0);
      let dayData = last7DaysData.find(item => {
        return date.diff(item.date, 'seconds') == 0 && item.steps != undefined;
      });

      if (dayData) {
        stepsChartData.push({
          label: dayData.date.format('dddd').substring(0, 1),
          value: dayData.steps,
          isActive: i == 1
        })
      } else {
        stepsChartData.push({
          label: date.format('dddd').substring(0, 1),
          isMissing: true,
          isActive: i == 1
        })
      }
    }

    return stepsChartData;
  }

  static populateDataForSleepChart(last7DaysData) {
    let sleepChartData = [];
    let currentDate = moment();

    for (let i = 7; i >= 1; i--) {
      let date = moment().date(currentDate.date() - i).hour(23).minute(59).second(0).millisecond(0);
      let dayData = last7DaysData.find(item => {
        return date.diff(item.date, 'seconds') == 0 && item.sleep != undefined;
      });

      if (dayData) {
        sleepChartData.push({
          label: dayData.date.format('dddd').substring(0, 1),
          startDateLabel: moment(dayData.sleep.startDate).format('HH:mm'),
          endDateLabel: moment(dayData.sleep.endDate).format('HH:mm'),
          value: moment(dayData.sleep.endDate).diff(moment(dayData.sleep.startDate), 'minutes'),
          sleepTimeLabel: this.getMinutesInHours(moment(dayData.sleep.endDate).diff(moment(dayData.sleep.startDate), 'minutes')),
          isActive: i == 1
        })
      } else {
        sleepChartData.push({
          label: date.format('dddd').substring(0, 1),
          isMissing: true,
          isActive: i == 1
        })
      }
    }

    return sleepChartData;
  }

  static populateStepsAverage(last7DaysData, stepsChartData) {
    let averageSteps;
    let yesterdayCompareToAverageSteps;

    let hasStepsValueDaysData = last7DaysData.filter(item => item.steps != undefined);
    if (hasStepsValueDaysData.length) {
      const stepsReducer = (accumulator, currentValue) => accumulator + currentValue;
      averageSteps = Math.round(hasStepsValueDaysData.map(item => item.steps).reduce(stepsReducer) / hasStepsValueDaysData.length);

      // Get last day (yesterday) compare to average
      if (!stepsChartData[6].isMissing) {
        let lastDaySteps = stepsChartData[6].value;
        yesterdayCompareToAverageSteps = this.getRelativePercent(lastDaySteps, averageSteps);
      }
    }

    return {averageSteps, yesterdayCompareToAverageSteps};
  }

  static populateSleepAverage(last7DaysData, sleepChartData) {
    let averageSleep;
    let yesterdayCompareToAverageSleep;

    let hasSleepValueDaysData = last7DaysData.filter(item => item.sleep != undefined);
    if (hasSleepValueDaysData.length) {
      const reducer = (accumulator, currentValue) => accumulator + currentValue;
      let averageSleepTime = Math.round(hasSleepValueDaysData.map(item => moment(item.sleep.endDate).diff(moment(item.sleep.startDate), 'minutes')).reduce(reducer) / hasSleepValueDaysData.length);
      averageSleep = this.getMinutesInHours(averageSleepTime);

      // Get last day (yesterday) compare to average
      if (!sleepChartData[6].isMissing) {
        let lastDaySleep = sleepChartData[6].value;
        yesterdayCompareToAverageSleep = this.getRelativePercent(lastDaySleep, averageSleepTime);
      }
    }

    return {averageSleep, yesterdayCompareToAverageSleep};
  }
}

export { DailyHealthDataUtil };
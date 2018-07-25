const moment = require('moment');

const getMomentLocalTime = (date, timezone) => {
  let tempMoment = date ? moment(date) : moment();
  tempMoment.utcOffset(timezone);
  return tempMoment;
};

const getEndDayInLocalTime = (date, timezone) => {
  let tempMoment = getMomentLocalTime(date, timezone);
  tempMoment.hour(23);
  tempMoment.minute(59);
  tempMoment.second(59);
  tempMoment.millisecond(0);
  return tempMoment;
};

const getBeginDayInLocalTime = (date, timezone) => {
  let tempMoment = getMomentLocalTime(date, timezone);
  tempMoment.hour(0);
  tempMoment.minute(0);
  tempMoment.second(0);
  tempMoment.millisecond(0);
  return tempMoment;
};

const getNextDayInLocalTime = (date, timezone, dayInWeek) => {
  let tempMoment = getMomentLocalTime(date, timezone);
  if (dayInWeek) {
    let currentDayInWeek = tempMoment.day();
    if (currentDayInWeek <= dayInWeek) {
      tempMoment.date(tempMoment.date() + dayInWeek - currentDayInWeek);
    } else {
      tempMoment.date(tempMoment.date() + 7 + dayInWeek - currentDayInWeek);
    }
  } else {
    tempMoment.date(tempMoment.date() + 1);
  }
  return tempMoment;
};

const getPreviousDayInLocalTime = (date, timezone, dayInWeek) => {
  let tempMoment = getMomentLocalTime(date, timezone);
  if (dayInWeek) {
    let currentDayInWeek = tempMoment.day();
    if (currentDayInWeek >= dayInWeek) {
      tempMoment.date(tempMoment.date() + currentDayInWeek - dayInWeek);
    } else {
      tempMoment.date(tempMoment.date() + dayInWeek - currentDayInWeek - 7);
    }
  } else {
    tempMoment.date(tempMoment.date() - 1);
  }
  return tempMoment;
};

module.exports = {
  getMomentLocalTime: getMomentLocalTime,
  getEndDayInLocalTime: getEndDayInLocalTime,
  getBeginDayInLocalTime: getBeginDayInLocalTime,
  getNextDayInLocalTime: getNextDayInLocalTime,
  getPreviousDayInLocalTime: getPreviousDayInLocalTime,
  taskIds: {
    donations: 'donations',
    intake_survey: 'intake_survey',
  }
};
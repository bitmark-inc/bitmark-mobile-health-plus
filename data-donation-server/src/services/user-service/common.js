const moment = require('moment');

const getMomentLocalTime = (date, dateUTCOffset) => {
  let tempMoment = date ? moment(date) : moment();
  tempMoment.utcOffset(- dateUTCOffset);
  return tempMoment;
};

const getEndDayInLocalTime = (date, dateUTCOffset) => {
  let tempMoment = getMomentLocalTime(date, dateUTCOffset);
  tempMoment.hour(23);
  tempMoment.minute(59);
  tempMoment.second(59);
  tempMoment.millisecond(0);
  return tempMoment;
};

const getBeginDayInLocalTime = (date, dateUTCOffset) => {
  let tempMoment = getMomentLocalTime(date, dateUTCOffset);
  tempMoment.hour(0);
  tempMoment.minute(0);
  tempMoment.second(0);
  tempMoment.millisecond(0);
  return tempMoment;
};

const getNextDayInLocalTime = (date, dateUTCOffset, dayInWeek) => {
  let tempMoment = getMomentLocalTime(date, dateUTCOffset);
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

const getPreviousDayInLocalTime = (date, dateUTCOffset, dayInWeek) => {
  let tempMoment = getMomentLocalTime(date, dateUTCOffset);
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
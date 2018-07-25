const _ = require('lodash');
const moment = require('moment');

const helper = require('./../../utils/helper');
const common = require('./common');

const config = global.server.config;

const notificationHour = 11;
const notificationDayInWeek = 6;
const donationDayInWeek = 5;
const studyId = 'study2';

const taskIds = _.merge({}, {
  task1: 'task1',
  task2: 'task2',
  task3: 'task3',
  task4: 'task4',
  entry_study: 'entry_study',
}, common.taskIds);

const studyInformation = {
  studyId: studyId,
  studyCode: 'IDRRS',
  title: "The International Diabetes Remission Registry",
  description: "UC Berkeley School of Public Health",
  interval: "weekly", // daily, monthly, weekly
  logo: "TODO",
  available: true,
  availableTimestamp: 1504569600000,
  researcherName: 'Victor Villalobos, Doctoral Candidate',
  durationText: '90 DAYS',
  durationValue: 90,
  consentLink: config.server_url + '/public/studies/' + studyId + '/consent.html',
  consentLinkDownload: config.server_url + '/public/studies/' + studyId + '/consent.pdf',
  researcherLink: 'www.diabetesremission.org',
  researcherAccount: config.studies[studyId].researcher_account,
  dataTypes: [
    'ActiveEnergyBurned',
    'AppleExerciseTime',
    'BasalEnergyBurned',
    'BiologicalSex',
    'BloodGlucose',
    'BloodType',
    'BodyFatPercentage',
    'BodyMassIndex',
    'DateOfBirth',
    'DietaryBiotin',
    'DietaryCaffeine',
    'DietaryCalcium',
    'DietaryCarbohydrates',
    'DietaryChloride',
    'DietaryCholesterol',
    'DietaryChromium',
    'DietaryCopper',
    'DietaryEnergy',
    'DietaryFatMonounsaturated',
    'DietaryFatPolyunsaturated',
    'DietaryFatSaturated',
    'DietaryFatTotal',
    'DietaryFiber',
    'DietaryFolate',
    'DietaryIodine',
    'DietaryIron',
    'DietaryMagnesium',
    'DietaryManganese',
    'DietaryMolybdenum',
    'DietaryNiacin',
    'DietaryPantothenicAcid',
    'DietaryPhosphorus',
    'DietaryPotassium',
    'DietaryProtein',
    'DietaryRiboflavin',
    'DietarySelenium',
    'DietarySodium',
    'DietarySugar',
    'DietaryThiamin',
    'DietaryVitaminA',
    'DietaryVitaminB12',
    'DietaryVitaminB6',
    'DietaryVitaminC',
    'DietaryVitaminD',
    'DietaryVitaminE',
    'DietaryVitaminK',
    'DietaryWater',
    'DietaryZinc',
    'DistanceCycling',
    'DistanceSwimming',
    'DistanceWalkingRunning',
    'FitzpatrickSkinType',
    'FlightsClimbed',
    'Height',
    'LeanBodyMass',
    'MindfulSession',
    'NikeFuel',
    'PushCount',
    'RespiratoryRate',
    'SleepAnalysis',
    'StandHour',
    'StepCount',
    'SwimmingStrokeCount',
    'UVExposure',
    'Weight',
    'WheelchairDistance',
    'WheelchairUse',
  ],
  taskIds: taskIds,
  studyTasks: {
    donations: {
      title: 'Weekly Health Data Donation', description: 'International Diabetes Remission Registry',
      notification: 'Your data donation is waiting to be sent to the International Diabetes Remission Registry study. Tap to donate.',
    },
    intake_survey: {
      title: 'Intake Survey', description: 'International Diabetes Remission Registry',
      notification: "Please complete the intake survey for the International Diabetes Remission Registry study."
    },
    task1: {
      title: 'Glucose HbA1c Task', description: 'International Diabetes Remission Registry',
      notification: 'Please complete the Glucose HbA1c task for the International Diabetes Remission Registry study.',
    },
    task2: {
      title: 'Glucose HbA1c Task', description: 'International Diabetes Remission Registry',
      notification: 'Please complete the Glucose HbA1c task for the International Diabetes Remission Registry study.',
    },
    task3: {
      title: 'Dietary Practice Mission Introduction', description: 'International Diabetes Remission Registry',
      notification: 'Please read the introduction for the Dietary Practice Mission for the International Diabetes Remission Registry study.',
    },
    task4: {
      title: 'Dietary Practice Mission', description: 'International Diabetes Remission Registry',
      notification: 'Please complete the Dietary Practice Mission for the International Diabetes Remission Registry study.',
    },
    entry_study: {
      title: 'Optional Entry Interview', description: 'International Diabetes Remission Registry',
      notification: 'Please complete the optional entry interview for the International Diabetes Remission Registry study.',
    },
  },
};



const getFullJoinedInformation = (joinedStudyInformation, timezone) => {
  //donation
  let currentTimeInLocal = common.getMomentLocalTime(null, timezone);
  if (currentTimeInLocal.day() === notificationDayInWeek &&
    currentTimeInLocal.hour() < notificationHour) {
    currentTimeInLocal.hour(currentTimeInLocal.hour() - 12);
  }
  let lastCompletedTasks = joinedStudyInformation.lastCompletedTasks || {};

  let donationTasks = [];
  let tempLastTimeDonation = (lastCompletedTasks[taskIds.donations] && lastCompletedTasks[taskIds.donations].completedAt)
    ? lastCompletedTasks[taskIds.donations].completedAt : joinedStudyInformation.joinedDate;
  tempLastTimeDonation = common.getMomentLocalTime(tempLastTimeDonation, timezone);
  let nextDonationDayInWeek = common.getNextDayInLocalTime(tempLastTimeDonation, timezone, donationDayInWeek);
  let endDonatedTime = common.getEndDayInLocalTime(nextDonationDayInWeek);

  if (currentTimeInLocal.toDate() > endDonatedTime.toDate() && endDonatedTime.toDate() > tempLastTimeDonation.toDate()) {
    donationTasks.push({
      startDate: tempLastTimeDonation.toDate(),
      endDate: endDonatedTime.toDate(),
      timezone: timezone,
    });
  }

  nextDonationDayInWeek = common.getNextDayInLocalTime(common.getNextDayInLocalTime(endDonatedTime), timezone, donationDayInWeek);
  let beginDonateTime = common.getBeginDayInLocalTime(common.getNextDayInLocalTime(endDonatedTime));
  endDonatedTime = common.getEndDayInLocalTime(nextDonationDayInWeek);

  while (endDonatedTime.toDate() < currentTimeInLocal.toDate()) {
    donationTasks.push({
      startDate: beginDonateTime.toDate(),
      endDate: endDonatedTime.toDate(),
      timezone: timezone,
    });
    nextDonationDayInWeek = common.getNextDayInLocalTime(common.getNextDayInLocalTime(endDonatedTime), timezone, donationDayInWeek);
    beginDonateTime = common.getBeginDayInLocalTime(common.getNextDayInLocalTime(endDonatedTime));
    endDonatedTime = common.getEndDayInLocalTime(nextDonationDayInWeek);
  }
  let donationTaskNumber = donationTasks.length;
  let tasks = {
    donations: {
      title: donationTaskNumber > 0 ? (studyInformation.interval.charAt(0).toUpperCase() + studyInformation.interval.slice(1).toLowerCase() + ' Data Donation')
        : 'Last Data Donation - ' + tempLastTimeDonation.format('YYYY MMM DD'),
      description: donationTaskNumber === 0 ? 'Your next donation is Saturday at 11AM' :
        studyInformation.studyTasks[taskIds.donations].description,
      number: donationTaskNumber,
      list: donationTasks,
    }
  };
  let totalTasks = tasks.donations.number;

  // tasks
  currentTimeInLocal = common.getMomentLocalTime(null, timezone);

  if (!lastCompletedTasks[taskIds.intake_survey] || !lastCompletedTasks[taskIds.intake_survey].completedAt) {
    tasks[taskIds.intake_survey] = {
      title: studyInformation.studyTasks[taskIds.intake_survey].title,
      description: studyInformation.studyTasks[taskIds.intake_survey].description,
      number: 1,
      important: true,
    };
    totalTasks += 1;
  }

  if (!lastCompletedTasks[taskIds.task1] || !lastCompletedTasks[taskIds.task1].completedAt) {
    tasks[taskIds.task1] = {
      title: studyInformation.studyTasks[taskIds.task1].title,
      description: studyInformation.studyTasks[taskIds.task1].description,
      number: 1,
    };
    totalTasks += 1;
  }

  let lastTime = (lastCompletedTasks[taskIds.task2] && lastCompletedTasks[taskIds.task2].completedAt) ? lastCompletedTasks[taskIds.task2].completedAt : null;
  lastTime = lastTime || ((lastCompletedTasks[taskIds.task1] && lastCompletedTasks[taskIds.task1].completedAt) ? lastCompletedTasks[taskIds.task1].completedAt : null);
  if (lastTime) {
    let lastTimeTask2InLocal = common.getMomentLocalTime(lastTime, timezone);
    let beginLastTimeTask2InLocal = common.getBeginDayInLocalTime(lastTimeTask2InLocal);
    let beginCurrentTimeInLocal = common.getBeginDayInLocalTime(currentTimeInLocal);
    let diff = beginCurrentTimeInLocal.diff(beginLastTimeTask2InLocal, 'days');
    if (diff > 30) {
      let startDate = moment(lastTimeTask2InLocal.toDate());
      startDate.date(startDate.date() + Math.floor(diff / 30) * 30);
      tasks[taskIds.task2] = {
        title: studyInformation.studyTasks[taskIds.task2].title,
        description: studyInformation.studyTasks[taskIds.task2].description,
        number: 1,
        list: [{
          startDate: startDate.toDate(),
          timezone: timezone,
        }]
      };
      totalTasks += 1;
    }
  }

  if (!lastCompletedTasks[taskIds.entry_study] || !lastCompletedTasks[taskIds.entry_study].completedAt) {
    tasks[taskIds.entry_study] = {
      title: studyInformation.studyTasks[taskIds.entry_study].title,
      description: studyInformation.studyTasks[taskIds.entry_study].description,
      number: 1,
    };
    totalTasks += 1;
  }

  if (!lastCompletedTasks[taskIds.task3] || !lastCompletedTasks[taskIds.task3].completedAt) {
    tasks[taskIds.task3] = {
      title: studyInformation.studyTasks[taskIds.task3].title,
      description: studyInformation.studyTasks[taskIds.task3].description,
      number: 1,
    };
    totalTasks += 1;
  }

  lastTime = (lastCompletedTasks[taskIds.task4] && lastCompletedTasks[taskIds.task4].completedAt) ? lastCompletedTasks[taskIds.task4].completedAt : null;
  if (!lastTime && lastCompletedTasks[taskIds.task3] && lastCompletedTasks[taskIds.task3].completedAt) {
    let dateCompleteTask3 = moment(lastCompletedTasks[taskIds.task3].completedAt);
    dateCompleteTask3.date(dateCompleteTask3.date() - 1);
    lastTime = dateCompleteTask3.toDate();
  }
  if (lastTime) {
    let lastTimeTask4InLocal = common.getMomentLocalTime(lastTime, timezone);
    let beginLastTimeTask4InLocal = common.getBeginDayInLocalTime(lastTimeTask4InLocal);
    let beginCurrentTimeInLocal = common.getBeginDayInLocalTime(currentTimeInLocal);
    let diff = beginCurrentTimeInLocal.diff(beginLastTimeTask4InLocal, 'days');
    if (diff >= 2) {
      let startDate = moment(lastTimeTask4InLocal.toDate());
      startDate.date(startDate.date() + Math.floor(diff / 2) * 2);
      tasks[taskIds.task4] = {
        title: studyInformation.studyTasks[taskIds.task4].title,
        description: studyInformation.studyTasks[taskIds.task4].description,
        number: 1,
        list: [{
          startDate: startDate.toDate(),
          timezone: timezone,
        }]
      };
      totalTasks += 1;
    }
  }

  let duration;
  if (joinedStudyInformation && joinedStudyInformation.joinedDate) {
    let beginOfJoinedDate = common.getBeginDayInLocalTime(joinedStudyInformation.joinedDate, timezone);
    let beginOfNextDate = common.getBeginDayInLocalTime(common.getNextDayInLocalTime(currentTimeInLocal));
    let count = beginOfNextDate.diff(beginOfJoinedDate, 'days');
    duration = count > 0 ? (count + ' OF ' + studyInformation.durationText) : studyInformation.durationText;
  } else {
    duration = studyInformation.durationText;
  }
  return _.merge({}, studyInformation, {
    totalTasks: totalTasks,
    tasks: tasks,
    joined: true,
    duration: duration,
  });
};

const verifyTimeSendNotification = (joinedStudyInformation, taskKey, timeCheck, timezone) => {
  let message = false;
  let timeCheckInLocal = common.getMomentLocalTime(timeCheck, timezone);
  let lastCompletedTasks = joinedStudyInformation.lastCompletedTasks || {};

  if (taskKey === taskIds.donations) {
    let tempLastTimeDonation = (lastCompletedTasks[taskIds.donations] && lastCompletedTasks[taskIds.donations].completedAt)
      ? lastCompletedTasks[taskIds.donations].completedAt : joinedStudyInformation.joinedDate;

    let lastTimeDonateInLocal = common.getMomentLocalTime(tempLastTimeDonation, timezone);
    let nextTimeSendNotification = common.getNextDayInLocalTime(lastTimeDonateInLocal, timezone, notificationDayInWeek);
    nextTimeSendNotification.hour(notificationHour);
    nextTimeSendNotification.minute(0);
    nextTimeSendNotification.second(0);
    nextTimeSendNotification.millisecond(0);

    if (timeCheckInLocal.hour() === notificationHour && timeCheckInLocal.day() === notificationDayInWeek &&
      timeCheckInLocal.toDate() >= nextTimeSendNotification.toDate()) {

      let endDayOfCurrentDateInLocalCal = common.getEndDayInLocalTime(timeCheckInLocal);
      endDayOfCurrentDateInLocalCal.millisecond(endDayOfCurrentDateInLocalCal.millisecond() - 1);

      let diff = endDayOfCurrentDateInLocalCal.diff(lastTimeDonateInLocal, 'days');
      if (diff < 28) {
        message = studyInformation.studyTasks.donations.notification;
      } else {
        message = 'The International Diabetes Remission Registry hasn’t received any recent data donations or completed tasks. You can opt out of the study if you are no longer interested in participating.';
      }
    }
  } else if (taskKey === taskIds.task2 && timeCheckInLocal.hour() === 11) {
    let lastTime = (lastCompletedTasks[taskIds.task2] && lastCompletedTasks[taskIds.task2].completedAt) ? lastCompletedTasks[taskIds.task2].completedAt : null;
    lastTime = lastTime || ((lastCompletedTasks[taskIds.task1] && lastCompletedTasks[taskIds.task1].completedAt) ? lastCompletedTasks[taskIds.task1].completedAt : null);
    if (lastTime) {
      let lastTimeTask2InLocal = common.getMomentLocalTime(lastTime, timezone);
      lastTimeTask2InLocal.hour(0);
      lastTimeTask2InLocal.minute(0);
      lastTimeTask2InLocal.second(0);
      lastTimeTask2InLocal.millisecond(0);
      let currentTimeInLocal = common.getMomentLocalTime(null, timezone);
      let diff = currentTimeInLocal.diff(lastTimeTask2InLocal, 'days');
      if (diff === 30) {
        message = message = studyInformation.studyTasks.task2.notification;
      }
    }
  } else if (taskKey === taskIds.task4 && timeCheckInLocal.hour() === 11) {
    let lastTime = (lastCompletedTasks[taskIds.task4] && lastCompletedTasks[taskIds.task4].completedAt) ? lastCompletedTasks[taskIds.task4].completedAt : null;
    if (!lastTime && lastCompletedTasks[taskIds.task3] && lastCompletedTasks[taskIds.task3].completedAt) {
      let dateCompleteTask3 = moment(lastCompletedTasks[taskIds.task3].completedAt);
      dateCompleteTask3.date(dateCompleteTask3.date() - 1);
      lastTime = dateCompleteTask3.toDate();
    }
    if (lastTime) {
      let lastTimeTask4InLocal = common.getMomentLocalTime(lastTime, timezone);
      lastTimeTask4InLocal.hour(0);
      lastTimeTask4InLocal.minute(0);
      lastTimeTask4InLocal.second(0);
      lastTimeTask4InLocal.millisecond(0);
      let currentTimeInLocal = common.getMomentLocalTime(null, timezone);
      let diff = currentTimeInLocal.diff(lastTimeTask4InLocal, 'days');
      if (diff % 2 === 0) {
        message = message = studyInformation.studyTasks.task4.notification;
      }
    }
  }
  return message;
};

const doSendNotifications = async (userInformation, joinedStudyInformation) => {
  if (!userInformation) {
    return;
  }
  let currentTime = new Date();
  let timezone = userInformation.timezone ? -userInformation.timezone : null;
  let title = '';
  let message = verifyTimeSendNotification(joinedStudyInformation, taskIds.donations, currentTime, timezone);
  if (message) {
    await helper.doTryRequestSendNotification(userInformation.bitmarkAccount, title, message, {
      event: 'DONATE_DATA',
      studyData: { studyId: joinedStudyInformation.studyId, taskType: taskIds.donations },
    });
  }
  message = verifyTimeSendNotification(joinedStudyInformation, taskIds.task2, currentTime, timezone);
  if (message) {
    await helper.doTryRequestSendNotification(userInformation.bitmarkAccount, title, message, {
      event: 'DONATE_DATA',
      studyData: { studyId: joinedStudyInformation.studyId, taskType: taskIds.task2 },
    });
  }
  message = verifyTimeSendNotification(joinedStudyInformation, taskIds.task4, currentTime, timezone);
  if (message) {
    await helper.doTryRequestSendNotification(userInformation.bitmarkAccount, title, message, {
      event: 'DONATE_DATA',
      studyData: { studyId: joinedStudyInformation.studyId, taskType: taskIds.task4 },
    });
  }
};

module.exports = _.merge({}, {
  getFullJoinedInformation,
  verifyTimeSendNotification,
  studyInformation,

  doSendNotifications,
  taskIds
}, common);
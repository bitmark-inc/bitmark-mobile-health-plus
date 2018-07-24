const _ = require('lodash');

const helper = require('./../../utils/helper');
const common = require('./common');

const config = global.server.config;

const notificationHour = 9;
const taskIds = _.merge({
  exit_survey_1: 'exit_survey_1',
  exit_survey_2: 'exit_survey_2',
}, common.taskIds);

const studyId = 'study1';
const studyInformation = {
  studyId: studyId,
  studyCode: 'GWHOS',
  title: "Global Women's Health Outcome Study",
  description: "UC Berkeley School of Public Health",
  interval: "daily", // daily, monthly, weekly
  logo: "TODO",
  available: true,
  availableTimestamp: 1504569600000,
  researcherName: 'Madelena Ng, Doctoral Candidate',
  researcherAccount: config.studies[studyId].researcher_account,
  durationText: '100 DAYS',
  durationValue: 100,
  consentLink: config.server_url + '/public/studies/' + studyId + '/consent.html',
  consentLinkDownload: config.server_url + '/public/studies/' + studyId + '/consent.pdf',
  dataTypes: [
    'BasalEnergyBurned',
    'CervicalMucousQuality',
    'AppleExerciseTime',
    'FlightsClimbed',
    'IntermenstrualBleeding',
    'MenstrualFlow',
    'MindfulSession',
    'OvulationTestResult',
    'SexualActivity',
    'SleepAnalysis',
    'StandHour',
    'StepCount',
    'DistanceWalkingRunning',
  ],
  taskIds: taskIds,
  studyTasks: {
    donations: {
      title: 'Daily Health Data Donation', description: 'Global Women’s Health Outcomes Study',
      notification: "Your data donation is waiting to be sent to the Global Women's Health Outcome Study. Tap to donate."
    },
    intake_survey: {
      title: 'Intake Survey', description: 'Global Women’s Health Outcomes Study',
      notification: "Please complete the intake survey for the Global Women’s Health Outcomes Study."
    },
    exit_survey_1: {
      title: 'Exit Survey', description: 'Global Women’s Health Outcomes Study',
      notification: "Please complete the exit survey for the Global Women’s Health Outcomes Study study."
    },
    exit_survey_2: {
      title: 'Optional Exit Interview', description: 'Global Women’s Health Outcomes Study',
      notification: "Please complete the optional exit interview for the Global Women’s Health Outcomes Study study."
    },
  },
};

const getFullJoinedInformation = (joinedStudyInformation, timezone) => {
  // donation task
  let currentTimeInLocal = common.getMomentLocalTime(null, timezone);
  if (currentTimeInLocal.hour() < notificationHour) {
    currentTimeInLocal.hour(currentTimeInLocal.hour() - 12);
  }
  let lastCompletedTasks = joinedStudyInformation.lastCompletedTasks || {};

  let donationTasks = [];
  let tempLastTimeDonation = (lastCompletedTasks[taskIds.donations] && lastCompletedTasks[taskIds.donations].completedAt)
    ? lastCompletedTasks[taskIds.donations].completedAt : joinedStudyInformation.joinedDate;

  tempLastTimeDonation = common.getMomentLocalTime(tempLastTimeDonation, timezone);
  let endDonatedTime = common.getEndDayInLocalTime(tempLastTimeDonation);

  if (currentTimeInLocal.toDate() > endDonatedTime.toDate() && endDonatedTime.toDate() > tempLastTimeDonation.toDate()) {
    donationTasks.push({
      startDate: tempLastTimeDonation.toDate(),
      endDate: endDonatedTime.toDate(),
      timezone: timezone,
    });
  }
  let beginDonateTime = common.getBeginDayInLocalTime(common.getNextDayInLocalTime(endDonatedTime));
  endDonatedTime = common.getEndDayInLocalTime(common.getNextDayInLocalTime(endDonatedTime));
  while (endDonatedTime.toDate() < currentTimeInLocal.toDate()) {
    donationTasks.push({
      startDate: beginDonateTime.toDate(),
      endDate: endDonatedTime.toDate(),
      timezone: timezone,
    });
    beginDonateTime = common.getBeginDayInLocalTime(common.getNextDayInLocalTime(endDonatedTime));
    endDonatedTime = common.getEndDayInLocalTime(common.getNextDayInLocalTime(endDonatedTime));
  }

  let tasks = {};
  let donationTaskNumber = donationTasks.length;
  tasks[taskIds.donations] = {
    title: donationTaskNumber > 0 ? (studyInformation.interval.charAt(0).toUpperCase() + studyInformation.interval.slice(1).toLowerCase() + ' Data Donation')
      : 'Last Data Donation - ' + tempLastTimeDonation.format('YYYY MMM DD'),
    description: donationTaskNumber === 0 ? 'Your next donation is tomorrow at 9AM' :
      studyInformation.studyTasks[taskIds.donations].description,
    number: donationTaskNumber,
    list: donationTasks,
  };
  let totalTasks = donationTaskNumber;

  // intake_survey task
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
  // exit_survey 1,2  
  let duration;
  if (joinedStudyInformation && joinedStudyInformation.joinedDate) {
    let beginOfJoinedDate = common.getBeginDayInLocalTime(joinedStudyInformation.joinedDate, timezone);
    let beginOfNextDate = common.getBeginDayInLocalTime(common.getNextDayInLocalTime(currentTimeInLocal));
    let count = beginOfNextDate.diff(beginOfJoinedDate, 'days');
    if (count > 100) {
      if (!lastCompletedTasks[taskIds.exit_survey_1] || !lastCompletedTasks[taskIds.exit_survey_1].completedAt) {
        tasks[taskIds.exit_survey_1] = {
          title: studyInformation.studyTasks[taskIds.exit_survey_1].title,
          description: studyInformation.studyTasks[taskIds.exit_survey_1].description,
          number: 1,
        };
        totalTasks += 1;
      }
      if (!lastCompletedTasks[taskIds.exit_survey_2] || !lastCompletedTasks[taskIds.exit_survey_2].completedAt) {
        tasks[taskIds.exit_survey_2] = {
          title: studyInformation.studyTasks[taskIds.exit_survey_2].title,
          description: studyInformation.studyTasks[taskIds.exit_survey_2].description,
          number: 1,
        };
        totalTasks += 1;
      }
      if (!tasks[taskIds.exit_survey_1]) {
        duration = 'COMPLETED';
      }
    }
    duration = duration || (count > 0 ? (count + ' OF ' + studyInformation.durationText) : studyInformation.durationText);
  }
  duration = duration || studyInformation.durationText;

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
    if (timeCheckInLocal.hour() === notificationHour) {
      let endDayOfCurrentDateInLocalCal = common.getEndDayInLocalTime(timeCheckInLocal);
      endDayOfCurrentDateInLocalCal.millisecond(endDayOfCurrentDateInLocalCal.millisecond() - 1);
      let tempLastTimeDonation = (lastCompletedTasks[taskIds.donations] && lastCompletedTasks[taskIds.donations].completedAt)
        ? lastCompletedTasks[taskIds.donations].completedAt : joinedStudyInformation.joinedDate;
      let lastTimeDonateInLocal = common.getMomentLocalTime(tempLastTimeDonation, timezone);

      let diff = endDayOfCurrentDateInLocalCal.diff(lastTimeDonateInLocal, 'days');
      if (diff >= 1) {
        message = studyInformation.studyTasks.donations.notification;
      } else if (diff >= 14) {
        message = "Global Women's Health Outcome Study hasn’t received any recent data donations or completed tasks. You can opt out of the study if you are no longer interested in participating.";
      }
    }
  } else if (taskKey === taskIds.exit_survey_1 || taskKey === taskIds.exit_survey_2) {
    let beginOfJoinedDate = common.getBeginDayInLocalTime(joinedStudyInformation.joinedDate, timezone);
    let beginOfNextDate = common.getBeginDayInLocalTime(common.getNextDayInLocalTime(timeCheckInLocal));
    let count = beginOfNextDate.diff(beginOfJoinedDate, 'days');
    if (count === 101 && timeCheckInLocal.hour() === 11) {
      if (taskKey === taskIds.exit_survey_1 &&
        (!lastCompletedTasks[taskIds.exit_survey_1] || !lastCompletedTasks[taskIds.exit_survey_1].completedAt)) {
        message = studyInformation.studyTasks.exit_survey_1.notification;
      }
      if (taskKey === taskIds.exit_survey_2 &&
        (!lastCompletedTasks[taskIds.exit_survey_2] || !lastCompletedTasks[taskIds.exit_survey_2].completedAt)) {
        message = studyInformation.studyTasks.exit_survey_2.notification;
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

  message = verifyTimeSendNotification(joinedStudyInformation, taskIds.exit_survey_1, currentTime, timezone);
  if (message) {
    await helper.doTryRequestSendNotification(userInformation.bitmarkAccount, title, message, {
      event: 'DONATE_DATA',
      studyData: { studyId: joinedStudyInformation.studyId, taskType: taskIds.exit_survey_1 },
    });
  }

  message = verifyTimeSendNotification(joinedStudyInformation, taskIds.exit_survey_2, currentTime, timezone);
  if (message) {
    await helper.doTryRequestSendNotification(userInformation.bitmarkAccount, title, message, {
      event: 'DONATE_DATA',
      studyData: { studyId: joinedStudyInformation.studyId, taskType: taskIds.exit_survey_2 },
    });
  }

  // message = verifyTimeSendNotification(joinedStudyInformation, taskIds.intake_survey, currentTime, timezone);
  // if (message) {
  //   await helper.doTryRequestSendNotification(userInformation.bitmarkAccount, title, message, {
  //     event: 'DONATE_DATA',
  //     studyData: { studyId: joinedStudyInformation.studyId, taskType: taskIds.intake_survey },
  //   });
  // }
};


module.exports = _.merge({}, {
  getFullJoinedInformation,
  verifyTimeSendNotification,
  studyInformation,
  taskIds,

  doSendNotifications,
}, common);
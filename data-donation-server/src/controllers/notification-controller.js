const schedule = require('node-schedule');

const userModel = require('./../models/user-model');
const userJoinedStudyModel = require('./../models/user-joined-study-model');
const userService = require('./../services/user-service');
const helper = require('./../utils/helper');


const logger = global.server.logger;
const config = global.server.config;

const notifyNewStudy = async () => {
  try {
    let allUsers = await userModel.doGetAllUserInformation();
    let allStudies = userService.getAllActiveStudyInformation();

    for (let user of allUsers) {
      if (user.lastAction) {
        for (let study of allStudies) {
          if ((study.availableTimestamp > new Date(user.lastAction).getTime())) {
            let title = '';
            let message = study.title + ' is now available.';
            await helper.doTryRequestSendNotification(user.bitmarkAccount, title, message, {
              event: 'STUDY_DETAIL',
              studyId: study.studyId,
            });
          }
        }
      }
    }
  } catch (error) {
    console.log('notifyNewStudy error:', error);
  }
};

let checkingSendNotification = false;
const checkAndSendTaskNotifications = async () => {
  if (checkingSendNotification) {
    return;
  }
  let currentTime = new Date();
  logger.info('run check checkingSendNotification ====================', currentTime);
  checkingSendNotification = true;
  try {
    let allUsers = await userModel.doGetAllUserInformation();
    for (let user of allUsers) {
      try {
        await userService.doSendBitmarkHealthDataNotifications(user);
        let joinedStudies = await userJoinedStudyModel.doGetJoinedStudiesOfUser(user.bitmarkAccount);
        for (let joinedInfo of joinedStudies) {
          await userService.studies[joinedInfo.studyId].doSendNotifications(user, joinedInfo);
        }
      } catch (error) {
        console.log('checkAndSendTaskNotifications of user error :', user.bitmarkAccount, error);
      }
    }
  } catch (error) {
    console.log('checkAndSendTaskNotifications error', error);
  }
  checkingSendNotification = false;
};

const runInBackground = () => {
  notifyNewStudy();
  // if (config.network === 'devnet') {
  //   console.log('check send notification');
  //   checkAndSendTaskNotifications();
  // }
  schedule.scheduleJob(config.schedule_donation, checkAndSendTaskNotifications);
};

module.exports = {
  runInBackground: runInBackground,
  checkAndSendTaskNotifications,
};
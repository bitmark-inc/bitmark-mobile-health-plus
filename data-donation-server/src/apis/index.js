const moment = require('moment');

const helper = require('./../utils/helper');

const userModel = require('./../models/user-model');
const userJoinedStudyModel = require('./../models/user-joined-study-model');
const completedTasksModel = require('./../models/completed-tasks-model');

const userService = require('./../services/user-service');

const logger = global.server.logger;
const BitmarkError = global.server.BitmarkError;

const getFullUserInformation = async (bitmarkAccount, timezone) => {
  let userInformation = await userModel.doGetUserInformation(bitmarkAccount);
  userInformation = userInformation || {
    bitmarkAccount,
  };
  let joinedStudies = await userJoinedStudyModel.doGetJoinedStudiesOfUser(userInformation.bitmarkAccount);
  joinedStudies = joinedStudies || [];
  userInformation = await userService.getFullUserInformation(userInformation, joinedStudies, timezone);
  userInformation.joinedStudies = userInformation.joinedStudies || [];
  userInformation.otherStudies = userInformation.otherStudies || [];
  let results = await userJoinedStudyModel.doCountNumberUserJoinStudies();
  userInformation.joinedStudies.forEach(study => {
    study.participant = results[study.studyId];
  });
  userInformation.otherStudies.forEach(study => {
    study.participant = results[study.studyId];
  });
  userInformation.allDataTypes = userService.allDataTypes;
  userInformation.titleDataTypes = userService.titleDataTypes;
  return userInformation;
};

// ==================================================================================================================

const getUserInformation = async (req, res) => {
  try {
    console.log('getUserInformation api =============:', req.params);
    let bitmarkAccount = req.params.bitmark_account;
    if (!bitmarkAccount) {
      return helper.responseError(res, new BitmarkError('Invalid params!'));
    }
    let userInformation = await getFullUserInformation(bitmarkAccount);
    res.send(userInformation);
  } catch (error) {
    logger.error('error:', error);
    helper.responseError(res, error);
  }
};

const activeBHD = async (req, res) => {
  console.log('activeBHD api =============:', req.body);
  let bitmarkAccount = req.body.bitmark_account;
  let signature = req.body.signature;
  let timestamp = req.body.timestamp;
  if (!bitmarkAccount || !timestamp || !signature) {
    return helper.responseError(res, new BitmarkError('Invalid params!'));
  }
  let activeBitmarkHealthDataAt = req.body.active_bhd_at;
  let timezone = req.body.timezone || new Date().getTimezoneOffset();

  let validSignature = helper.validSignature(timestamp, signature, bitmarkAccount);
  if (!validSignature) {
    logger.error('Invalid signature : ', bitmarkAccount, timestamp, signature);
    return helper.responseError(res, new BitmarkError('Invalid signature!'));
  }
  try {
    let userInformation = await userModel.doGetUserInformation(bitmarkAccount);
    if (!userInformation || (timezone && userInformation.timezone !== timezone)) {
      let userInfo = {
        bitmarkAccount: bitmarkAccount,
        timezone,
        createdAt: new Date(new Date(activeBitmarkHealthDataAt).getTime() - 100),
      };
      let { oldUserInformation } = await userModel.doSaveUserInformation(userInfo);
      timezone = oldUserInformation ? oldUserInformation.timezone : timezone;
    }
    await userModel.doUpdateBitmarkHealthData(bitmarkAccount, activeBitmarkHealthDataAt);
    userInformation = await getFullUserInformation(bitmarkAccount, timezone);
    res.send(userInformation);
  } catch (error) {
    logger.error('register error:', error);
    helper.responseError(res, error);
  }
};

const inactiveBHD = async (req, res) => {
  console.log('inactiveBHD api =============:', req.body);
  let bitmarkAccount = req.body.bitmark_account;
  let signature = req.body.signature;
  let timestamp = req.body.timestamp;
  if (!bitmarkAccount || !timestamp || !signature) {
    return helper.responseError(res, new BitmarkError('Invalid params!'));
  }
  let validSignature = helper.validSignature(timestamp, signature, bitmarkAccount);
  if (!validSignature) {
    logger.error('Invalid signature : ', bitmarkAccount, timestamp, signature);
    return helper.responseError(res, new BitmarkError('Invalid signature!'));
  }
  let timezone = req.body.timezone || new Date().getTimezoneOffset();
  try {
    let userInformation = await userModel.doGetUserInformation(bitmarkAccount);
    if (!userInformation || (timezone && userInformation.timezone !== timezone)) {
      let userInfo = {
        bitmarkAccount: bitmarkAccount,
        timezone,
      };
      let { oldUserInformation } = await userModel.doSaveUserInformation(userInfo);
      timezone = oldUserInformation ? oldUserInformation.timezone : timezone;
    }
    await userModel.doUpdateBitmarkHealthData(bitmarkAccount);
    userInformation = await getFullUserInformation(bitmarkAccount);
    res.send(userInformation);
  } catch (error) {
    logger.error('register error:', error);
    helper.responseError(res, error);
  }
};

const joinStudy = async (req, res) => {
  try {
    console.log('joinStudy api: ', req.body);
    let bitmarkAccount = req.body.bitmark_account;
    let timestamp = req.body.timestamp;
    let studyId = req.body.study_id;
    let signature = req.body.signature;
    if (!bitmarkAccount || !timestamp || !signature || !studyId) {
      return helper.responseError(res, new BitmarkError('Invalid params!'));
    }
    let validSignature = helper.validSignature(timestamp, signature, bitmarkAccount);
    if (!validSignature) {
      logger.error('Invalid signature : ', bitmarkAccount, timestamp, signature);
      return helper.responseError(res, new BitmarkError('Invalid signature!'));
    }
    let timezone = req.body.timezone || new Date().getTimezoneOffset();
    let userInformation = await userModel.doGetUserInformation(bitmarkAccount);
    if (!userInformation || (timezone && userInformation.timezone !== timezone)) {
      let userInfo = {
        bitmarkAccount: bitmarkAccount,
        timezone,
      };
      let { oldUserInformation } = await userModel.doSaveUserInformation(userInfo);
      timezone = oldUserInformation ? oldUserInformation.timezone : timezone;
    }

    await userJoinedStudyModel.doInsertUserJoinedStudy({
      bitmarkAccount,
      studyId,
      joinedDate: new Date(),
    });
    userInformation = await getFullUserInformation(bitmarkAccount, timezone);
    res.send(userInformation);

    setTimeout(async () => {
      console.log('send notification after join study ==== ');
      let completedTasks = await completedTasksModel.doGetCompletedTask(userInformation.bitmarkAccount, userService.studyCommon.taskIds.intake_survey, studyId);
      if (!completedTasks) {
        let title = '';
        let message = userService.studies[studyId].studyInformation.studyTasks.intake_survey.notification;
        await helper.doTryRequestSendNotification(userInformation.bitmarkAccount, title, message, {
          event: 'DONATE_DATA',
          studyData: { studyId, taskType: userService.studies[studyId].taskIds.intake_survey },
        });
      }
      if (studyId === userService.studies.study2.studyInformation.studyId) {
        let completedTaskEntry = await completedTasksModel.doGetCompletedTask(userInformation.bitmarkAccount, userService.studies.study2.taskIds.entry_study, studyId);
        if (!completedTaskEntry) {
          let title = '';
          let messageTaskEntry = userService.studies.study2.studyInformation.studyTasks.entry_study.notification;
          await helper.doTryRequestSendNotification(userInformation.bitmarkAccount, title, messageTaskEntry, {
            event: 'DONATE_DATA',
            studyData: { studyId, taskType: userService.studies[studyId].taskIds.entry_study },
          });
        }

        let completedTask1 = await completedTasksModel.doGetCompletedTask(userInformation.bitmarkAccount, userService.studies.study2.taskIds.task1, studyId);
        if (!completedTask1) {
          let title = '';
          let messageTask1 = userService.studies.study2.studyInformation.studyTasks.task1.notification;
          await helper.doTryRequestSendNotification(userInformation.bitmarkAccount, title, messageTask1, {
            event: 'DONATE_DATA',
            studyData: { studyId, taskType: userService.studies[studyId].taskIds.task1 },
          });
        }

        let completedTask3 = await completedTasksModel.doGetCompletedTask(userInformation.bitmarkAccount, userService.studies.study2.taskIds.task3, studyId);
        if (!completedTask3) {
          let title = '';
          let completedTask3 = userService.studies.study2.studyInformation.studyTasks.task3.notification;
          await helper.doTryRequestSendNotification(userInformation.bitmarkAccount, title, completedTask3, {
            event: 'DONATE_DATA',
            studyData: { studyId, taskType: userService.studies[studyId].taskIds.task3 },
          });
        }
      }
    }, 20 * 1000);
  } catch (error) {
    logger.error('joinStudy error:', error);
    helper.responseError(res, error);
  }
};

const leaveStudy = async (req, res) => {
  try {
    console.log('leaveStudy api: ', req.body);
    let bitmarkAccount = req.body.bitmark_account;
    let timestamp = req.body.timestamp;
    let studyId = req.body.study_id;
    let signature = req.body.signature;
    if (!bitmarkAccount || !timestamp || !signature || !studyId) {
      return helper.responseError(res, new BitmarkError('Invalid params!'));
    }
    let validSignature = helper.validSignature(timestamp, signature, bitmarkAccount);
    if (!validSignature) {
      logger.error('Invalid signature : ', bitmarkAccount, timestamp, signature);
      return helper.responseError(res, new BitmarkError('Invalid signature!'));
    }
    let timezone = req.body.timezone || new Date().getTimezoneOffset();
    let userInformation = await userModel.doGetUserInformation(bitmarkAccount);
    if (!userInformation || (timezone && userInformation.timezone !== timezone)) {
      let userInfo = {
        bitmarkAccount: bitmarkAccount,
        timezone,
      };
      let { oldUserInformation } = await userModel.doSaveUserInformation(userInfo);
      timezone = oldUserInformation ? oldUserInformation.timezone : timezone;
    }
    await userJoinedStudyModel.doDeleteUserJoinedStudy(bitmarkAccount, studyId);
    userInformation = await getFullUserInformation(bitmarkAccount, timezone);
    res.send(userInformation);
  } catch (error) {
    logger.error('leaveStudy error:', error);
    helper.responseError(res, error);
  }
};

const completedTask = async (req, res) => {
  try {
    console.log('completedTask api: ', req.body);
    let bitmarkAccount = req.body.bitmark_account;
    let timestamp = req.body.timestamp;
    let signature = req.body.signature;
    let taskType = req.body.task_type;
    let completedAt = req.body.completed_at;
    let studyId = req.body.study_id;
    let bitmarkId = req.body.bitmark_id;
    let timezone = req.body.timezone || new Date().getTimezoneOffset();

    if (!bitmarkAccount || !timestamp || !signature || !completedAt || !taskType) {
      return helper.responseError(res, new BitmarkError('Invalid params!'));
    }
    let validSignature = helper.validSignature(timestamp, signature, bitmarkAccount);
    if (!validSignature) {
      logger.error('Invalid signature : ', bitmarkAccount, timestamp, signature);
      return helper.responseError(res, new BitmarkError('Invalid signature!'));
    }

    let userInformation = await userModel.doGetUserInformation(bitmarkAccount);
    if (!userInformation || (timezone && userInformation.timezone !== timezone)) {
      let userInfo = {
        bitmarkAccount: bitmarkAccount,
        timezone,
      };
      let { oldUserInformation } = await userModel.doSaveUserInformation(userInfo);
      timezone = oldUserInformation ? oldUserInformation.timezone : timezone;
    }
    await completedTasksModel.doInsertCompletedTask(bitmarkAccount, taskType, completedAt, studyId, bitmarkId);
    res.send({ ok: true });
  } catch (error) {
    logger.error('completedTask error:', error);
    helper.responseError(res, error);
  }
};

const testGetUserInfo = async (req, res) => {
  console.log('testGetUserInfo api : ', req.query);
  let bitmarkAccount = req.query.bitmark_account;

  try {
    let userInformation = await userModel.doGetUserInformation(bitmarkAccount);
    res.send(userInformation);
  } catch (error) {
    res.send({ error: error.message });
  }
};
const testUpdateJoinedStudy = async (req, res) => {
  console.log('testUpdateJoinedStudy api : ', req.body);
  let bitmarkAccount = req.body.bitmark_account;
  let studyId = req.body.study_id;
  let joinedDate = req.body.joined_date;

  try {
    await userJoinedStudyModel.doUpdateUserJoinedStudy({ bitmarkAccount, studyId, joinedDate });
    res.send({ message: 'Update success!' });
  } catch (error) {
    helper.responseError(res, error);
  }
};

const testUpdateCompletedTasks = async (req, res) => {
  console.log('testUpdateCompletedTasks api : ', req.body);
  let bitmarkAccount = req.body.bitmark_account;
  let taskType = req.body.task_type;
  let studyId = req.body.study_id;
  let isDelete = !!req.body.is_delete;
  let earlierDays = req.body.earlier_days;

  try {
    if (isDelete) {
      completedTasksModel.doDeleteAllTasks(bitmarkAccount, taskType, studyId);
    } else {
      let tasks = await completedTasksModel.doGetAllCompletedTasksOfUser(bitmarkAccount, taskType, studyId);
      for (let task of tasks) {
        let newCompletedAt = moment(task.completedAt);
        newCompletedAt.date(newCompletedAt.date() - earlierDays);
        await completedTasksModel.doUpdateCompletedTask(bitmarkAccount, taskType, task.completedAt, task.studyId, task.txid, newCompletedAt);
      }
    }
    res.send({ message: 'Update success!' });
  } catch (error) {
    helper.responseError(res, error);
  }
};

module.exports = {
  getUserInformation,
  activeBHD,
  inactiveBHD,
  joinStudy,
  leaveStudy,
  completedTask,

  testGetUserInfo,
  testUpdateCompletedTasks,
  testUpdateJoinedStudy,
};
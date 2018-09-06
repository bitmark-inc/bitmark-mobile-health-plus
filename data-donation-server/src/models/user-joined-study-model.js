
const moment = require('moment');

const database = global.server.database;
const squel = global.server.database.squel;

const completedTasksModel = require('./completed-tasks-model');

const BitmarkError = global.server.BitmarkError;

const doInsertUserJoinedStudy = async (joinedInfo) => {
  let query = squel.insert().into('data_donation.user_joined_study')
    .set('bitmark_account', joinedInfo.bitmarkAccount)
    .set('study_id', joinedInfo.studyId)
    .set('joined_date', moment(joinedInfo.joinedDate).format('YYYY-MM-DD HH:mm:ssZZ'))
    .toParam();
  await database.executeQuery(query);
  await completedTasksModel.doInformUserJoinStudyAgain(joinedInfo.bitmarkAccount, joinedInfo.studyId);
};

const doUpdateUserJoinedStudy = async (joinedInfo) => {
  if (!joinedInfo || !joinedInfo.joinedDate) {
    throw new BitmarkError('Data update empty');
  }
  let query = squel.update().table('data_donation.user_joined_study');
  if (joinedInfo.joinedDate) {
    query = query.set('joined_date', moment(joinedInfo.joinedDate).format('YYYY-MM-DD HH:mm:ssZZ'));
  }
  query = query.where('bitmark_account = ?', joinedInfo.bitmarkAccount)
    .where('study_id = ?', joinedInfo.studyId);
  console.log('query :', query.toString());
  query = query.toParam();
  await database.executeQuery(query);
};

const doDeleteUserJoinedStudy = async (bitmarkAccount, studyId) => {
  let query = squel.delete().from('data_donation.user_joined_study')
    .where('bitmark_account = ?', bitmarkAccount);
  query = studyId ? query.where('study_id = ?', studyId) : query;
  query = query.toParam();
  await database.executeQuery(query);
};

const doDeleteUserJoinedStudyByBitmarkAccount = async (bitmarkAccount) => {
  let query = squel.delete().from('data_donation.user_joined_study')
    .where('bitmark_account = ?', bitmarkAccount)
    .toParam();
  await database.executeQuery(query);
};

const doGetUserJoinedStudy = async (bitmarkAccount, studyId) => {
  let query = squel.select().from('data_donation.user_joined_study')
    .where('bitmark_account = ?', bitmarkAccount)
    .where('study_id = ?', studyId)
    .toParam();
  let returnedData = await database.executeQuery(query);
  let userJoinedStudy = null;
  if (returnedData && returnedData.rows && returnedData.rows.length > 0) {
    userJoinedStudy = {
      studyId: studyId,
      bitmarkAccount: bitmarkAccount,
      joinedDate: returnedData.rows[0].joined_date,
      lastTimeDonate: returnedData.rows[0].last_time_donate,
    };
    let tasks = await completedTasksModel.doGetLastCompletedTaskOfStudy(bitmarkAccount, studyId);
    userJoinedStudy.lastCompletedTasks = tasks;
  }
  return userJoinedStudy;
};

const doGetJoinedStudiesOfUser = async (bitmarkAccount) => {
  let query = squel.select().from('data_donation.user_joined_study')
    .where('bitmark_account = ?', bitmarkAccount)
    .order('study_id')
    .toParam();
  let returnedData = await database.executeQuery(query);
  let joinedStudies = [];
  if (returnedData && returnedData.rows && returnedData.rows.length > 0) {
    for (let row of returnedData.rows) {
      let userJoinedStudy = {
        studyId: row.study_id,
        bitmarkAccount: row.bitmark_account,
        joinedDate: row.joined_date,
        lastTimeDonate: row.last_time_donate,
      };
      let tasks = await completedTasksModel.doGetLastCompletedTaskOfStudy(bitmarkAccount, row.study_id);
      userJoinedStudy.lastCompletedTasks = tasks;
      let lastTimeDonationTask = (tasks && tasks['donations'] && tasks['donations'].lastTime) ? tasks['donations'].lastTime : null;
      if (!userJoinedStudy.lastTimeDonate || (lastTimeDonationTask && moment(userJoinedStudy.lastTimeDonate).toDate() < moment(lastTimeDonationTask).toDate())) {
        userJoinedStudy.lastTimeDonate = lastTimeDonationTask;
      }
      joinedStudies.push(userJoinedStudy);
    }
  }
  return joinedStudies;
};

const doGetAllUsersJoinOneStudy = async (studyId) => {
  let query = squel.select().from('data_donation.user_joined_study')
    .where('study_id = ?', studyId)
    .order('study_id')
    .toParam();
  let returnedData = await database.executeQuery(query);
  let joinedStudies = [];
  if (returnedData && returnedData.rows && returnedData.rows.length > 0) {
    for (let row of returnedData.rows) {
      let userJoinedStudy = {
        studyId: row.study_id,
        bitmarkAccount: row.bitmark_account,
        joinedDate: row.joined_date,
        lastTimeDonate: row.last_time_donate,
      };
      let tasks = await completedTasksModel.getLastCompletedTaskOfStudy(row.bitmark_account, row.study_id);
      userJoinedStudy.lastCompletedTasks = tasks;
      joinedStudies.push(userJoinedStudy);
    }
  }
  return joinedStudies;

};

const doGetJoinedStudiesOfAllUsers = async () => {
  let query = squel.select().from('data_donation.user_joined_study')
    .order('study_id')
    .toParam();
  let returnedData = await database.executeQuery(query);
  let joinedStudies = [];
  if (returnedData && returnedData.rows && returnedData.rows.length > 0) {
    for (let row of returnedData.rows) {
      let userJoinedStudy = {
        studyId: row.study_id,
        bitmarkAccount: row.bitmark_account,
        joinedDate: row.joined_date,
        lastTimeDonate: row.last_time_donate,
      };
      let tasks = await completedTasksModel.getLastCompletedTaskOfStudy(row.bitmark_account, row.study_id);
      userJoinedStudy.lastCompletedTasks = tasks;
      joinedStudies.push(userJoinedStudy);
    }
  }
};

const doCountNumberUserJoinStudies = async () => {
  let query = squel.select()
    .field('study_id')
    .field('count(*)', 'number')
    .from('data_donation.user_joined_study')
    .group('study_id')
    .toParam();
  let returnedData = await database.executeQuery(query);
  let results = {};
  if (returnedData && returnedData.rows && returnedData.rows.length > 0) {
    returnedData.rows.forEach((row) => {
      results[row.study_id] = row.number;
    });
  }
  return results;
};

module.exports = {
  doInsertUserJoinedStudy,
  doUpdateUserJoinedStudy,
  doDeleteUserJoinedStudy,
  doDeleteUserJoinedStudyByBitmarkAccount,
  doGetUserJoinedStudy,
  doGetJoinedStudiesOfUser,
  doGetAllUsersJoinOneStudy,
  doGetJoinedStudiesOfAllUsers,
  doCountNumberUserJoinStudies,
};
const _ = require('lodash');
const moment = require('moment');

const completedTasksModel = require('./completed-tasks-model');

const database = global.server.database;
const squel = global.server.database.squel;

// ================================================================================================================
// ================================================================================================================
const doUpdateLastAction = async (bitmarkAccount, lastAction) => {
  let query = squel.update().table('data_donation.user')
    .set('last_action', moment(lastAction ? lastAction : new Date()).format('YYYY-MM-DD HH:mm:ssZZ'))
    .where('last_action is null or last_action <= ?', moment(lastAction ? lastAction : new Date()).format('YYYY-MM-DD HH:mm:ssZZ'))
    .where('bitmark_account = ?', bitmarkAccount)
    .toParam();
  await database.executeQuery(query);
};

const doInsertUserInformation = async (userInformation, ) => {
  const query = squel.insert().into('data_donation.user')
    .set('bitmark_account', userInformation.bitmarkAccount)
    .set('created_at', moment(userInformation.createdAt ? userInformation.createdAt : new Date()).format('YYYY-MM-DD HH:mm:ssZZ'))
    .set('active_bhd_at', userInformation.activeBitmarkHealthDataAt ? moment(userInformation.activeBitmarkHealthDataAt).format('YYYY-MM-DD HH:mm:ssZZ') : null)
    .set('timezone', userInformation.timezone ? userInformation.timezone : null)
    .set('last_action', moment(userInformation.lastAction ? userInformation.lastAction : new Date()).format('YYYY-MM-DD HH:mm:ssZZ'))
    .toParam();
  await database.executeQuery(query);
};

const doUpdateUserInformation = async (userInformation, ) => {
  let query = squel.update().table('data_donation.user')
    .set('created_at', moment(userInformation.createdAt ? userInformation.createdAt : new Date()).format('YYYY-MM-DD HH:mm:ssZZ'))
    .set('active_bhd_at', userInformation.activeBitmarkHealthDataAt ? moment(userInformation.activeBitmarkHealthDataAt).format('YYYY-MM-DD HH:mm:ssZZ') : null)
    .set('timezone', userInformation.timezone ? userInformation.timezone : null)
    .set('last_action', moment(userInformation.lastAction ? userInformation.lastAction : new Date()).format('YYYY-MM-DD HH:mm:ssZZ'))
    .where("bitmark_account = ?", userInformation.bitmarkAccount)
    .toParam();
  await database.executeQuery(query);
};
// ================================================================================================================
// ================================================================================================================
const doGetUserInformationInternal = async (bitmarkAccount) => {
  const query = squel.select().from('data_donation.user')
    .where('bitmark_account = ?', bitmarkAccount)
    .toParam();
  let userInformation;
  let returnedData = await database.executeQuery(query);
  if (returnedData && returnedData.rows && returnedData.rows.length > 0) {
    userInformation = {
      bitmarkAccount: returnedData.rows[0].bitmark_account,
      createdAt: returnedData.rows[0].created_at,
      activeBitmarkHealthDataAt: returnedData.rows[0].active_bhd_at,
      timezone: returnedData.rows[0].timezone,
      lastAction: returnedData.rows[0].last_action,
    };
    userInformation.completedTasks = await completedTasksModel.doGetAllCompletedTasksOfUser(bitmarkAccount);
  }
  return userInformation;
};

const doGetUserInformation = async (bitmarkAccount) => {
  const query = squel.select().from('data_donation.user')
    .where('bitmark_account = ?', bitmarkAccount)
    .toParam();
  let userInformation;
  let returnedData = await database.executeQuery(query);
  if (returnedData && returnedData.rows && returnedData.rows.length > 0) {
    userInformation = {
      bitmarkAccount: returnedData.rows[0].bitmark_account,
      createdAt: returnedData.rows[0].created_at,
      activeBitmarkHealthDataAt: returnedData.rows[0].active_bhd_at,
      timezone: returnedData.rows[0].timezone,
      lastAction: returnedData.rows[0].last_action,
    };
    await doUpdateLastAction(bitmarkAccount);
    userInformation.completedTasks = await completedTasksModel.doGetAllCompletedTasksOfUser(bitmarkAccount);
  }
  return userInformation;
};

const doSaveUserInformation = async (userInformation) => {
  let oldUserInfo = await doGetUserInformation(userInformation.bitmarkAccount);
  oldUserInfo = oldUserInfo || {};
  let newUserInfo = _.merge({}, oldUserInfo, userInformation);
  if (oldUserInfo && oldUserInfo.bitmarkAccount) {
    await doUpdateUserInformation(newUserInfo);
  } else {
    await doInsertUserInformation(newUserInfo);
  }
  return {
    oldUserInformation: oldUserInfo,
    newUserInformation: newUserInfo,
  };
};

const doUpdateBitmarkHealthData = async (bitmarkAccount, activeBitmarkHealthDataAt) => {
  let query = squel.update().table('data_donation.user')
    .set('active_bhd_at', activeBitmarkHealthDataAt ? moment(activeBitmarkHealthDataAt).format('YYYY-MM-DD HH:mm:ssZZ') : null)
    .where("bitmark_account = ?", bitmarkAccount)
    .toParam();
  await database.executeQuery(query);
};


const doGetAllUserInformation = async () => {
  const query = squel.select().from('data_donation.user').toParam();
  let returnedData = await database.executeQuery(query);
  let results = [];
  if (returnedData && returnedData.rows && returnedData.rows.length > 0) {
    returnedData.rows.forEach(row => {
      let userInformation = {
        bitmarkAccount: row.bitmark_account,
        createdAt: row.created_at,
        activeBitmarkHealthDataAt: row.active_bhd_at,
        timezone: row.timezone,
        lastAction: row.last_action,
      };
      results.push(userInformation);
    });
  }
  return results;
};

module.exports = {
  doGetUserInformationInternal,
  doGetUserInformation,
  doSaveUserInformation,
  doUpdateBitmarkHealthData,
  doGetAllUserInformation,
};

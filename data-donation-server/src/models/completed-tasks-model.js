const moment = require('moment');

const database = global.server.database;
const squel = global.server.database.squel;

const doInsertCompletedTask = async (bitmarkAccount, taskType, completedAt, studyId, bitmark_id) => {
  const query = squel.insert().into('data_donation.completed_tasks')
    .set('bitmark_account', bitmarkAccount)
    .set('task_type', taskType)
    .set('completed_at', moment(completedAt).format('YYYY-MM-DD HH:mm:ssZZ'))
    .set('study_id', studyId ? studyId : '')
    .set('bitmark_id', bitmark_id ? bitmark_id : null)
    .toParam();

  await database.executeQuery(query);
};

const doGetCompletedTask = async (bitmarkAccount, taskType, studyId) => {
  const query = squel.select().from('data_donation.completed_tasks')
    .where('bitmark_account = ?', bitmarkAccount)
    .where('task_type = ?', taskType)
    .where('study_id = ?', studyId)
    .where('completed_status = ?', 'new')
    .toParam();
  let returnedData = await database.executeQuery(query);
  let result = null;
  if (returnedData && returnedData.rows && returnedData.rows.length > 0) {
    result = {
      bitmarkAccount: returnedData.rows[0].bitmark_account,
      taskType: returnedData.rows[0].task_type,
      completedAt: returnedData.rows[0].completed_at,
      studyId: returnedData.rows[0].study_id,
      bitmarkId: returnedData.rows[0].bitmark_id,
    };
  }
  return result;
};

const doUpdateCompletedTask = async (bitmarkAccount, taskType, completedAt, studyId, bitmarkId, newCompletedAt) => {
  let query = squel.update().table('data_donation.completed_tasks')
    .set('completed_at', moment(newCompletedAt).format('YYYY-MM-DD HH:mm:ssZZ'));
  if (studyId) {
    query = query.set('study_id', studyId ? studyId : null);
  }
  if (bitmarkId) {
    query = query.set('bitmark_id', bitmarkId ? bitmarkId : null);
  }
  query = query.where('bitmark_account = ?', bitmarkAccount)
    .where('task_type = ?', taskType)
    .where('completed_at = ?', moment(completedAt).format('YYYY-MM-DD HH:mm:ssZZ'))
    .toParam();
  await database.executeQuery(query);
};

const doGetAllCompletedTasksOfUser = async (bitmarkAccount, taskType, studyId) => {
  let query = squel.select().from('data_donation.completed_tasks')
    .where('bitmark_account = ?', bitmarkAccount);
  query = taskType ? query.where('task_type  = ?', taskType) : query;
  query = studyId ? query.where('study_id  = ?', studyId) : query;
  query = query.toParam();

  let returnedData = await database.executeQuery(query);
  let results = [];
  if (returnedData && returnedData.rows && returnedData.rows.length > 0) {
    returnedData.rows.forEach(row => {
      let completedTask = {
        bitmarkAccount: row.bitmark_account,
        taskType: row.task_type,
        completedAt: row.completed_at,
        studyId: row.study_id,
        bitmarkId: row.bitmark_id,
      };
      results.push(completedTask);
    });
  }
  return results;
};

const doGetAllCompletedTasks = async () => {
  let query = squel.select().from('data_donation.completed_tasks').toParam();
  let returnedData = await database.executeQuery(query);
  let results = [];
  if (returnedData && returnedData.rows && returnedData.rows.length > 0) {
    returnedData.rows.forEach(row => {
      let completedTask = {
        bitmarkAccount: row.bitmark_account,
        taskType: row.task_type,
        completedAt: row.completed_at,
        studyId: row.study_id,
        bitmarkId: row.bitmark_id,
      };
      results.push(completedTask);
    });
  }
  return results;
};

const doGetAllRemainCompletedTasks = async () => {
  let query = squel.select().from('data_donation.completed_tasks')
    .where('transfer_data IS NOT NULL')
    .where('study_id IS NOT NULL')
    .toParam();
  let returnedData = await database.executeQuery(query);
  let results = [];
  if (returnedData && returnedData.rows && returnedData.rows.length > 0) {
    returnedData.rows.forEach(row => {
      let completedTask = {
        bitmarkAccount: row.bitmark_account,
        taskType: row.task_type,
        completedAt: row.completed_at,
        studyId: row.study_id,
        bitmarkId: row.bitmark_id,
      };
      results.push(completedTask);
    });
  }
  return results;
};

const doGetLastCompletedTaskOfStudy = async (bitmarkAccount, studyId) => {
  const query = squel.select().from('data_donation.completed_tasks')
    .field('MAX(completed_at)', 'completed_at')
    .field('task_type')
    .where('bitmark_account = ?', bitmarkAccount)
    .where('study_id  = ?', studyId)
    .where('completed_status = ?', 'new')
    .group('task_type')
    .group('study_id')
    .toParam();
  let returnedData = await database.executeQuery(query);
  let results = {};
  if (returnedData && returnedData.rows && returnedData.rows.length > 0) {
    returnedData.rows.forEach(row => {
      results[row.task_type] = {
        completedAt: row.completed_at,
      };
    });
  }
  return results;
};

const doDeleteAllTasks = async (bitmarkAccount, taskType, studyId) => {
  let query = squel.delete().from('data_donation.completed_tasks')
    .where('bitmark_account = ?', bitmarkAccount);
  if (taskType) {
    query = query.where('task_type = ?', taskType);
  }
  if (taskType) {
    query = query.where('study_id = ?', studyId);
  }
  query = query.toParam();
  await database.executeQuery(query);
};

const doInformUserJoinStudyAgain = async (bitmarkAccount, studyId) => {
  let query = squel.update().table('data_donation.completed_tasks')
    .set('completed_status', 'old')
    .where('bitmark_account = ?', bitmarkAccount)
    .where('study_id = ?', studyId)
    .where('completed_status != ?', 'old')
    .toParam();
  await database.executeQuery(query);
};


module.exports = {
  doInsertCompletedTask,
  doGetCompletedTask,
  doUpdateCompletedTask,
  doGetAllCompletedTasks,
  doGetAllRemainCompletedTasks,
  doGetAllCompletedTasksOfUser,
  doGetLastCompletedTaskOfStudy,
  doDeleteAllTasks,
  doInformUserJoinStudyAgain,
};


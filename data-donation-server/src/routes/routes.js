const apis = require('./../apis');
const config = global.server.config;

module.exports = (router) => {
  router.get('/s/api/user/:bitmark_account', apis.getUserInformation);
  router.post('/s/api/active-bhd', apis.activeBHD);
  router.post('/s/api/inactive-bhd', apis.inactiveBHD);

  router.post('/s/api/join-study', apis.joinStudy);
  router.post('/s/api/leave-study', apis.leaveStudy);

  router.post('/s/api/complete-task', apis.completedTask);
  router.get('/s/api/all-data-types', apis.getAllHealthKitDataTypes);

  if (config.network !== 'livenet') {
    router.get('/s/api/test/get-user-info', apis.testGetUserInfo);
    router.post('/s/api/test/update-time-joined-study', apis.testUpdateJoinedStudy);
    router.post('/s/api/test/update-completed-tasks', apis.testUpdateCompletedTasks);
    router.post('/s/api/test/insert-new', apis.insertNews);
  }
  return router;
};
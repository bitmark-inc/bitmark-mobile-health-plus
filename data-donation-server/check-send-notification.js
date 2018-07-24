let _ = require('lodash');

let config = require('./configs');
let common = require('./src/contexts/common');
global.server = _.merge({}, common);

let logUtil = require('./src/contexts/log-util');
logUtil.initialize(config.log);

let database = require('./src/contexts/database');
database.initialize(config.database);

class BitmarkError extends Error {
  constructor(message, beCode) {
    super(message || 'Internal error!');
    this.statusCode = 400;
    this.beCode = beCode;
  }
}

global.server = _.merge(global.server, {
  config: config,
  logger: logUtil.getLogger(),
  database: database,
  BitmarkError: BitmarkError,
});

require('./src/controllers/notification-controller').checkAndSendTaskNotifications(true);
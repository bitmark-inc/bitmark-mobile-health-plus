let winston = require('winston');
let path = require('path');
const mkdirp = require('mkdirp');

let logger;

let logUtil = {};
logUtil.initialize = (options) => {
  if (logger) {
    return;
  }
  if (!options || !options.logFolder) {
    throw new Error('No logFolder specified in options');
  }
  mkdirp.sync(options.logFolder, { mode: '755' });
  let loggerTransports = [
    new (winston.transports.File)({
      filename: path.join(options.logFolder, (options.name || 'bitmark.log')),
      name: options.name || 'bitmark',
      level: options.level || 'debug',
      maxFiles: options.maxFiles || 10,
      maxsize: options.maxSize || 1024 * 1024,
      tailable: true,
      timestamp: true,
    }),
  ];

  if (options.console) {
    loggerTransports.push(new (winston.transports.Console)({
      level: options.level || 'debug',
    }));
  }

  logger = new (winston.Logger)({
    transports: loggerTransports,
  });
};
logUtil.getLogger = () => {
  if (!logger) {
    throw new Error('Need initialize first!');
  }
  return logger;
};
module.exports = logUtil;
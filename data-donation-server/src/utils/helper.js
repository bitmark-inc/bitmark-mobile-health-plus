const randomstring = require('randomstring');
const nacl = require('tweetnacl-nodewrap');
const BitmarkSDK = require('bitmark-sdk');
const axios = require('axios');

const config = global.server.config;
const logger = global.server.logger;
/**
 * get random string with length and type random 
 * ("alphanumeric" - [0-9 a-z A-Z], "alphabetic" - [a-z A-Z], "numeric" - [0-9], "hex" - [0-9 a-f], "custom" - any given characters)
 * length (default = 8), type (default = "alphanumeric")
 * @param {number} length
 * @param {string} type  
 */
const customRandom = (length, type) => {
  return randomstring.generate({
    length: length || 8,
    charset: type || 'alphanumeric',
  });
};

const responseError = (res, error) => {
  let statusCode = error.statusCode || 500;
  res.status(statusCode);
  res.send({
    error: statusCode === 500 ? 'Internal error!' : error.message,
    beCode: error.beCode,
  });
};

const validSignature = (message, signature, bitmarkAccount) => {
  try {
    let network = config.network === 'livenet' ? 'livenet' : 'testnet';
    message = Buffer.from(message);
    let publicKey = new BitmarkSDK.AccountNumber(bitmarkAccount, network).getPublicKey();
    publicKey = Buffer.from(publicKey, 'hex');
    signature = Buffer.from(signature, 'hex');
    if (nacl.sign.detached.verify(message, signature, publicKey)) {
      return true;
    }
    return false;
  } catch (error) {
    logger.error('Can not valid signature :', error);
    return false;
  }
};

const doTryRequestSendNotification = (account, title, message, data) => {
  let requestData = {
    title: '',
    message,
    account,
    source: 'bitmark-data-donation',
    data,
  };
  console.log(config.notification_server_url + '/api/push_notifications');
  console.log('requestData :', requestData);
  axios.post(config.notification_server_url + '/api/push_notifications', requestData).catch(error => {
    logger.error('doTryRequestSendNotification error:', { account, title, message, data, error });
  });
};

const delay = (timeout) => {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
};

module.exports = {
  randomString: customRandom,
  responseError,
  validSignature,
  doTryRequestSendNotification,
  delay,
};
let _ = require('lodash');

let defaultConfig = require('./default');

let bitmarkConfigFile = './bitmark-data-donation.local.config.json';
if (process.env.BITMARK_CONFIGURATION) {
  bitmarkConfigFile = process.env.BITMARK_CONFIGURATION;
}

console.log('bitmarkConfigFile :', bitmarkConfigFile);
let customConfig = require(bitmarkConfigFile);

let config = _.merge(
  defaultConfig.config,
  customConfig || {}
);

let checkRequireValue = (obj) => {
  for (let key in obj) {
    let value = obj[key];
    if (value === defaultConfig.requireValue) {
      throw new Error(`Configuration require for key '${key}'`);
    } else if (typeof (value) === 'object') {
      checkRequireValue(value);
    }
  }
};

checkRequireValue(config);

if (config.network === 'devnet') {
  config.data_donation_app_url = 'datadonationdevnet://';
} else if (config.network === 'testnet') {
  config.data_donation_app_url = 'datadonationtestnet://';
} else {
  config.data_donation_app_url = 'datadonation://';
}

console.log('config =========================================== :', config);

module.exports = config;
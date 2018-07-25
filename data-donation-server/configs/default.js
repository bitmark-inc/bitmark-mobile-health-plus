const path = require('path');

const REQUIRE_IMPLEMENTED = 'require-implemented';
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const defaultConfig = {
  // =========================================================================================
  // mode debug to log info for debugging.
  log_levels: logLevels,
  // =========================================================================================
  log: {
    logFolder: '', // require
    name: 'bitmark-data-donation', // default : bitmark
    level: 'debug', // default : debug
    maxFiles: 100, // default : 10
    maxSize: 1024 * 1024, // default 1024 * 1024
    console: true, // show in console or not, default : false
  },
  port: 9001,
  ip: '127.0.0.1',
  database: {
    "user": "bitmark_data_donation",
    "password": "@CHANGE-TO-SECURE-PASSWORD@",
    "host": "127.0.0.1",
    "port": 5432,
    "database": "bitmark"
  },

  check_issue_transfer_time: 1 * 60 * 1000, //1 minute


  save_folder: path.join(__dirname, './../save'),
  app_info_file_path: REQUIRE_IMPLEMENTED,

  server_url: 'https://bot.devel.bitmark.com:8001',
  notification_server_url: REQUIRE_IMPLEMENTED,
  api_server_url: REQUIRE_IMPLEMENTED,

  data_donation_app_url: 'datadonation://',
  time_checking_donation: 10, // minute


  // study1
  // 'testnet'
  // // f1f1b7f85b380eb4c7abc618a572bc4be4e2f8e5f314d1bdda6b30902fbe4fa7
  // 'etyyA1kvF3JKixKcoQUS6QZJXzG3ysR6ASnozFn1eCiVz54Etu';
  // 'livenet'
  // // 947822eb1e9b3165d4145126b8257a5cde3cf6231e07772c5609ec71725eed42
  // 'aznbeBdXq4e3DVdM4gB9CGHf8YAJFhE3wSqh2egxEGaixVZkX8';
  // 'devnet'
  // 'f6fJDATp6amNEGqChPFhA4ir4z7QFCx3ouTKrjtCL5vtYtsQZJ';

  //study2
  // 'testnet'
  // // a6f4cc6cdd1cf9e2b76eeb42a1fe50cc6ac2b97631791597b1b66277910dd6f7
  // 'fkQe9gh6gVGBaetyJAPnSW3SV7MLFx58Tsu3FiBcce3tjahod2';
  // 'livenet'
  // // 947822eb1e9b3165d4145126b8257a5cde3cf6231e07772c5609ec71725eed42
  // 'bhNzBDSgG3hbf6BbCvnHJrqQrdB6UqBdp27pmhbBmf6ZmY2g3b';
  // 'devnet'
  // 'f6fJDATp6amNEGqChPFhA4ir4z7QFCx3ouTKrjtCL5vtYtsQZJ';

  studies: {
    study1: {
      researcher_account: REQUIRE_IMPLEMENTED,
    },
    study2: {
      researcher_account: REQUIRE_IMPLEMENTED,
    }
  },
  schedule_donation: '0 * * * *',
  time_per_day: 24 * 60 * 60 * 1000,
  check_tasks_time: 6 * 60 * 60 * 1000,

  network: 'devnet',
};

module.exports = {
  config: defaultConfig,
  requireValue: REQUIRE_IMPLEMENTED
};
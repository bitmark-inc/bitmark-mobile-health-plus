const pg = require('pg');


const beginTransaction = (client) => {
  return new Promise((resolve, reject) => {
    client.query('BEGIN', function (error) {
      if (error) {
        reject(error);
      } else {
        resolve(client);
      }
    });
  });
};

const executeQueries = (client, queries) => {
  let tasks = queries.map((query) => {
    return new Promise((resolve, reject) => {
      client.query(query.text, query.values, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  });
  return Promise.all(tasks);
};

const rollbackTransaction = (client) => {
  return new Promise((resolve) => {
    client.query('ROLLBACK', resolve);
  });
};

const commitTransaction = (client) => {
  return new Promise((resolve) => {
    client.query('COMMIT', resolve);
  });
};

let database = {
  pool: null,
  squel: require('squel').useFlavour('postgres'),

  initialize: (configuration) => {
    database.pool = new pg.Pool(configuration);
    database.pool.on('error', function (err) {
      console.error('Database connection error', err.message, err.stack);
      throw err;
    });

    // database.squel.registerValueHandler(Date, function (date) {
    //   return date.toUTCString();
    // });

    // disable auto converting to Date object
    let types = require('pg').types;
    let TIMESTAMPTZ_OID = 1184;
    let TIMESTAMP_OID = 1114;
    let INT8_TYPE = 20;
    let NUMERIC_TYPE = 1700;
    types.setTypeParser(TIMESTAMP_OID, value => {
      return new Date(value).toISOString();
    });
    types.setTypeParser(TIMESTAMPTZ_OID, value => {
      return new Date(value).toISOString();
    });
    types.setTypeParser(INT8_TYPE, function (val) {
      return parseInt(val);
    });
    types.setTypeParser(NUMERIC_TYPE, function (val) {
      return parseFloat(val);
    });
  },

  executeQuery(query) {
    return new Promise((resolve, reject) => {
      database.pool.connect((error, client, done) => {
        if (error) {
          done();
          reject(error);
          return;
        }
        client.query(query.text, query.values, (error, result) => {
          done();
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      });
    });
  },
  executeQueriesInTransaction(queries) {
    return new Promise((resolve, reject) => {
      database.pool.connect((error, client, done) => {
        if (error) {
          done();
          reject(error);
        } else {
          beginTransaction(client).
            then(() => {
              executeQueries(client, queries);
            }).
            then(() => {
              commitTransaction(client);
            }).
            then(resolve).
            catch(() => {
              rollbackTransaction(client).then(reject);
            }).
            then(done);
        }
      });
    });
  },

};

module.exports = database;
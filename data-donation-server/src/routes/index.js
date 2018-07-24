const express = require('express');

const logger = global.server.logger;

let router = express.Router();
// ============================================================================================================================
// ============================================================================================================================
// new >=1.5
router = require('./routes')(router);

// ============================================================================================================================
// ============================================================================================================================
// ============================================================================================================================
// ============================================================================================================================

router.get('/api/health', async (req, res) => {
  const database = global.server.database;
  const config = global.server.config;
  try {
    let query = database.squel.select().from('pg_catalog.pg_user')
      .where('usename = ?', config.database.user)
      .toParam();
    let returnedData = await database.executeQuery(query);
    if (returnedData && returnedData.rows && returnedData.rows.length > 0) {
      res.status(200);
      res.send({ ok: true });
    } else {
      res.status(500);
      res.send({ ok: false });
    }
  } catch (error) {
    console.log('error :', error);
    res.status(500);
    res.send({ ok: false });
  }
});

router.use('/status', (req, res) => {
  logger.info('get status api: ');
  res.send({ status: 'OK' });
});

router.get('/error', (req, res) => {
  logger.info('error page');
  let errorMessage = req.query.error;
  res.send(errorMessage);
});

router.get('/inform', (req, res) => {
  logger.info('inform message page');
  let message = req.query.message;
  res.send({ message: message, });
});

router.get('/*', (req, res) => {
  logger.info('404 page');
  res.send({
    message: 'Page not found!'
  });
});

module.exports = router;
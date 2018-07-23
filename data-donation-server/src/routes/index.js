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
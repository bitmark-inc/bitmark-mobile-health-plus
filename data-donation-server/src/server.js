const express = require('express');
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');

const routes = require('./routes');
const notificaitonController = require('./controllers/notification-controller');

const config = global.server.config;
const logger = global.server.logger;

module.exports = {
  run: () => {
    let app = express();
    app.enable('trust proxy');
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
      extended: false
    }));
    app.use('/public', express.static(path.join(__dirname, './../public')));
    app.use('/', routes);

    let server = http.createServer(app);
    server.listen(config.port, config.ip, () => {
      notificaitonController.runInBackground();
      const {
        address,
        port
      } = server.address();
      logger.info('============================start serer=====================');
      logger.info(`server listening at http://${address}:${port}`);
    });
  }
};
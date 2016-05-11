'use strict';

const express = require('express');
const log4js = require('log4js');
const bodyParser = require('body-parser');
const CustomError = require('./libs/CustomError');
const app = express();

require('./libs/mongoose');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

if (app.get('env') !== 'test') {
  const connectLogger = log4js.connectLogger(
    log4js.getLogger('RESPONSE'),
    {level: 'auto', format: ':response-time (:remote-addr) :method :url :status'}
  );

  app.use(connectLogger);
  app.use((req, res, next) => {
    log4js
      .getLogger('REQUEST')
      .info(`${req.method} ${req.originalUrl}\n AUTH: ${req.get('Authorization')} \n QUERY: ${JSON.stringify(req.query)}`);

    next();
  });
}

// assign collections routes
const collections = require('./collections');
collections(app);

app.use((req, res, next) => next(new CustomError.NotImplementedError()));

app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    const old = err;

    err = new CustomError.BadRequestError(err.message, 400000);
    err.errors = old.errors;
  }

  const status = err.status || 500;
  res.status(status);

  res.send({
    code: err.code,
    status,
    error: err.name,
    message: err.message,
    errors: err.errors,
    stack: app.get('env') === 'development' && err.stack
  });

  /* eslint no-console: 0 */
  if (app.get('env') !== 'test' && status === 500) {
    log4js
      .getLogger('SYSTEM')
      .error(err);
  }
});

module.exports = app;

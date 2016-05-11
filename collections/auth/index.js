'use strict';

require('./models');

const passport = require('./passport');
const oauth2server = require('./oauth2orize');
const CustomError = require('../../libs/CustomError');

module.exports = app => {
  app.post('/oauth/token', [passport.client_credentials, oauth2server.token()]);
  app.all('/oauth/token', (req, res, next) => next(new CustomError.MethodNotAllowedError()));
};

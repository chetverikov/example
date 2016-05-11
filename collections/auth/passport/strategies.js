'use strict';

const strategies = module.exports;
const CustomError = require('../../../libs/CustomError');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

strategies.basic_handler = function(req, clientId, clientSecret, done) {
  if (!clientId || !ObjectId.isValid(clientId) || !clientSecret) {
    return done(new CustomError.UnauthorizedError('client_id and client_secret is required!', 'client_credentials_empty'), false);
  }

  return mongoose.model('Client')
    .findById(clientId)
    .exec()
    .then(client => {
      if (!client) {
        return Promise.reject(new CustomError.UnauthorizedError('Client not found', 'client_not_found'));
      }

      if (client.secret !== String(clientSecret)) {
        return Promise.reject(new CustomError.UnauthorizedError('Client secret is not valid', 'invalid_client_credentials'));
      }

      client.user_agent = req.headers['user-agent'];

      return done(null, client);
    })
    .catch(done);
};

strategies.client_password_handler = strategies.basic_handler;

strategies.bearer_handler = function(token, done) {
  if (!ObjectId.isValid(token)) {
    return done(new CustomError.UnauthorizedError('Token not found', 'token_not_found'));
  }

  return mongoose.model('AccessToken')
    .findById(token)
    .populate('user client')
    .exec()
    .then(token => {
      switch (true) {
        case !token:
          return Promise.reject(new CustomError.UnauthorizedError('Token not found', 'token_not_found'));

        case !token.user:
          return Promise.reject(new CustomError.UnauthorizedError('Invalid token. Unknown user', 'unknown_user_for_token'));

        case token.isClientToken():
          return Promise.reject(new CustomError.UnauthorizedError('Invalid token grant type', 'invalid_token_grant_type'));

        case token.isExpired():
          token.remove();
          return Promise.reject(new CustomError.UnauthorizedError('Token expired', 'token_expired'));
      }

      return done(null, token.user, {
        scope: '*',
        client: token.client,
        token
      });
    })
    .catch(done);
};

strategies.bearer_client_handler = function(token, done) {
  if (!ObjectId.isValid(token)) {
    return done(new CustomError.UnauthorizedError('Token not found', 'token_not_found'));
  }

  return mongoose.model('AccessToken')
    .findById(token)
    .populate('user client')
    .exec()
    .then(token => {
      switch (true) {
        case !token:
          return Promise.reject(new CustomError.UnauthorizedError('Token not found', 'token_not_found'));

        case !token.user:
          return Promise.reject(new CustomError.UnauthorizedError('Invalid token. Unknown user', 'unknown_user_for_token'));

        case token.isExpired():
          token.remove();
          return Promise.reject(new CustomError.UnauthorizedError('Token expired', 'token_expired'));
      }

      return done(null, token.user, {
        scope: '*',
        client: token.client,
        token
      });
    })
    .catch(done);
};

'use strict';

const exchanges = module.exports;
const config = require('../../../config');
const CustomError = require('../../../libs/CustomError');
const mongoose = require('mongoose');

/**
 * Handler для password exchange у oauth2orize
 *
 * @param client
 * @param email
 * @param password
 * @param done
 */
exchanges.password = function(client, email, password, done) {
  const User = mongoose.model('User');

  email = email.trim().toLowerCase();

  User
    .findByEmail(email, Object.keys(User.schema.paths).join(' '))
    .then(user => {
      if (!user) {
        return Promise.reject(new CustomError.UnauthorizedError('Invalid resource owner credentials', 'invalid_credentials'));
      }

      return User.encryptPassword(password, user.salt)
        .then(hash => {
          if (hash.toString() !== user.hash) {
            return Promise.reject(new CustomError.UnauthorizedError('Invalid resource owner credentials', 'invalid_credentials'));
          }

          return Promise.all([
            user,
            mongoose.model('AccessToken').createPasswordTokens(user, client.user_agent, client)
          ]);
        });
    })
    .then(data => {
      done(
        null,
        data[1].access.id,
        data[1].refresh.id,
        {
          expires_in: config.security.tokenLife,
          user: data[0]
        }
      );
    })
    .catch(done);
};

/**
 * Handler для client_credentials exchange у oauth2orize
 *
 * @param client
 * @param done
 */
exchanges.clientCredentials = function(client, done) {
  const options = {client, user_agent: client.user_agent};

  Promise.all([
    mongoose.model('AccessToken').findOne(options),
    mongoose.model('RefreshToken').findOne(options)
  ])
  .then(data => {
    if (!data[0] || data[0].isExpired()) {
      return mongoose.model('AccessToken').createClientTokens(client.user_agent, client);
    }

    return {
      access: data[0],
      refresh: data[1]
    };
  })
  .then(data => done(null, data.access.id, data.refresh.id, {expires_in: config.security.clientTokenLife}))
  .catch(done);
};

/**
 *
 * @param client
 * @param refresh
 * @param scope
 * @param done
 */
exchanges.refreshToken = function(client, refresh, scope, done) {
  if (!mongoose.Types.ObjectId.isValid(refresh)) {
    return done(new CustomError.UnauthorizedError('Token not found', 'token_not_found'));
  }

  return mongoose
    .model('RefreshToken')
    .findById(refresh)
    .populate('user')
    .exec()
    .then(token => {
      if (!token || !token.user) {
        return Promise.reject(new CustomError.UnauthorizedError('Invalid refresh token', 'token_not_found'));
      }

      return Promise.all([
        token.user,
        mongoose.model('AccessToken').createTokens({
          grant_type: token.grant_type,
          client,
          user: token.user,
          user_agent: client.user_agent
        })
      ]);
    })
    .then(data => {
      done(null, data[1].access.id, data[1].refresh.id, {
        expires_in: config.security.tokenLife,
        user: data[0]
      });
    })
    .catch(done);
};

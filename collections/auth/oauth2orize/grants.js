'use strict';

const grants = module.exports;
const mongoose = require('mongoose');

/**
 *
 * @param client
 * @param redirectURI
 * @param user
 * @param ares
 * @param done
 */
grants.code = function(client, redirectURI, user, ares, done) {
  return mongoose.model('Code')
    .create({
      client: client.id,
      redirectURI,
      user
    })
    .then(code => done(null, code.id))
    .catch(done);
};

/**
 *
 * @param client
 * @param user
 * @param ares
 * @param done
 */
grants.token = function(client, user, ares, done) {
  mongoose.model('AccessToken')
    .createImplicitToken(user, client.user_agent, client)
    .then(token => done(null, token.id))
    .catch(done);
};

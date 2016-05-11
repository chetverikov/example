'use strict';

const mongoose = require('mongoose');
const config = require('../../../config');
const Schema = mongoose.Schema;

const schema = {
  grant_type: {type: String, enum: ['password', 'client_credentials', 'implicit'], required: true},
  user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  client: {type: Schema.Types.ObjectId, ref: 'Client', required: true},
  created: {type: Date, default: Date.now},
  user_agent: String
};

const AccessToken = new Schema(schema);
const RefreshToken = new Schema(schema);

AccessToken.methods.isExpired = function() {
  const tokenLife = (this.grant_type === 'password') ? config.security.tokenLife : config.security.clientTokenLife;

  return Math.round((Date.now() - this.created) / 1000) > tokenLife;
};

AccessToken.methods.isClientToken = function() {
  return this.grant_type === 'client_credentials';
};

RefreshToken.methods.isClientToken = AccessToken.methods.isClientToken;

AccessToken.statics.createPasswordTokens = function(user, user_agent, client) {
  return mongoose.model('AccessToken').createTokens({
    grant_type: 'password',
    client,
    user,
    user_agent
  });
};

AccessToken.statics.createClientTokens = function(user_agent, client) {
  return mongoose.model('User')
    .getAnonymousUser()
    .then(user => {
      return mongoose.model('AccessToken').createTokens({
        grant_type: 'client_credentials',
        client,
        user,
        user_agent
      });
    });
};

AccessToken.statics.getTokens = function(data) {
  const access = mongoose.model('AccessToken');
  const refresh = mongoose.model('RefreshToken');

  return Promise.all([access.findOne(data), refresh.findOne(data)])
    .then(data => {
      return {
        access: data[0],
        refresh: data[1]
      };
    });
};

AccessToken.statics.createTokens = function(data) {
  const access = mongoose.model('AccessToken');
  const refresh = mongoose.model('RefreshToken');

  return access
    .findOne(data, '_id created')
    .exec()
    .then(exists => {
      if (exists && !exists.isExpired()) {
        return access.getTokens(data);
      }

      if (exists && exists.isExpired()) {
        return access.removeAndCreateToken(data);
      }

      return Promise.all([access.create(data), refresh.create(data)]);
    })
    .then(tokens => {
      const result = {
        access: tokens[0] || tokens.access,
        refresh: tokens[1] || tokens.refresh
      };

      result.access.user = result.refresh.user = data.user;

      return result;
    });
};

AccessToken.statics.removeAndCreateToken = function(data) {
  const access = mongoose.model('AccessToken');
  const refresh = mongoose.model('RefreshToken');

  return Promise.all([access.remove(data), refresh.remove(data)])
    .then(() => Promise.all([access.create(data), refresh.create(data)]))
    .then(data => {
      return {
        access: data[0],
        refresh: data[1]
      };
    });
};

module.exports.refresh = mongoose.model('RefreshToken', RefreshToken);
module.exports.access = mongoose.model('AccessToken', AccessToken);

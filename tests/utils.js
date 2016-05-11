'use strict';

const assert = require('assert');
const mongoose = require('mongoose');
const ObjectID = mongoose.Types.ObjectId;
const request_client = require('./lib/request');
const config = require('../config');
const app = require('../app');

const utils = {
  request: request_client(app),

  generateAuthorizationCase: (oneCase) => {
    it(oneCase.name, () => {
      let request = utils
        .request[oneCase.request.method](oneCase.request.path)
        .set(oneCase.request.headers)
        .send(oneCase.request.data)
        .expect(oneCase.response.code || 200);

      if (oneCase.response.validTokens !== undefined) {
        request = request.expect(response => {
          const body = response.body;

          if (oneCase.response.validTokensResponse) {
            if (!utils.isValidTokens(body)) {
              throw new TypeError('Invalid token in response');
            }

            if (!utils.isValidExpires(body.expires_in)) {
              throw new TypeError('Invalid expires in response');
            }
          } else {
            if (utils.isValidTokens(body)) {
              throw new TypeError('Valid token in response');
            }

            if (utils.isValidExpires(body.expires_in)) {
              throw new TypeError('Valid expires in response');
            }
          }
        });
      }

      return request;
    });
  },

  generateEndpointCase: (oneCase) => {
    it(oneCase.name, () => {
      const authType = oneCase.authType ? oneCase.authType : 'client';
      const func = authType === 'client' ? utils.createClientAndAuth : utils.createUserAndAuth;

      return func()
        .then(data => {
          let request = utils
            .request[oneCase.request.method](oneCase.request.path)
            .bearer(data.tokens.access_token)
            .send(oneCase.request.data)
            .expect(oneCase.response.code || 200);

          if (oneCase.response.body) {
            request = request.expect(response => {
              const dertyClone = JSON.parse(JSON.stringify(response.body));

              /* eslint no-underscore-dangle: 0 */
              delete dertyClone.result._id;
              delete dertyClone.result.__v;
              delete dertyClone.result.author;
              delete dertyClone.result.editor;
              delete dertyClone.result.createdAt;
              delete dertyClone.result.updatedAt;

              assert.deepEqual(dertyClone, oneCase.response.body);
            });
          }

          return request;
        });
    });
  },

  generateCommentCase: (oneCase) => {
    it(oneCase.name, () => {
      return utils.createUserAndAuth()
        .then(data => {
          let request = utils
            .request[oneCase.request.method](oneCase.request.path)
            .bearer(data.tokens.access_token)
            .send(oneCase.request.data)
            .expect(oneCase.response.code || 200);

          if (oneCase.response.body) {
            request = request.expect(response => {
              const dertyClone = JSON.parse(JSON.stringify(response.body));

              /* eslint no-underscore-dangle: 0 */
              delete dertyClone.result._id;
              delete dertyClone.result.__v;
              delete dertyClone.result.author;
              delete dertyClone.result.editor;
              delete dertyClone.result.createdAt;
              delete dertyClone.result.updatedAt;

              assert.deepEqual(oneCase.response.body, dertyClone);
            });
          }

          return request;
        });
    });
  },

  isValidTokens: (tokens) => {
    return ObjectID.isValid(tokens.access_token) && ObjectID.isValid(tokens.refresh_token);
  },

  isValidExpires: (expires, type) => {
    if (type === 'client_credetials') {
      return config.security.clientTokenLife === expires;
    }

    return config.security.tokenLife === expires;
  },

  createClientAndAuth: () => {
    if (utils.clientAndTokens) {
      return Promise.resolve(utils.clientAndTokens);
    }

    return mongoose.model('Client').findById('528f1ecfc567b6f5ce25ceed')
      .then(client => {
        return utils.getClientTokens()
          .then(tokens => {
            utils.clientAndTokens = {
              client,
              tokens
            };

            return utils.clientAndTokens;
          });
      });
  },

  createUserAndAuth: () => {
    if (utils.userAndTokens) {
      return Promise.resolve(utils.userAndTokens);
    }

    return mongoose.model('User')
      .create({email: 'foo@bar.com', password: 'foo', display_name: 'Foo Bar'})
      .then(user => {
        return utils.getTokens(user)
          .then(tokens => {
            utils.userAndTokens = {
              user,
              tokens
            };

            return utils.userAndTokens;
          });
      });
  },

  getClientTokens: () => {
    return utils.request
      .post('/oauth/token')
      .auth('528f1ecfc567b6f5ce25ceed', 'foo')
      .send({grant_type: 'client_credentials'})
      .then(response => response.body);
  },

  getTokens: (user) => {
    return utils.request
      .post('/oauth/token')
      .auth('528f1ecfc567b6f5ce25ceed', 'foo')
      .send({username: user.email, password: user.password, grant_type: 'password'})
      .then(response => response.body);
  },

  restoreData: (collection) => {
    const inserts = [];

    Object.keys(collection).forEach(modelName => {
      inserts.push(
        utils.insertCollection(modelName, collection[modelName])
      );
    });

    return Promise.all(inserts);
  },

  insertCollection: (model, collection) => {
    return mongoose.model(model).create(collection);
  },

  clearCollections: (collection) => {
    const removes = [];

    Object.keys(collection).forEach(modelName => {
      removes.push(mongoose.model(modelName).remove());
    });

    utils.userAndTokens = null;
    utils.clientAndTokens = null;

    return Promise.all(removes);
  }
};

module.exports = utils;

'use strict';

/* eslint max-nested-callbacks: 0 */

const assert = require('assert');
const utils = require('../utils');
const dumps = require('../dumps/authorization.json');
const AuthorizationCases = require('../cases/authorization.json');
const mongoose = require('mongoose');

describe('AuthorizationEndpoints', () => {
  before(() => utils.restoreData(dumps));

  AuthorizationCases.cases.forEach(oneCase => utils.generateAuthorizationCase(oneCase));

  it('Should be equal tokens when request is executed twice client_credetials', () => {
    return utils.request
      .post('/oauth/token')
      .auth('528f1ecfc567b6f5ce25ceed', 'foo')
      .send({grant_type: 'client_credentials'})
      .then(res => res.body)
      .then(previous => {
        return utils.request
          .post('/oauth/token')
          .auth('528f1ecfc567b6f5ce25ceed', 'foo')
          .send({grant_type: 'client_credentials'})
          .then(res => {
            assert.deepEqual(res.body, previous);
          });
      });
  });

  it('Should be not equal tokens when request is executed twice client_credetials', () => {
    return utils.request
      .post('/oauth/token')
      .auth('528f1ecfc567b6f5ce25ceed', 'foo')
      .send({grant_type: 'client_credentials'})
      .then(res => {
        const previous = res.body;

        return mongoose.model('AccessToken')
          .findById(previous.access_token)
          .exec()
          .then(access_token => {
            var date = new Date();
            date.setFullYear(date.getFullYear() - 2);
            access_token.created = date;
            return access_token.save();
          })
          .then(() => previous);
      })
      .then(previous => {
        return utils.request
          .post('/oauth/token')
          .auth('528f1ecfc567b6f5ce25ceed', 'foo')
          .send({grant_type: 'client_credentials'})
          .then(res => {
            assert.notDeepEqual(res.body, previous);
          });
      });
  });

  it('Should respond with a 401 status when client tokens is expired', () => {
    return utils.request
      .post('/oauth/token')
      .auth('528f1ecfc567b6f5ce25ceed', 'foo')
      .send({grant_type: 'client_credentials'})
      .then(res => {
        const previous = res.body;

        return mongoose.model('AccessToken')
          .findById(previous.access_token)
          .exec()
          .then(access_token => {
            var date = new Date();
            date.setFullYear(date.getFullYear() - 2);
            access_token.created = date;
            return access_token.save();
          })
          .then(() => previous);
      })
      .then(previous => {
        return utils.request
          .get('/')
          .bearer(previous.access_token)
          .expect(401);
      });
  });

  it('Should respond with a 401 status when user tokens is expired', () => {
    return utils.request
      .post('/oauth/token')
      .auth('528f1ecfc567b6f5ce25ceed', 'foo')
      .send({username: 'foo@bar.com', password: 'foo', grant_type: 'password'})
      .then(res => {
        const previous = res.body;

        return mongoose.model('AccessToken')
          .findById(previous.access_token)
          .exec()
          .then(access_token => {
            var date = new Date();
            date.setFullYear(date.getFullYear() - 2);
            access_token.created = date;
            return access_token.save();
          })
          .then(() => previous);
      })
      .then(previous => {
        return utils.request
          .get('/users/self')
          .bearer(previous.access_token)
          .expect(401);
      });
  });

  it('Should be respond new tokens when old is expires', () => {
    return utils.request
      .post('/oauth/token')
      .auth('528f1ecfc567b6f5ce25ceed', 'foo')
      .send({username: 'foo@bar.com', password: 'foo', grant_type: 'password'})
      .then(res => {
        const previous = res.body;

        return mongoose.model('AccessToken')
          .findById(previous.access_token)
          .exec()
          .then(access_token => {
            var date = new Date();
            date.setFullYear(date.getFullYear() - 2);
            access_token.created = date;
            return access_token.save();
          })
          .then(() => previous);
      })
      .then(previous => {
        return utils.request
          .post('/oauth/token')
          .auth('528f1ecfc567b6f5ce25ceed', 'foo')
          .send({username: 'foo@bar.com', password: 'foo', grant_type: 'password'})
          .then(res => {
            assert.notDeepEqual(res.body, previous);
          });
      });
  });

  it('Should be respond new tokens on refresh token', () => {

    return utils.request
      .post('/oauth/token')
      .auth('528f1ecfc567b6f5ce25ceed', 'foo')
      .send({grant_type: 'client_credentials'})
      .then(response => {
        if (!utils.isValidTokens(response.body)) {
          throw new Error('Invalid tokens');
        }

        return utils.request
          .post('/oauth/token')
          .auth('528f1ecfc567b6f5ce25ceed', 'foo')
          .send({grant_type: 'refresh_token', refresh_token: response.body.refresh_token})
          .expect(200)
          .then(response_new => assert.notDeepEqual(response_new.body, response.body));
      });
  });

  it('Should be respond user object', () => {
    const should = {
      email: 'foo@bar.com',
      display_name: 'Foo Bar'
    };

    return utils.request
      .post('/oauth/token')
      .auth('528f1ecfc567b6f5ce25ceed', 'foo')
      .send({grant_type: 'password', username: 'foo@bar.com', password: 'foo'})
      .then(response => {
        return utils.request
          .get('/users/self?fields=email display_name')
          .bearer(response.body.access_token)
          .send()
          .expect(200);
      })
      .then(res => {
        delete res.body.result._id;
        assert.deepEqual(res.body.result, should);
      });
  });

  it('Should be respond index object', () => {
    return utils.request
      .post('/oauth/token')
      .auth('528f1ecfc567b6f5ce25ceed', 'foo')
      .send({grant_type: 'client_credentials'})
      .then(response => {
        return utils.request
          .get('/')
          .bearer(response.body.access_token);
      });
  });

  it('Should be respond 401 when invalid grant type', () => {
    return utils.request
      .post('/oauth/token')
      .auth('528f1ecfc567b6f5ce25ceed', 'foo')
      .send({grant_type: 'client_credentials'})
      .then(response => {
        return utils.request
          .get('/users/self')
          .bearer(response.body.access_token)
          .expect(401);
      });
  });

  after(() => utils.clearCollections(dumps));
});

'use strict';

/* eslint max-nested-callbacks: 0 */

const utils = require('../utils');
const authorizationDumps = require('../dumps/authorization.json');

describe('Main', () => {
  before(() => utils.restoreData(authorizationDumps));

  it('Should respond with 501 a status code when called not implemented endpoints', () => {
    return utils.createClientAndAuth()
      .then(data => {
        return utils.request
          .get('/bla/foo')
          .bearer(data.tokens.access_token)
          .expect(501);
      });
  });

  it('Should respond with 405 a status code when called not allowed method', () => {
    return utils.createClientAndAuth()
      .then(data => {
        return utils.request
          .post('/')
          .bearer(data.tokens.access_token)
          .expect(405);
      });
  });

  after(() => utils.clearCollections(authorizationDumps));
});

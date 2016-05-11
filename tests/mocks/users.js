'use strict';

/* eslint max-nested-callbacks: 0 */

const utils = require('../utils');
const authorizationDumps = require('../dumps/authorization.json');
const UsersCases = require('../cases/users.json');

describe('UsersEndpoints', () => {
  before(() => utils.restoreData(authorizationDumps));

  UsersCases.cases.forEach(oneCase => utils.generateEndpointCase(oneCase));

  after(() => utils.clearCollections(authorizationDumps));
});

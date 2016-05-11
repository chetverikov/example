'use strict';

/* eslint no-process-env: 0 */
const test_env = process.env.NODE_ENV && process.env.NODE_ENV === 'test';

module.exports = require(test_env ? './config.json' : './config.test.json');

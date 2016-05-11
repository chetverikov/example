'use strict';

const supertest = require('supertest');
let methods = require('http').METHODS.map(method => method.toLowerCase());

methods = methods.concat('del');

/* eslint no-invalid-this: 0 */

/**
 * Init promise in request instance
 *
 * @returns {Promise}
 */
function promiseInit() {
  if (this.promise) {
    return this.promise;
  }

  const defer = Promise.defer();

  this.promise = defer.promise;
  this.end((err, res) => {
    if (err) {
      err.message = res.text;
      err.res = res;
      defer.reject(err);
      return Promise.resolve();
    }

    return defer.resolve(res);
  });

  return this.promise;
}

/**
 *
 * @param arg
 * @returns {Promise}
 */
function then(...arg) {
  return this.promiseInit().then(...arg);
}

/**
 * Helper for set Authorization Bearer token
 *
 * @param token
 * @returns {Request}
 */
function bearer(token) {
  return this.set('Authorization', `Bearer ${token}`);
}

/**
 * Wrapper for request
 *
 * @param factory
 * @returns {Object}
 */
function wrap(factory) {
  var out = {};

  methods.forEach(method => {
    out[method] = function(...arg) {
      const test = factory[method](...arg);

      test.promiseInit = promiseInit;
      test.then = then;
      test.bearer = bearer;

      return test;
    };
  });

  return out;
}

module.exports = (...arg) => {
  const request = supertest(...arg);
  return wrap(request);
};

module.exports.agent = (...arg) => {
  const agent = supertest.agent(...arg);
  return wrap(agent);
};

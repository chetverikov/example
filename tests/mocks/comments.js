'use strict';

/* eslint max-nested-callbacks: 0 */

const assert = require('assert');
const utils = require('../utils');
const dumps = require('../dumps/comments.json');
const authorizationDumps = require('../dumps/authorization.json');
const CommentsCases = require('../cases/comments.json');
const mongoose = require('mongoose');

describe('CommentsEndpoints', () => {
  let tokens = null;
  let user = null;

  before(() => utils.restoreData(authorizationDumps));
  before(() => {
    return utils.createUserAndAuth()
      .then(data => {
        user = data.user;
        tokens = data.tokens;

        dumps.Comment.forEach(comment => {
          comment.author = comment.editor = user._id;
        });

        return utils.restoreData(dumps);
      });
  });

  CommentsCases.cases.forEach(oneCase => utils.generateEndpointCase(oneCase));

  it('Should respond depth', () => {
    return utils.createUserAndAuth()
      .then(data => {
        return mongoose.model('Comment')
          .create({
            text: 'foo 1',
            item: '000000000000000000000001',
            author: data.user,
            editor: data.user
          })
          .then(foo_1 => {
            return mongoose.model('Comment').create({
              text: 'foo 2',
              item: '000000000000000000000001',
              parent: foo_1,
              author: data.user,
              editor: data.user
            });
          })
          .then(foo_2 => {
            return mongoose.model('Comment').create({
              text: 'foo 3',
              item: '000000000000000000000001',
              parent: foo_2,
              author: data.user,
              editor: data.user
            });
          })
          .then(foo_3 => {
            return utils.request
              .get(`/comments/${foo_3.id}/depth`)
              .bearer(data.tokens.access_token)
              .then(response => {
                assert.deepEqual({result: {depth: 2}}, response.body);
              });
          });
      });
  });

  after(() => utils.clearCollections(dumps));
  after(() => utils.clearCollections(authorizationDumps));
});

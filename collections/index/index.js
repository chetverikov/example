'use strict';

const express = require('express');
const Router = express.Router;
const router = new Router();
const passport = require('../auth/passport');
const CustomError = require('../../libs/CustomError');

router.get('/', passport.bearer_client, (req, res) => {
  res.send({
    index: '/',
    comments: '/comments'
  });
});

router.all('/', (req, res, next) => next(new CustomError.MethodNotAllowedError()));

module.exports = function(app) {
  app.use('/', router);
};

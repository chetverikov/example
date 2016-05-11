'use strict';

const Endpoints = require('./Endpoints');
const Router = require('express').Router;
const router = new Router();
const endpoints = new Endpoints();
const bootstrap = require('../../libs/bootstrapHelpers');
const passport = require('../auth/passport');
const CustomError = require('../../libs/CustomError');
const notImplemented = (req, res, next) => next(new CustomError.MethodNotAllowedError());

const routes = [
  {path: '/', method: 'get', handle: 'list', middlewares: [passport.bearer_client]},
  {path: '/', method: 'post', handle: 'create', middlewares: [passport.bearer]},
  {path: '/:id', method: 'get', handle: 'one', middlewares: [passport.bearer_client]},
  {path: '/:id', method: 'put', handle: 'update', middlewares: [passport.bearer]},
  {path: '/:id', method: 'delete', handle: 'delete', middlewares: [passport.bearer]},
  {path: '/:id/depth', method: 'get', handle: 'depth', middlewares: [passport.bearer_client]}
];

bootstrap.assignRoutes(routes, router, endpoints);

router.all('/:id/depth', notImplemented);
router.all('/:id', notImplemented);
router.all('/', notImplemented);

module.exports = app => app.use('/comments', router);

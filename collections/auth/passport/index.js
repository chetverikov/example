'use strict';

const passport = require('passport');
const strategies = require('./strategies');
const mongoose = require('mongoose');
const ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
const BasicStrategy = require('passport-http').BasicStrategy;
const BearerStrategy = require('passport-http-bearer').Strategy;

passport.use(new BasicStrategy({passReqToCallback: true}, strategies.basic_handler));
passport.use(new BearerStrategy(strategies.bearer_handler));
passport.use('bearer-client', new BearerStrategy(strategies.bearer_client_handler));
passport.use(new ClientPasswordStrategy({passReqToCallback: true}, strategies.client_password_handler));

module.exports.client_credentials = passport.authenticate(['basic', 'oauth2-client-password'], {session: false, failWithError: true});
module.exports.bearer = passport.authenticate('bearer', {session: false, failWithError: true});
module.exports.bearer_client = passport.authenticate('bearer-client', {session: false, failWithError: true});

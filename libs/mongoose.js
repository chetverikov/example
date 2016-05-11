'use strict';

const mongoose = require('mongoose');
const config = require('../config');

/* eslint no-console: 0 */

mongoose.connect(config.mongoose.uri);
mongoose.connection.on('error', err => {
  console.error('connection error:', err.message);
  process.exit(1);
});
mongoose.connection.once('connected', () => {
  console.log('mongoose connected');
});

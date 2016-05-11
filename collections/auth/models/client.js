'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Client = new Schema({
  name: {
    type: String,
    unique: true,
    required: true
  },

  secret: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Client', Client);

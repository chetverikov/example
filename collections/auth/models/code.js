'use strict';

const mongoose = require('mongoose');
const config = require('../../../config');
const Schema = mongoose.Schema;
const timeLife = config.security.codeLife;

const Code = new Schema({
  user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  client: {type: Schema.Types.ObjectId, ref: 'Client'},
  redirectURI: String,
  created: {
    type: Date,
    default: Date.now
  }
});

Code.methods.isExpired = function() {
  return Math.round((Date.now() - this.created) / 1000) > timeLife;
};

Code.virtual('code').get(function() {
  return this._id.toString();
});

Code.statics.createUserCode = function(user){
  return mongoose.model('Code').create({user: user});
};

module.exports = mongoose.model('Code', Code);

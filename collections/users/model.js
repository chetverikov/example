'use strict';

/* eslint no-invalid-this: 0 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const crypto = require('crypto');
const validate = require('mongoose-validator');
const anonymous_reg = /^anonymous@host.local/;

const UserSchema = new Schema({
  email: {type: String, validate: validate({validator: 'isEmail'}), required: true},

  display_name: {type: String, required: true},
  name: {
    family_name: String,
    given_name: String
  },

  photo: String,
  birthday: Date,
  gender: {type: String, enum: ['male', 'female'], default: 'male'},

  hash: {type: String, required: true, select: false},
  salt: {type: String, required: true, select: false}
}, {timestamps: true});

UserSchema.index({email: 1});

UserSchema.pre('validate', function(next) {
  if (this.isNew) {
    this.salt = this.constructor.generateSalt();

    return this.constructor
      .encryptPassword(this.password, this.salt)
      .then(hash => {
        this.hash = hash;

        next();
      })
      .catch(next);
  }

  return next();
});

UserSchema.virtual('password')
  .get(function() {
    return this.$password;
  })
  .set(function(val) {
    this.$password = val;
  });

UserSchema.statics.generateSalt = function() {
  return crypto.randomBytes(128).toString('base64');
};

UserSchema.statics.findByEmail = function(...args) {
  if (args.length > 0) {
    args[0] = {email: new RegExp(`^${args[0]}$`, 'i')};
  }

  return this.findOne(...args);
};

UserSchema.statics.encryptPassword = function(password, salt) {
  if (typeof password !== 'string') {
    password = String(password);
  }

  const defer = Promise.defer();

  crypto.pbkdf2(password, salt, 100, 512, 'sha512', (err, hash) => {
    if (err) {
      defer.reject(err);
    } else {
      defer.resolve(hash.toString());
    }
  });

  return defer.promise;
};

UserSchema.statics.getAnonymousUser = function() {
  return mongoose.model('User').findOne({email: anonymous_reg})
    .exec()
    .then(user => user ? user : Promise.reject(new Error('Anonymous not found.')));
};

UserSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.hash;
    delete ret.salt;

    return ret;
  }
});

module.exports = mongoose.model('User', UserSchema);

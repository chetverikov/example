'use strict';

const Endpoint = require('../../libs/Endpoint');
const CustomError = require('../../libs/CustomError');
const model = require('./model');

class UsersEndpoints extends Endpoint {
  constructor() {
    super();
    this.model = model;
  }

  create(req, res) {
    const data = req.body;

    if (!req.body.email) {
      return Promise.reject(new CustomError.BadRequestError('Param email is required'));
    }

    if (!req.body.password) {
      return Promise.reject(new CustomError.BadRequestError('Param password is required'));
    }

    if (!req.body.display_name) {
      return Promise.reject(new CustomError.BadRequestError('Param display_name is required'));
    }

    return this.isExistUser(data.email)
      .then(exist => {
        if (exist) {
          throw new CustomError.ConflictError('User with this email already exists');
        }

        return super.create(req, res);
      });
  }

  self(req) {
    req.params.id = req.user._id;

    return super.one(req);
  }

  selfUpdate(req, res) {
    req.params.id = req.user._id;

    return super.update(req, res);
  }

  isExistUser(email) {
    email = email.trim().toLowerCase();

    return this.model.findOne({email})
      .exec()
      .then(user => Boolean(user));
  }
}

module.exports = UsersEndpoints;

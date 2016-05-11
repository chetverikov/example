'use strict';

const Endpoint = require('../../libs/Endpoint');
const CustomError = require('../../libs/CustomError');
const model = require('./model');

class CommentsEndpoints extends Endpoint {
  constructor() {
    super();

    this.model = model;
  }

  depth(req) {
    return this.model.findById(req.params.id, 'path').lean()
      .exec()
      .then(doc => {
        if (!doc) {
          throw new CustomError.NotFoundError();
        }

        return this.formatterEntity({
          _id: doc.id,
          depth: doc.path.split(':').length
        });
      });
  }
}

module.exports = CommentsEndpoints;

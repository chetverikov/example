'use strict';

const mongoose = require('mongoose');
const CustomError = require('../../libs/CustomError');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({

  /**
   * Path to comment in tree (delimiter : )
   * If comment in root of tree path is empty
   *
   * example:
   *  507f1f77bcf86cd799439011:507f1f77bcf86cd799439012:507f1f77bcf86cd799439012
   */
  path: {type: String, default: ''},
  parent: {type: Schema.Types.ObjectId},

  /**
   * ID of commented entity
   */
  item: {type: Schema.Types.ObjectId, required: true},

  text: {type: String, required: true},

  status: {type: String, enum: ['moderate', 'active', 'removed'], default: 'moderate'},

  author: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  editor: {type: Schema.Types.ObjectId, ref: 'User', required: true}
}, {timestamps: true});

/**
 * Hook for recalculate path
 */
CommentSchema.pre('validate', function(next) {

  /* eslint no-invalid-this: 0 */
  const model = this.constructor;

  if (this.isModified('parent')) {
    return model.findById(this.parent, 'path')
      .exec()
      .then(parent => {
        if (!parent) {
          throw new CustomError.BadRequestError(`Parent ${this.parent} not found`);
        }

        let path = [];

        if (parent.path.length) {
          path = parent.path.split(':');
        }

        path.push(parent._id);

        this.path = path.join(':');

        return next();
      })
      .catch(next);
  }

  return next();
});

module.exports = mongoose.model('Comment', CommentSchema);

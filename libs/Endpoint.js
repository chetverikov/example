'use strict';

const CustomError = require('../libs/CustomError');

class Endpoint {

  /**
   * Format entities response
   *
   * @param req Request object
   * @param data Data from database
   * @returns {Promise}
   */
  formatterList(req, data) {
    const skip = req.query.skip;
    const limit = req.query.limit;
    const result = {
      result: data,
      meta: {
        count: (data && data.length) || 0,
        page: Math.ceil(skip / limit) + 1,
        skip,
        limit
      }
    };

    return this.model.count(req.query.filters)
      .then(total => {
        result.meta.total = total;
        result.meta.pages = Math.ceil(total / limit);

        return result;
      });
  }

  /**
   * Format entity response
   *
   * @param data Data from database
   * @returns {{result: *}}
   */
  formatterEntity(data) {
    return {
      result: data
    };
  }

  /**
   * Resource (GET /:id)
   * @param req
   * @returns {Promise}
   */
  one(req) {
    return this.model.findById(req.params.id, req.query.fields)
      .exec()
      .then(doc => {
        if (!doc) {
          throw new CustomError.NotFoundError(`Entity #${req.params.id} not found`);
        }

        return this.formatterEntity(doc);
      });
  }

  /**
   * Resources (GET /)
   *
   * @param req
   * @returns {Promise}
   */
  list(req) {
    const options = {
      limit: req.query.limit,
      skip: req.query.skip,
      sort: req.query.sort
    };

    return this.model.find(req.query.filters, req.query.fields, options)
      .exec()
      .then(doc => this.formatterList(req, doc));
  }

  /**
   * Create resource (POST /)
   *
   * @param req
   * @param res
   * @returns {Promise}
   */
  create(req, res) {
    res.status(201);
    req.body.author = req.body.editor = req.user;

    return this.model.create(req.body)
      .then(doc => {
        req.params.id = doc.id;

        return this.one(req);
      });
  }

  /**
   * Update resource (PUT /:id)
   *
   * @param req
   * @returns {Promise}
   */
  update(req) {
    req.body.editor = req.user;

    return this.model
      .findById(req.params.id)
      .exec()
      .then(doc => {
        if (!doc) {
          throw new CustomError.NotFoundError(`Entity #${req.params.id} not found`);
        }

        doc.set(req.body);

        return doc.save();
      })
      .then(doc => this.one(req));
  }

  /**
   * Update resource (DELETE /:id)
   *
   * @param req
   * @returns {Promise}
   */
  delete(req) {
    return this.model
      .findById(req.params.id, {lean: true})
      .exec()
      .then(doc => {
        if (!doc) {
          throw new CustomError.NotFoundError(`Entity #${req.params.id} not found`);
        }

        return doc.remove();
      });
  }
}

module.exports = Endpoint;

'use strict';

class BadRequestError extends Error {
  constructor(msg = 'Bad Request', code) {
    super();

    this.name = 'BadRequestError';
    this.status = 400;
    this.message = msg;
    this.code = code;
  }
}
class UnauthorizedError extends Error {
  constructor(msg = 'Unauthorized', code) {
    super();

    this.name = 'UnauthorizedError';
    this.status = 401;
    this.message = msg;
    this.code = code;
  }
}
class NotFoundError extends Error {
  constructor(msg = 'Not Found', code) {
    super();

    this.name = 'NotFoundError';
    this.status = 404;
    this.message = msg;
    this.code = code;
  }
}
class MethodNotAllowedError extends Error {
  constructor(msg = 'Method Not Allowed', code) {
    super();

    this.name = 'MethodNotAllowedError';
    this.status = 405;
    this.message = msg;
    this.code = code;
  }
}
class ConflictError extends Error {
  constructor(msg = 'Conflict', code) {
    super();

    this.name = 'ConflictError';
    this.status = 409;
    this.message = msg;
    this.code = code;
  }
}
class InternalServerError extends Error {
  constructor(msg = 'Internal Server Error', code) {
    super();

    this.name = 'InternalServerError';
    this.status = 500;
    this.message = msg;
    this.code = code;
  }
}
class NotImplementedError extends Error {
  constructor(msg = 'Not Implemented', code) {
    super();

    this.name = 'NotImplementedError';
    this.status = 501;
    this.message = msg;
    this.code = code;
  }
}

class CustomError extends Error {}

CustomError.BadRequestError = BadRequestError;
CustomError.UnauthorizedError = UnauthorizedError;
CustomError.NotFoundError = NotFoundError;
CustomError.MethodNotAllowedError = MethodNotAllowedError;
CustomError.ConflictError = ConflictError;
CustomError.InternalServerError = InternalServerError;
CustomError.NotImplementedError = NotImplementedError;

module.exports = CustomError;

"use strict";

const errorApi = require("../../providers/errors/apiError");
const logger = require("../../providers/logging/logger")();

module.exports = () => {
  return function(req, res, next) {
    res.error = errorApi;
    res.logger = logger;

    return next();
  };
};

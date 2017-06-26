"use strict";

import errorApi from "../../providers/errors/apiError";
import log from "../../providers/logging/logger";

export default () => function (req, res, next) {
  res.error = errorApi;
  res.logger = log();

  return next();
};

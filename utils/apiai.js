"use strict";

const Bluebird = require("bluebird");
const config = require("../config/config-loader").load();
const apiaiSDK = require("apiai");
const ApiAiTokens = require("../models/apiai.model");
const DEFAULT_TOKEN = config.apiai.token;
const logger = require("../providers/logging/logger");

apiaiSDK.textRequestAsync = (message, opts, locale) => {
  logger.debug(`Apiai request for locale: ${locale}`);

  return ApiAiTokens.findOne({ locale })
    .then((token) => {
      logger.debug(`Apiai token for ${locale}:${token ? "FOUND" : "DEFAULT"}`);
      return apiaiSDK(token || DEFAULT_TOKEN);
    })
    .then((apiai) => new Bluebird((resolve, reject) => {
      const request = apiai.textRequest(message, opts);

      request.on("response", (response) => resolve(response));

      request.on("error", (error) => reject(error));

      request.end();
    }));
};
module.exports = apiaiSDK;

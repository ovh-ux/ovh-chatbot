"use strict";

const { Wit, log } = require("node-wit");
const config = require("../config/config-loader").load();

const client = new Wit({
  accessToken: config.wit.token,
  logger: new log.Logger(log.DEBUG)
});

module.exports = client;

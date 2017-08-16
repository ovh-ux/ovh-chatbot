"use strict";

const winston = require("winston");
const config = require("../../config/config-loader").load();

winston.add(require("ovh-winston-ldp"), {
  graylogOvhTokenKey: process.env.THOT_TOKEN_NAME || "X-OVH-TOKEN",
  graylogOvhTokenValue: process.env.THOT_TOKEN_VALUE || config.graylog.token,
  graylogFacility: "NodeJS",
  level: "debug",
  graylogHost: process.env.THOT_HOST || config.graylog.host,
  graylogPort: process.env.THOT_PORT || config.graylog.port
});

winston.level = "debug";

module.exports = winston;

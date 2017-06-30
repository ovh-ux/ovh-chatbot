"use strict";

import * as winston from "winston";
// import * as ovhWinston from "ovh-winston-ldp";
// import * as cfg from "../../config/config-loader";
// const config = cfg.load();

export default () => {
  // winston.add(ovhWinston, {
  //   graylogOvhTokenKey: process.env.THOT_TOKEN_NAME || "X-OVH-TOKEN",
  //   graylogOvhTokenValue: process.env.THOT_TOKEN_VALUE || config.graylog.token,
  //   graylogFacility: "NodeJS",
  //   level: "debug",
  //   graylogHost: process.env.THOT_HOST || config.graylog.host,
  //   graylogPort: process.env.THOT_PORT || config.graylog.port
  // });

  return winston;
};

"use strict";

module.exports = {
  name: "ovh-chatbot",
  server: {
    port: process.env.APP_PORT || 8080,
    url: process.env.APP_URL || "https://bot.uxlabs.ovh",
    basePath: "/api/v1.0",
    logType: "dev",
    corsOrigin: process.env.CORS_ORIGIN || "*"
  },
  mongo: {
    url: process.env.MONGO || "mongodb://mongo:27017",
    debug: false
  },
  ovh: {
    appKey: process.env.OVH_KEY,
    appSecret: process.env.OVH_SECRET,
    urlBasePath: process.env.OVH_BASE_PATH || "https://www.ovh.com/engine/apiv6"
  },
  apiai: {
    token: process.env.APIAI_TOKEN
  },
  graylog: {
    host: "discover.logs.ovh.com",
    port: 12202,
    token: process.env.GRAYLOG_TOKEN
  },
  ndhURL: process.env.NDH_URL,
  ndhTOKEN: process.env.NDH_TOKEN,
  historyLength: 50,
  maxMessageLength: 1000,
  maxMessageLengthString: "TOOLONG"
};

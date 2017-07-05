"use strict";

module.exports = {
  server: {
    port: process.env.APP_PORT || 8080,
    url: process.env.APP_URL || "https://bot.uxlabs.ovh",
    basePath: "/api/v1.0",
    logType: "dev"
  },
  slack: {
    clientId: process.env.SLACK_ID,
    clientSecret: process.env.SLACK_SECRET,
    token: process.env.SLACK_TOKEN,
    accessToken: process.env.SLACK_ACCESS_TOKEN
  },
  facebook: {
    appSecret: process.env.FB_APP_SECRET,
    pageAccessToken: process.env.FB_APP_ACCESS_TOKEN,
    validationToken: process.env.FB_VALIDATION_TOKEN
  },
  apiai: {
    token: process.env.APIAI_TOKEN
  },
  redirectUrl: "https://bot.uxlabs.ovh/api/v1.0/ovh"
};

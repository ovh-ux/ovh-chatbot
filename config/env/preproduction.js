"use strict";

module.exports = {
  server: {
    port: process.env.APP_PORT || 8080,
    url: process.env.APP_URL_PREPROD || "https://bot.uxlabs.ovh",
    basePath: "/api/v1.0",
    logType: "dev"
  },
  slack: {
    clientId: process.env.SLACK_ID_PREPROD,
    clientSecret: process.env.SLACK_SECRET_PREPROD,
    token: process.env.SLACK_TOKEN_PREPROD,
    accessToken: process.env.SLACK_ACCESS_TOKEN_PREPROD
  },
  facebook: {
    appSecret: process.env.FB_APP_SECRET_PREPROD,
    pageAccessToken: process.env.FB_APP_ACCESS_TOKEN_PREPROD,
    validationToken: process.env.FB_VALIDATION_TOKEN
  },
  twitter: {
    apiKey: process.env.TWITTER_API_KEY_PREPROD,
    appSecret: process.env.TWITTER_API_SECRET_PREPROD,
    clientAccessToken: process.env.TWITTER_ACCESS_TOKEN_PREPROD,
    clientAccessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET_PREPROD,
    appId: process.env.TWITTER_APP_ID_PREPROD
  },
  apiai: {
    token: process.env.APIAI_TOKEN_PREPROD
  },
  redirectUrl: `${process.env.APP_URL_PREPROD || "https://bot.uxlabs.ovh"}/api/v1.0/ovh`
};

"use strict";

export default {
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
  apiai: {
    token: process.env.APIAI_TOKEN_PREPROD
  },
  redirectUrl: "https://bot.uxlabs.ovh/api/v1.0/ovh"
};

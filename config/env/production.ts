"use strict";

export default {
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

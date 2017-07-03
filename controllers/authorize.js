"use strict";

const config = require("../config/config-loader").load();
const User = require("../models/users.model");
const ovh = require("ovh");

module.exports = function () {
  return {
    getAuthorize (req, res) {
      let senderId = req.query.state;
      let platform = "unknown";
      const ovhClient = ovh({
        endpoint: "ovh-eu",
        appKey: config.ovh.appKey,
        appSecret: config.ovh.appSecret
      });
      let consumerInfos = {};

      if (senderId.match(/-(facebook_messenger|slack-\w*)/g)) {
        platform = senderId.match(/-(facebook_messenger|slack-\w*)/g)[0];
      }

      senderId = senderId.replace(/-(facebook_messenger|slack-\w*)/g, "");

      return ovhClient
        .requestPromised("POST", "/auth/credential", {
          accessRules: [{ method: "GET", path: "/*" }],
          redirection: `${config.redirectUrl}?state=${senderId}`
        })
        .then((resp) => {
          consumerInfos = resp;

          return User.findOne({ senderId });
        })
        .then((userRaw) => {
          const user = !userRaw ? new User({ senderId, consumerKey: consumerInfos.consumerKey, consumerKeyTmp: consumerInfos.consumerKey, platform }) : userRaw;
          user.consumerKeyTmp = consumerInfos.consumerKey;
          user.connected = true;

          return user.save();
        })
        .then(() => res.redirect(consumerInfos.validationUrl))
        .catch(() => {
          const errorApi = res.error(403, "Unable to connect");

          req.logger.error(errorApi);

          return res.status(errorApi.statusCode, errorApi);
        });
    }
  };
};

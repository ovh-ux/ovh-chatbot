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
      let team_id;

      if (senderId.match(/-(facebook_messenger|slack)/g) && senderId.match(/-(facebook_messenger|slack)/g).length > 1) {
        platform = senderId.match(/-(facebook_messenger|slack)/g)[1];
      }

      if (platform === "slack" && senderId.match(/-slack-(\w*)/g) && senderId.match(/-slack-(\w*)/g).length > 1) {
        team_id = senderId.match(/-slack-(\w*)/g)[1];
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
          console.log("userRaw", userRaw);
          const user = !userRaw ? new User({ senderId, consumerKey: consumerInfos.consumerKey, consumerKeyTmp: consumerInfos.consumerKey, platform, team_id }) : userRaw;
          console.log("user : ", user);
          user.team_id = team_id;
          user.consumerKeyTmp = consumerInfos.consumerKey;
          user.connected = true;

          console.log("user updated: ", user);
          return user.save();
        })
        .then((resp) => {
          console.log("resp : ", resp);
          return res.redirect(consumerInfos.validationUrl);
        })
        .catch(() => {
          const errorApi = res.error(403, "Unable to connect");

          req.logger.error(errorApi);

          return res.status(errorApi.statusCode, errorApi);
        });
    }
  };
};

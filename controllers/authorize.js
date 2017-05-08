"use strict";

const config = require("../config/config-loader").load();
const User = require("../models/users.model");
const ovh = require("ovh");

module.exports = function () {
  return {

    getAuthorize(req, res) {
      let senderId = req.query.state;
      const platform = getPlatform(senderId);
      let ovhClient = ovh({
        endpoint: "ovh-eu",
        appKey: config.ovh.appKey,
        appSecret: config.ovh.appSecret
      });
      let consumerInfos = {};

      senderId = senderId.replace(/-(facebook_messenger|slack)/g, "");

      return ovhClient.requestPromised("POST", "/auth/credential", {
        accessRules: [
          { method: "GET", path: "/*"}
        ],
        redirection: `${config.redirectUrl}?state=${senderId}`
      })
      .then((resp) => {
        consumerInfos = resp;

        return User.findOne({ senderId });
      })
      .then((user) => {
        if (!user) {
          user = new User({ senderId, consumerKey: consumerInfos.consumerKey, consumerKeyTmp: consumerInfos.consumerKey, platform });
        } else {
          user.consumerKeyTmp = consumerInfos.consumerKey;
          user.connected = true;
        }

        return user.save();
      })
      .then(() => res.redirect(consumerInfos.validationUrl))
      .catch(() => {
        let errorApi = res.error(403, "Unable to connect");

        req.logger.error(errorApi);

        return res.status(errorApi.statusCode, errorApi);
      });
    }

  };
};

function getPlatform(senderId) {
  if (senderId.indexOf("-slack") !== -1) {
    return "slack";
  }

  if (senderId.indexOf("-facebook_messenger") !== -1) {
    return "facebook_messenger";
  }
}

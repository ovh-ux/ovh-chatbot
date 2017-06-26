"use strict";

import * as cfg from "../config/config-loader";
import User from "../models/users.model";
import * as ovh from "ovh";
const config = cfg.load();

export default () => {
  return {
    getAuthorize (req, res) {
      let senderId = req.query.state;
      const platform = getPlatform(senderId);
      const ovhClient = ovh({
        endpoint: "ovh-eu",
        appKey: config.ovh.appKey,
        appSecret: config.ovh.appSecret
      });
      let consumerInfos: any = {};

      senderId = senderId.replace(/-(facebook_messenger|slack)/g, "");

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

function getPlatform (senderId) {
  if (senderId.indexOf("-slack") !== -1) {
    return "slack";
  }

  if (senderId.indexOf("-facebook_messenger") !== -1) {
    return "facebook_messenger";
  }

  return "unknown";
}

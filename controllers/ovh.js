"use strict";

const ovh = require("ovh");
const config = require("../config/config-loader").load();
const messenger = require("../platforms/messenger/messenger");
const User = require("../models/users.model");
const slackSDK = require("../platforms/slack/slack");
const translator = require("../utils/translator");
const logger = require("../providers/logging/logger");

module.exports = () => ({
  getAuth (req, res) {
    const senderId = req.query.state;
    let userInfos;

    return User.findOne({ senderId })
      .exec()
      .then((user) => {
        user.connected = true;
        user.consumerKey = user.consumerKeyTmp;
        userInfos = user;

        return user.save();
      })
      .then(() => {
        const ovhClient = ovh({
          appKey: config.ovh.appKey,
          appSecret: config.ovh.appSecret,
          consumerKey: userInfos.consumerKey
        });

        return ovhClient.requestPromised("GET", "/me");
      })
      .then((meInfos) => {
        let locale = meInfos.language;
        welcome(senderId, meInfos, userInfos);
        return res.render("authorize", { paragraph: translator("view-connected", locale, meInfos.nichandle), title: translator("view-title", locale) });
      })
      .catch((err) => {
        const errorApi = res.error(403, err);
        User.remove({ senderId }).exec();

        return res.status(errorApi.statusCode).json(errorApi);
      });
  }
});

function welcome (senderId, meInfos, userInfos) {
  switch (userInfos.platform) {
  case "facebook_messenger": {
    messenger
      .send(senderId, translator("connectedAs", meInfos.language, meInfos.nichandle))
      .catch(logger.error);
    break;
  }
  case "slack": {
    slackSDK(userInfos.team_id)
    .then((slack) => slack.send(senderId, translator("connectedAs", meInfos.language, meInfos.nichandle)))
    .catch(logger.error);
    break;
  }
  default: break;
  }
}

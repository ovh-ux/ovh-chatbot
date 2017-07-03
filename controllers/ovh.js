"use strict";

const ovh = require("ovh");
const config = require("../config/config-loader").load();
const messenger = require("../platforms/messenger/messenger");
const User = require("../models/users.model");
const responsesCst = require("../constants/responses").FR;
const slackSDK = require("../platforms/slack/slack");

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
        welcome(senderId, meInfos, userInfos);
        return res.render("authorize", { user: meInfos });
      })
      .catch((err) => {
        const errorApi = res.error(403, err);
        User.remove({ senderId });

        return res.status(errorApi.statusCode).json(err);
      });
  }
});

function welcome (senderId, meInfos, userInfos) {
  switch (userInfos.platform) {
  case "facebook_messenger": {
    messenger
      .sendTextMessage(senderId, responsesCst.welcome_logged.replace("%s", meInfos.nichandle))
      .then(() => messenger.sendTextMessage(senderId, "Rassure toi je vais apprendre à t'aider sur d'autres sujets dans un avenir proche :)"))
      .catch(console.error);
    break;
  }
  case "slack": {
    const slack = slackSDK(userInfos.team_id);
    slack.sendTextMessage(senderId, responsesCst.welcome_logged.replace("%s", meInfos.nichandle))
      .then(() => slack.sendTextMessage(senderId, "Rassure toi je vais apprendre à t'aider sur d'autres sujets dans un avenir proche :)"))
      .catch(console.error);
    break;
  }
  default: break;
  }
}

"use strict";

const Slack = require("slack-node");
const Bluebird = require("bluebird");
const SlackModel = require("../../models/slack.models");
const { ButtonsListMessage, ButtonsMessage, TextMessage, CardMessage } = require("../generics");
const { textMessageAdapter, buttonsMessageAdapter, cardMessageAdapter } = require("./slack_adapters");
const POST_MESSAGE = "chat.postMessage";
const UPDATE_MESSAGE = "chat.update";

function getSlackApi (team_id) {
  return SlackModel.findOne({ team_id }).exec().then((slackInfos) => {
    const slack = Bluebird.promisifyAll(new Slack(slackInfos.bot.bot_access_token));

    slack.send = (channel, message, message_ts = null) => {
      if (typeof message === "string" || message instanceof TextMessage) {
        return slack.apiAsync(message_ts != null ? UPDATE_MESSAGE : POST_MESSAGE, textMessageAdapter(channel, message, message_ts));
      }

      if (message instanceof ButtonsListMessage || message instanceof ButtonsMessage) {
        return slack.apiAsync(message_ts != null ? UPDATE_MESSAGE : POST_MESSAGE, buttonsMessageAdapter(channel, message, message_ts));
      }

      if (message instanceof CardMessage) {
        return slack.apiAsync(message_ts != null ? UPDATE_MESSAGE : POST_MESSAGE, cardMessageAdapter(channel, message, message_ts));
      }

      return slack.apiAsync(POST_MESSAGE, message);
    };

    return slack;
  });
}

module.exports = getSlackApi;

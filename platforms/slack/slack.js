"use strict";

const Slack = require("slack-node");
const Bluebird = require("bluebird");
const SlackModel = require("../../models/slack.model");
const { ButtonsListMessage, ButtonsMessage, TextMessage } = require("../generics");
const { textMessageAdapter, buttonsMessageAdapter } = require("./slack_adapters");
const POST_MESSAGE = "chat.postMessage";
const UPDATE_MESSAGE = "chat.update";

function getSlackApi (team_id) {
  return SlackModel.findOne({ team_id }).exec().then((slackInfos) => {
    const slack = Bluebird.promisifyAll(new Slack(slackInfos.bot.bot_access_token));

    slack.send = (channel, message, message_ts, locale) => {
      if (typeof message === "string" || message instanceof TextMessage) {
        return slack.apiAsync(message_ts ? UPDATE_MESSAGE : POST_MESSAGE, textMessageAdapter(channel, message, message_ts, locale));
      }

      if (message instanceof ButtonsListMessage || message instanceof ButtonsMessage) {
        return slack.apiAsync(message_ts ? UPDATE_MESSAGE : POST_MESSAGE, buttonsMessageAdapter(channel, message, message_ts, locale));
      }

      return slack.apiAsync(POST_MESSAGE, message);
    };

    return slack;
  });
}

module.exports = getSlackApi;

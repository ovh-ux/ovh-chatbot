"use strict";

const Slack = require("slack-node");
const Bluebird = require("bluebird");
const SlackModel = require("../../models/slack.models");
const { ButtonsListMessage, ButtonsMessage, TextMessage } = require("../generics");
const { textMessageAdapter, buttonsMessageAdapter } = require("./slack_adapters");
const POST_MESSAGE = "chat.postMessage";

function getSlackApi (team_id) {
  return SlackModel.findOne({ team_id }).exec().then((slackInfos) => {
    const slack = Bluebird.promisifyAll(new Slack(slackInfos.bot.bot_access_token));

    slack.sendTextMessage = (channel, text) => slack.apiAsync(POST_MESSAGE, { channel, text });

    slack.sendButtonMessage = (channel, messageData, deleteOriginal = false) => {
      const params = {
        channel,
        replace_original: false,
        delete_original: deleteOriginal,
        attachments: JSON.stringify(messageData)
      };

      return slack.apiAsync(POST_MESSAGE, params);
    };

    slack.send = (channel, message) => {
      if (typeof message === "string") {
        return slack.sendTextMessage(channel, message);
      }

      if (message instanceof TextMessage) {
        return slack.sendTextMessage(channel, textMessageAdapter(message));
      }

      if (message instanceof ButtonsListMessage || message instanceof ButtonsMessage) {
        const messageData = buttonsMessageAdapter(message);
        let promise;

        if (Array.isArray(messageData.actionsStr) && messageData.actionsStr.length) {
          promise = Bluebird.each(messageData.actionsStr, (msg) => slack.sendTextMessage(channel, msg));
        }

        return Bluebird.all([promise, slack.sendButtonMessage(channel, messageData.attachments, messageData.delete_original)]);
      }

      return slack.apiAsync(POST_MESSAGE, message);
    };

    return slack;
  });
}

module.exports = getSlackApi;

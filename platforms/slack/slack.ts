"use strict";

import Slack from "slack-node";
import * as Bluebird from "bluebird";
import SlackModel from "../../models/slack.models";
import { ButtonsListMessage, ButtonsMessage, TextMessage } from "../generics";
import { textMessageAdapter, buttonsMessageAdapter } from "./slack_adapters";
const POST_MESSAGE = "chat.postMessage";

export default function getSlackApi (team_id: string) {
  return SlackModel.findOne({ team_id }).exec().then((slackInfos: any) => {
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

"use strict";

const Twitter = require("twitter");
const config = require("../../config/config-loader").load();
const { textMessageAdapter, buttonsMessageAdapter } = require("./twitter_adapter");
const { ButtonsMessage, ButtonsListMessage, TextMessage } = require("../generics");
const Bluebird = require("bluebird");

const client = new Twitter({
  consumer_key: config.twitter.apiKey,
  consumer_secret: config.twitter.appSecret,
  access_token_key: config.twitter.clientAccessToken,
  access_token_secret: config.twitter.clientAccessSecret
});

function sendDM (recipient_id, message_data) {
  return recipient_id === config.twitter.appId ? Bluebird.reject(new Error("You cannot send a dm to yourself")) : client.post("/direct_messages/events/new", {
    event: {
      type: "message_create",
      message_create: {
        target: {
          recipient_id
        },
        message_data
      }
    }
  });
}

function getUserInfo (user_id) {
  return client.get("/users/show", {
    user_id
  });
}

function send (senderId, message) {
  if (typeof message === "string" || message instanceof TextMessage) {
    return sendDM(senderId, textMessageAdapter(message));
  } else if (message instanceof ButtonsMessage || message instanceof ButtonsListMessage) {
    return sendDM(senderId, buttonsMessageAdapter(message));
  }
  return sendDM(senderId, message);

}

module.exports = {
  send,
  getUserInfo
};

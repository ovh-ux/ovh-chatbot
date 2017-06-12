"use strict";

const Bluebird = require("bluebird");
const { ButtonsListMessage, Button, TextMessage, ButtonsMessage} = require("../generics");
const WebMessage = require("../../models/web.model");
const config = require("../../config/config-loader").load();
const { camelCase } = require("lodash");

function getTextMessage(message) {
  return {
    message,
    buttons: []
  };
}

function getButton(button) {
  return {
    message: null,
    buttons: [
      button
    ]};
}

function getListButton(buttonList) {
  return {
    message: buttonList.text,
    buttons: buttonList.attachments.buttons || []
  };
}

function parseMsg(RawResponses) {
  let responses = (RawResponses.length == null || typeof RawResponses === "string") ? [RawResponses] : RawResponses;

  return responses.map((uResponse) => {
    if (typeof uResponse === "string") {
      return getTextMessage(uResponse);
    }

    if (uResponse instanceof TextMessage) {
      return getTextMessage(uResponse.text);
    }

    if (uResponse instanceof Button) {
      return getButton(uResponse);
    }

    if (uResponse instanceof ButtonsListMessage || uResponse instanceof ButtonsMessage) {
      return getListButton(uResponse);
    }

    return uResponse;
  });

}

function sendFeedback(senderId, intent, rawMessage) {
  let message = rawMessage.length >= config.maxMessageLength ? config.maxMessageLengthString : rawMessage;

  if (intent === "unknown") {
    return;
  }

  let buttons = [
    new Button("postback", `FEEDBACK_MISUNDERSTOOD_${camelCase(intent)}_${message}`, "Mauvaise compréhension"),
    new Button("postback", `FEEDBACK_BAD_${camelCase(intent)}_${message}`, "Non"),
    new Button("postback", `FEEDBACK_GOOD_${camelCase(intent)}_${message}`, "Oui")
  ];

  return send(null, senderId, new ButtonsListMessage("Est-ce que cette réponse vous a aidé ?", buttons));
}

function send(res, id, rawResponses, opt) {
  let flagUseRes = true;
  let senderId = id;
  let responses;

  //input validation
  if (!rawResponses) {
    rawResponses = id;
    senderId = null;
  }

  //detect if res is the senderid or the response from express.
  if (typeof res === "string") {
    senderId = res;
    flagUseRes = false;
  }

  //check if the response was used
  if (!res || (res && res.headersSent)) {
    flagUseRes = false;
  }

  //validate the senderId
  if (typeof senderId !== "string") {
    senderId = null;
  }

  //parse the rawResponses into a suitable format
  responses = parseMsg(rawResponses);

  //push the message to db for conversation history
  if (responses.length > 0) {
    return Bluebird.map(responses, (historyMessage) => {
      historyMessage.origin = "bot";
      return pushToHistory(senderId, historyMessage);
    })
    .then(() => {
      //if we cant answer, we save to db for later
      if (flagUseRes) {
        return Bluebird.resolve(responses)
          .then((result) => {
            if (opt && opt.feedback) {
              sendFeedback(senderId, opt.intent, opt.message);
            }
            return result;
          });
      } else if (senderId) {
        return WebMessage.findOneAndUpdate({senderId}, {$push: {unread: {$each: responses}}}, {upsert: true})
           .exec()
           .then((result) => {
             if (opt && opt.feedback) {
               sendFeedback(senderId, opt.intent, opt.message);
             }
             return result;
           });
      } else {
        return Bluebird.reject(new Error("Il semblerait qu'il n'y a pas de canal de retour pour ce message :" + responses));
      }
    });
  }

}

function getUnread(res, senderId) {
  return WebMessage
    .findOneAndUpdate({senderId}, {unread: []}, {upsert: true})
    .lean()
    .exec()
    .then(result => {
      return (result && Array.isArray(result.unread) && result.unread.length) ? result.unread : [];
    });
}

function getHistory(res, senderId) {
  if (!senderId) {
    return Bluebird.reject(new Error("Invalid senderId"));
  }

  return WebMessage
    .findOne({senderId})
    .lean()
    .exec()
    .then(result => {
      return (result && Array.isArray(result.history) && result.history.length) ? result.history : [];
    });
}

function pushToHistory(senderId, msg){
  return WebMessage.findOneAndUpdate({senderId}, {$push: {
    history: {
      $each: [msg],
      $slice: -config.historyLength //last X element
    }}}, {upsert: true})
    .exec();
}

module.exports = {
  send,
  getUnread,
  getHistory,
  pushToHistory
};

"use strict";

const Bluebird = require("bluebird");
const { ButtonsListMessage, Button, TextMessage, ButtonsMessage } = require("../generics");
const WebMessage = require("../../models/web.model");
const config = require("../../config/config-loader").load();
const { camelCase } = require("lodash");

function getTextMessage (message) {
  return {
    message,
    buttons: []
  };
}

function getButton (button) {
  return {
    message: null,
    buttons: [button]
  };
}

function getListButton (buttonList) {
  return {
    message: buttonList.text,
    buttons: buttonList.attachments.buttons || []
  };
}

function parseMsg (RawResponses) {
  const responses = RawResponses.length == null || typeof RawResponses === "string" ? [RawResponses] : RawResponses;

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

function sendFeedback (nichandle, intent, rawMessage) {
  const message = rawMessage.length >= config.maxMessageLength ? config.maxMessageLengthString : rawMessage;

  if (intent === "unknown") {
    return;
  }

  const buttons = [
    new Button("postback", `FEEDBACK_MISUNDERSTOOD_${camelCase(intent)}_${message}`, "Mauvaise compréhension"),
    new Button("postback", `FEEDBACK_BAD_${camelCase(intent)}_${message}`, "Non"),
    new Button("postback", `FEEDBACK_GOOD_${camelCase(intent)}_${message}`, "Oui")
  ];

  return send(null, nichandle, new ButtonsListMessage("Est-ce que cette réponse vous a aidé ?", buttons));
}

function send (res, id, rawResponses, opt) {
  let flagUseRes = true;
  let nichandle = id;
  let responses;

  // input validation
  if (!rawResponses) {
    rawResponses = id;
    nichandle = null;
  }

  // detect if res is the nichandle or the response from express.
  if (typeof res === "string") {
    nichandle = res;
    flagUseRes = false;
  }

  // check if the response was used
  if (!res || (res && res.headersSent)) {
    flagUseRes = false;
  }

  // validate the nichandle
  if (typeof nichandle !== "string") {
    nichandle = null;
  }

  // parse the rawResponses into a suitable format
  responses = parseMsg(rawResponses);

  // push the message to db for conversation history
  if (responses.length > 0) {
    return Bluebird.map(responses, (historyMessage) => {
      historyMessage.origin = "bot";
      return pushToHistory(nichandle, historyMessage);
    }).then(() => {
      // if we cant answer, we save to db for later
      if (flagUseRes) {
        return Bluebird.resolve(responses).then((result) => {
          if (opt && opt.feedback) {
            sendFeedback(nichandle, opt.intent, opt.message);
          }
          return result;
        });
      }
      return Bluebird.resolve();
    });
  }
}

function getHistory (res, nichandle) {
  if (!nichandle) {
    return Bluebird.reject(new Error("Invalid nichandle"));
  }

  return WebMessage.findOne({ nichandle }).lean().exec().then((result) => result && Array.isArray(result.history) && result.history.length ? result.history : []);
}

function pushToHistory (nichandle, msg) {
  return WebMessage.findOneAndUpdate(
    { nichandle },
    {
      $push: {
        history: {
          $each: [msg],
          $slice: -config.historyLength // last X element
        }
      }
    },
    { upsert: true }
  ).exec();
}

module.exports = {
  send,
  getHistory,
  pushToHistory
};

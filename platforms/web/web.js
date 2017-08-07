"use strict";

const Bluebird = require("bluebird");
const { ButtonsListMessage, Button, TextMessage, ButtonsMessage } = require("../generics");
const WebMessage = require("../../models/web.model");
const config = require("../../config/config-loader").load();
const { camelCase } = require("lodash");
const { textMessageAdapter, buttonAdapter, buttonListAdapter } = require("./web_adapters");
const responsesCst = require("../../constants/responses").FR;

function parseMsg (RawResponses) {
  const responses = RawResponses.length == null || typeof RawResponses === "string" ? [RawResponses] : RawResponses;

  return responses.map((uResponse) => {
    if (typeof uResponse === "string") {
      return textMessageAdapter(uResponse);
    }

    if (uResponse instanceof TextMessage) {
      return textMessageAdapter(uResponse.text);
    }

    if (uResponse instanceof Button) {
      return buttonAdapter(uResponse);
    }

    if (uResponse instanceof ButtonsListMessage || uResponse instanceof ButtonsMessage) {
      return buttonListAdapter(uResponse);
    }

    return uResponse;
  });
}

function sendFeedback (nichandle, intent, rawMessage) {
  const message = rawMessage.length >= config.maxMessageLength ? config.maxMessageLengthString : rawMessage;

  if (intent === "unknown") {
    return null;
  }

  const buttons = [
    new Button("postback", `FEEDBACK_MISUNDERSTOOD_${camelCase(intent)}_${message}`, responsesCst.feedbackBadUnderstanding),
    new Button("postback", `FEEDBACK_BAD_${camelCase(intent)}_${message}`, responsesCst.feedbackNo),
    new Button("postback", `FEEDBACK_GOOD_${camelCase(intent)}_${message}`, responsesCst.feedbackYes)
  ];

  return send(null, nichandle, new ButtonsListMessage(responsesCst.feedbackHelp, buttons));
}

function send (res, id, rawResponsesPar, opt) {
  let flagUseRes = true;
  let nichandle = id;
  let rawResponses = rawResponsesPar;
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
  return null;
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

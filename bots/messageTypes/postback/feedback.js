"use strict";

const { snakeCase } = require("lodash");
const Bluebird = require("bluebird").config({
  warnings: false
});
const Message = require("../../../models/messages.model");
const { TextMessage } = require("../../../platforms/generics");
const translator = require("../../../utils/translator");


module.exports = [
  {
    regx: "FEEDBACK_GOOD_([^_]*)_(.*)",
    action (senderId, postback, regx, entities, res, locale) {
      return saveFeedback(postback, regx, "GOOD", locale);
    }
  },
  {
    regx: "FEEDBACK_BAD_([^_]*)_(.*)",
    action (senderId, postback, regx, entities, res, locale) {
      return saveFeedback(postback, regx, "BAD", locale);
    }
  },
  {
    regx: "FEEDBACK_MISUNDERSTOOD_([^_]*)_(.*)",
    action (senderId, postback, regx, entities, res, locale) {
      return saveFeedback(postback, regx, "MISUNDERSTOOD", locale);
    }
  }
];

function saveFeedback (postback, regx, feedback, locale) {
  const intent = snakeCase(postback.match(new RegExp(regx))[1]);
  const message = postback.match(new RegExp(regx))[2];

  new Message({ intent, text: message, feedback }).save();
  return Bluebird.resolve({ responses: [new TextMessage(translator("feedbackThanks", locale))], feedback: false });
}

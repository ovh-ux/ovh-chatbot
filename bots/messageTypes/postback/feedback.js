"use strict";

const { snakeCase } = require("lodash");
const Bluebird = require("bluebird").config({
  warnings: false
});
const Message = require("../../../models/messages.model");
const { TextMessage } = require("../../../platforms/generics");

module.exports = [{
  regx : "FEEDBACK_GOOD_([^_]*)_(.*)",
  action(senderId, postback, regx) {
    return saveFeedback(postback, regx, "GOOD");
  }
}, {
  regx : "FEEDBACK_BAD_([^_]*)_(.*)",
  action(senderId, postback, regx) {
    return saveFeedback(postback, regx, "BAD");
  }
}, {
  regx : "FEEDBACK_MISUNDERSTOOD_([^_]*)_(.*)",
  action(senderId, postback, regx) {
    return saveFeedback(postback, regx, "MISUNDERSTOOD");
  }
}];

function saveFeedback(postback, regx, feedback) {
  let intent = snakeCase(postback.match(new RegExp(regx))[1]);
  let message = postback.match(new RegExp(regx))[2];

  new Message({ intent, text: message, feedback }).save();
  return Bluebird.resolve({ responses: [new TextMessage("Merci pour votre avis")], feedback: false });
}

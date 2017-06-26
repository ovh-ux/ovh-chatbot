"use strict";

import { snakeCase } from "lodash";
import * as Bluebird from "bluebird";
import Message from "../../../models/messages.model";
import { TextMessage } from "../../../platforms/generics";

Bluebird.config({
  warnings: false
});

export default [
  {
    regx: "FEEDBACK_GOOD_([^_]*)_(.*)",
    action (senderId, postback, regx, entities?, res?): Promise<any> {
      return saveFeedback(postback, regx, "GOOD");
    }
  },
  {
    regx: "FEEDBACK_BAD_([^_]*)_(.*)",
    action (senderId, postback, regx, entities?, res?): Promise<any> {
      return saveFeedback(postback, regx, "BAD");
    }
  },
  {
    regx: "FEEDBACK_MISUNDERSTOOD_([^_]*)_(.*)",
    action (senderId, postback, regx, entities?, res?): Promise<any> {
      return saveFeedback(postback, regx, "MISUNDERSTOOD");
    }
  }
];

function saveFeedback (postback, regx, feedback) {
  const intent = snakeCase(postback.match(new RegExp(regx))[1]);
  const message = postback.match(new RegExp(regx))[2];

  new Message({ intent, text: message, feedback }).save();
  return Bluebird.resolve({ responses: [new TextMessage("Merci pour votre avis")], feedback: false });
}

"use strict";

const { TextMessage, createPostBackList, Button, BUTTON_TYPE, MAX_LIMIT } = require("../../../platforms/generics");
const utils = require("../../../utils/ovh");
const translator = require("../../../utils/translator");

class TelephonyBreak {
  static action (senderId, message, entities, res, locale) {
    let ovhClient;

    return utils.getOvhClient(senderId)
    .then((lOvhClient) => {
      ovhClient = lOvhClient;
      return ovhClient.requestPromised("GET", "/telephony");
    })
    .map((service) => ovhClient.requestPromised("GET", `/telephony/${service}`)
      .then((info) => new Button(BUTTON_TYPE.POSTBACK, `TELEPHONY_SELECTED_${info.billingAccount}`, info.description || service))
    )
    .then((buttons) => ({
      responses: buttons.length > 0 ? [createPostBackList(translator("telephonySelectAccount", locale, 1, Math.ceil(buttons.length / MAX_LIMIT)), buttons, "MORE_TELEPHONY", 0, MAX_LIMIT)] :
        [new TextMessage(translator("telephonyNoAccount", locale)), new TextMessage(translator("upsellingPhone", locale))],
      feedback: false
    }));
  }
}

module.exports = { telephony_break: TelephonyBreak };

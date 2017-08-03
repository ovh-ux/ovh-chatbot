"use strict";

const { TextMessage, createPostBackList, Button, BUTTON_TYPE, MAX_LIMIT } = require("../../../platforms/generics");
const utils = require("../../utils");
const responsesCst = require("../../../constants/responses").FR;
const { sprintf } = require("voca");

class TelephonyBreak {
  static action (senderId) {
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
      responses: buttons.length > 0 ? [createPostBackList(sprintf(responsesCst.telephonySelectAccount, 1, Math.ceil(buttons.length / MAX_LIMIT)), buttons, "MORE_TELEPHONY", 0, MAX_LIMIT)] :
        [new TextMessage(responsesCst.telephonyNoAccount), new TextMessage(responsesCst.upsellingPhone)],
      feedback: false
    }));
  }
}

module.exports = { telephony_break: TelephonyBreak };

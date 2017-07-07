"use strict";

// const Bluebird = require("bluebird");
const { TextMessage, createPostBackList, Button } = require("../../../platforms/generics");
const utils = require("../../utils");
const responsesCst = require("../../../constants/responses").FR;

class TelephonyBreak {
  static action (senderId) {
    let user;

    return utils.getOvhClient(senderId)
    .then((lUser) => {
      user = lUser;
      return user.requestPromised("GET", "/telephony");
    })
    .map((service) => user.requestPromised("GET", `/telephony/${service}`)
      .then((info) => new Button("postback", `TELEPHONY_SELECTED_${info.billingAccount}`, info.description))
    )
    .then((buttons) => ({
      responses: [buttons.length > 0 ? createPostBackList("Selectionnez votre compte", buttons, "MORE_TELEPHONY", 0, 4) : new TextMessage(`Vous n'avez pas d'offre telephonie. ${responsesCst.upsellingPhone}`)],
      feedback: false
    }));
  }
}

module.exports = { telephony_break: TelephonyBreak };

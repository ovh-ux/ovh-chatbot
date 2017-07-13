"use strict";

const Bluebird = require("bluebird");
const { TextMessage } = require("../../../platforms/generics");
const utils = require("../../utils");
const responsesCst = require("../../../constants/responses").FR;
const { sprintf } = require("voca");

class WhoAmI {
  static action (senderId) {
    return utils
      .getOvhClient(senderId)
      .then((ovhClient) => ovhClient.requestPromised("GET", "/me"))
      .then((me) => ({ responses: [new TextMessage(sprintf(responsesCst.connectedAs, me.nichandle))], feedback: false }))
      .catch(() => Bluebird.resolve({ responses: [new TextMessage(responsesCst.notConnected)], feedback: false }));
  }
}

module.exports = { who_am_i: WhoAmI };

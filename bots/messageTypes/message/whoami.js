"use strict";

const Bluebird = require("bluebird");
const { TextMessage } = require("../../../platforms/generics");
const utils = require("../../utils");
const responsesCst = require("../../../constants/responses").FR;

class WhoAmI {
  static action (senderId) {
    return utils
      .getOvhClient(senderId)
      .then((user) => user.requestPromised("GET", "/me"))
      .then((me) => ({ responses: [new TextMessage(responsesCst.connectedAs.replace("%s", me.nichandle))], feedback: false }))
      .catch(() => Bluebird.resolve({ responses: [new TextMessage(responsesCst.notConnected)], feedback: false }));
  }
}

module.exports = { who_am_i: WhoAmI };

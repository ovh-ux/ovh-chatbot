"use strict";

const Bluebird = require("bluebird");
const { TextMessage } = require("../../../platforms/generics");
const utils = require("../../../utils/ovh");
const translator = require("../../../utils/translator");

class WhoAmI {
  static action (senderId, message, entities, res, locale) {
    return utils
      .getOvhClient(senderId)
      .then((ovhClient) => ovhClient.requestPromised("GET", "/me"))
      .then((me) => ({ responses: [new TextMessage(translator("connectedAs", locale, me.nichandle))], feedback: false }))
      .catch(() => Bluebird.resolve({ responses: [new TextMessage(translator("notConnected", locale))], feedback: false }));
  }
}

module.exports = { who_am_i: WhoAmI };

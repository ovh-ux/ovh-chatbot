"use strict";

const Bluebird = require("bluebird");
const { TextMessage } = require("../../../platforms/generics");
const utils = require("../../utils");

class WhoAmI {
  static action (senderId) {
    return utils
      .getOvhClient(senderId)
      .then((user) => user.requestPromised("GET", "/me"))
      .then((me) => ({ responses: [new TextMessage(`Tu es connecté en tant que ${me.nichandle}`)], feedback: false }))
      .catch(() => Bluebird.resolve({ responses: [new TextMessage("Tu n'es pas connecté, mais tu peux te connecter en me demandant: 'connecte moi'")], feedback: false }));
  }
}

module.exports = { who_am_i: WhoAmI };

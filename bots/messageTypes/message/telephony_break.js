"use strict";

// const Bluebird = require("bluebird");
const { TextMessage } = require("../../../platforms/generics");

class TelephonyBreak {
  static action () {
    return { responses: [new TextMessage("En construction")], feedback: false };
  }
}

module.exports = { telephony_break: TelephonyBreak };

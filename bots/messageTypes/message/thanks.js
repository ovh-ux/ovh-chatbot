"use strict";

const Bluebird = require("bluebird");
const { TextMessage } = require("../../../platforms/generics");
const responsesCst = require("../../../constants/responses").FR;

class Thanks {
  static action () {
    return Bluebird.resolve({ responses: [new TextMessage(responsesCst.thanks)], feedback: false });
  }
}

module.exports = { thanks: Thanks };

"use strict";

const Bluebird = require("bluebird");
const { TextMessage } = require("../../../platforms/generics");

class Thanks {
  static action () {
    return Bluebird.resolve({ responses: [new TextMessage("De rien avec plaisir :)")], feedback: false });
  }
}

module.exports = { thanks: Thanks };

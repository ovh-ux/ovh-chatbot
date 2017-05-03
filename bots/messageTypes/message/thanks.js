"use strict";

const Bluebird = require("bluebird");
const { TextMessage } = require("../../../platforms/generics");

class Thanks {
  static action() {
    return Bluebird.resolve([new TextMessage("De rien avec plaisir :)")]);
  }
}
module.exports = { thanks: Thanks };
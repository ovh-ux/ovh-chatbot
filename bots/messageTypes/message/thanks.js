"use strict";

const Bluebird = require("bluebird");
const { TextMessage } = require("../../../platforms/generics");
const translator = require("../../../utils/translator");

class Thanks {
  static action (senderId, message, entities, res, locale) {
    return Bluebird.resolve({ responses: [new TextMessage(translator("thanks", locale))], feedback: false });
  }
}

module.exports = { thanks: Thanks };

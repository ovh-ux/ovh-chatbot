"use strict";

const Bluebird = require("bluebird");
const { TextMessage } = require("../../../platforms/generics");
const translator = require("../../../utils/translator");

class NdhQuestion {
  static action (senderId, message, entities, res, locale) {
    let questions = translator("ndhQuestions", locale);
    return Bluebird.resolve({ responses: [new TextMessage(translator("ndhQuestionStart", locale) + questions[Math.floor(Math.random() * questions.length)])], feedback: false });
  }
}

module.exports = { ndh_question: NdhQuestion };

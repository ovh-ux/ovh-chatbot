"use strict";

const Bluebird = require("bluebird");
const { TextMessage } = require("../../../platforms/generics");
const responsesCst = require("../../../constants/responses").FR;

class NdhQuestion {
  static action () {
    return Bluebird.resolve({ responses: [new TextMessage(responsesCst.ndhQuestionStart + responsesCst.ndhQuestions[Math.floor(Math.random() * responsesCst.ndhQuestions.length)])], feedback: false });
  }
}

module.exports = { ndh_question: NdhQuestion };

"use strict";

const error = require("../../../providers/errors/apiError");
const utils = require("../../utils");
const Bluebird = require("bluebird");
const { TextMessage, Button, createPostBackList, BUTTON_TYPE, MAX_LIMIT } = require("../../../platforms/generics");
const responsesCst = require("../../../constants/responses").FR;
const v = require("voca");

class XdslBreak {
  static action (senderId) {
    let ovhClient;
    return utils
      .getOvhClient(senderId)
      .then((lClient) => {
        ovhClient = lClient;
        return ovhClient.requestPromised("GET", "/xdsl");
      })
      .map((offer) => ovhClient.requestPromised("GET", `/xdsl/${offer}`)
          .then((xdslInfo) => new Button(BUTTON_TYPE.POSTBACK, `XDSL_SELECTED_${xdslInfo.accessName}`, xdslInfo.description))
      )
      .then((buttons) => ({
        responses: buttons.length > 0 ? [createPostBackList(v.sprintf(responsesCst.xdslSelect, 1, Math.ceil(buttons.length / MAX_LIMIT)), buttons, "MORE_XDSL", 0, MAX_LIMIT)] :
          [new TextMessage(responsesCst.xdslNone), new TextMessage(responsesCst.upsellingXDSL)],
        feedback: false
      }))
      .catch((err) => Bluebird.reject(error(err.error || err.statusCode || 400, err)));
  }
}

module.exports = { xdsl_break: XdslBreak };

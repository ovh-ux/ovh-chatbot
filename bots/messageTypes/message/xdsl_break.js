"use strict";

const error = require("../../../providers/errors/apiError");
const utils = require("../../utils");
const Bluebird = require("bluebird");
const { TextMessage, Button, createPostBackList, BUTTON_TYPE } = require("../../../platforms/generics");
const responsesCst = require("../../../constants/responses").FR;

class XdslBreak {
  static action (senderId) {
    let user;
    return utils
      .getOvhClient(senderId)
      .then((lUser) => {
        user = lUser;
        return user.requestPromised("GET", "/xdsl");
      })
      .map((offer) => user.requestPromised("GET", `/xdsl/${offer}`)
          .then((xdslInfo) => new Button(BUTTON_TYPE.POSTBACK, `XDSL_SELECTED_${xdslInfo.accessName}`, xdslInfo.description))
      )
      .then((buttons) => ({
        responses: [buttons.length > 0 ? createPostBackList(responsesCst.xdslSelect, buttons, "MORE_XDSL", 0, 4) : new TextMessage(responsesCst.xdslNone), new TextMessage(responsesCst.upsellingXDSL)],
        feedback: false
      }))
      .catch((err) => {
        Bluebird.reject(error(err.error || err.statusCode || 400, err));
      });
  }
}

module.exports = { xdsl_break: XdslBreak };

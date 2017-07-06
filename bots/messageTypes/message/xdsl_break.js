"use strict";

const error = require("../../../providers/errors/apiError");
const utils = require("../../utils");
const Bluebird = require("bluebird");
const { TextMessage, Button, createPostBackList } = require("../../../platforms/generics");
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
      .then((xdsl) => {
        if (!Array.isArray(xdsl) || !xdsl.length) {
          return Bluebird.resolve({ responses: [new TextMessage(`Il semblerait que vous n'avez pas d'offre xDSL. ${responsesCst.upsellingXDSL}`)], feedback: false });
        }

        return Bluebird.map(xdsl, (offer) =>
          user.requestPromised("GET", `/xdsl/${offer}`)
          .then((xdslInfo) => new Button("postback", `XDSL_SELECTED_${xdslInfo.accessName}`, xdslInfo.description)));
      })
      .then((resp) => Array.isArray(resp) ? {
        responses: [createPostBackList("Sélectionne ton offre xDSL", resp, "MORE_XDSL", 0, 4)],
        feedback: false
      } : resp)
      .catch((err) => {
        Bluebird.reject(error(err.error || err.statusCode || 400, err));
      });
  }
}

module.exports = { xdsl_break: XdslBreak };

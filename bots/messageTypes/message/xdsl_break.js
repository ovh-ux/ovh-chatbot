"use strict";

const error = require("../../../providers/errors/apiError");
const utils = require("../../utils");
const Bluebird = require("bluebird");
const { TextMessage, Button, createPostBackList } = require("../../../platforms/generics");
const responsesCst = require("../../../constants/responses").FR;

class XdslBreak {
  static action (senderId) {
    return utils
      .getOvhClient(senderId)
      .then((user) => user.requestPromised("GET", "/xdsl"))
      .then((xdsl) => {
        let xdslOffers = [];
        if (!Array.isArray(xdsl) || !xdsl.length) {
          return { responses: [new TextMessage(`Il semblerait que vous n'avez pas d'offre xDSL. ${responsesCst.upsellingXDSL}`)], feedback: false };
        }

        xdslOffers = xdsl.map((offer) => new Button("postback", `XDSL_SELECTED_${offer}`, offer));

        return {
          responses: [createPostBackList("Sélectionne ton offre xDSL", xdslOffers, "MORE_XDSL", 0, 4)],
          feedback: false
        };
      })
      .catch((err) => {
        Bluebird.reject(error(err.error || err.statusCode || 400, err));
      });
  }
}

module.exports = { xdsl_break: XdslBreak };

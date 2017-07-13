"use strict";

const error = require("../../../providers/errors/apiError");
const { Button, createPostBackList, ButtonsMessage, TextMessage, BUTTON_TYPE, MAX_LIMIT } = require("../../../platforms/generics");
const utils = require("../../utils");
const Bluebird = require("bluebird");
const responsesCst = require("../../../constants/responses").FR;
const URL = require("url");
const { sprintf } = require("voca");

class WebsiteBreak {
  static action (senderId, message, entities, res) {
    return utils
      .getOvhClient(senderId)
      .then((ovhClient) => ovhClient.requestPromised("GET", "/hosting/web"))
      .then((hostings) => {
        let eltInfos = [];

        if (!hostings.length) {
          return { responses: [new TextMessage(responsesCst.hostingNoSite), new TextMessage(responsesCst.upsellingWeb)], feedback: false };
        }

        if (entities.url) {
          const website = entities.url.indexOf("http") !== -1 ? entities.url : `http://${entities.url}`;

          if (hostings.length === 1) {
            const buttons = [new Button(BUTTON_TYPE.POSTBACK, `ATTACHED_DOMAIN_SELECTED_${hostings[0]}_${URL.parse(website).hostname}`, hostings[0])];

            return { responses: [new ButtonsMessage(sprintf(responsesCst.hostingSelectHost, 1, 1), buttons)], feedback: false };
          }
          eltInfos = hostings.map((hosting) => new Button(BUTTON_TYPE.POSTBACK, `ATTACHED_DOMAIN_SELECTED_${hosting}_${URL.parse(website).hostname}`, hosting));

          return {
            responses: [createPostBackList(sprintf(responsesCst.hostingSelectHost, 1, Math.ceil(eltInfos.length / MAX_LIMIT)), eltInfos, "MORE_HOSTING", 0, MAX_LIMIT)],
            feedback: false
          };
        }

        if (hostings.length === 1) {
          const buttons = [new Button(BUTTON_TYPE.POSTBACK, `HOSTING_SELECTED_${hostings[0]}`, hostings[0])];

          return { responses: [new ButtonsMessage(sprintf(responsesCst.hostingSelectHost, 1, 1), buttons)], feedback: false };
        }

        eltInfos = hostings.map((hosting) => new Button(BUTTON_TYPE.POSTBACK, `HOSTING_SELECTED_${hosting}`, hosting));

        return { responses: [createPostBackList(sprintf(responsesCst.hostingSelectHost, 1, Math.ceil(eltInfos.length / MAX_LIMIT)), eltInfos, "MORE_HOSTING", 0, MAX_LIMIT)], feedback: false };
      })
      .catch((err) => {
        res.logger.error(err);
        return Bluebird.reject(error(err.error || err.statusCode || 400, err));
      });
  }
}

module.exports = { website_break: WebsiteBreak };

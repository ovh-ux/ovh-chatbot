"use strict";

const error = require("../../../providers/errors/apiError");
const { Button, createPostBackList, ButtonsMessage, TextMessage } = require("../../../platforms/generics");
const utils = require("../../utils");
const Bluebird = require("bluebird");
const responsesCst = require("../../../constants/responses").FR;
const URL = require("url");

class WebsiteBreak {
  static action (senderId, message, entities, res) {
    return utils
      .getOvhClient(senderId)
      .then((ovhClient) => ovhClient.requestPromised("GET", "/hosting/web"))
      .then((hostings) => {
        let eltInfos = [];

        if (!hostings.length) {
          return { responses: [new TextMessage("Tu n'as pas d'hébergement web :("), new TextMessage(responsesCst.upsellingWeb)], feedback: false };
        }

        if (entities.url) {
          const website = entities.url.indexOf("http") !== -1 ? entities.url : `http://${entities.url}`;

          if (hostings.length === 1) {
            const buttons = [new Button("postback", `ATTACHED_DOMAIN_SELECTED_${hostings[0]}_${URL.parse(website).hostname}`, hostings[0])];

            return { responses: [new ButtonsMessage("Sélectionne l'hébergement web sur lequel est installé ton site", buttons)], feedback: false };
          }
          eltInfos = hostings.map((hosting) => new Button("postback", `ATTACHED_DOMAIN_SELECTED_${hosting}_${URL.parse(website).hostname}`, hosting));

          return {
            responses: [createPostBackList("Sélectionne l'hébergement web sur lequel est installé ton site", eltInfos, "MORE_HOSTING", 0, 4)],
            feedback: false
          };
        }

        if (hostings.length === 1) {
          const buttons = [new Button("postback", `HOSTING_SELECTED_${hostings[0]}`, hostings[0])];

          return { responses: [new ButtonsMessage("Sélectionne l'hébergement web sur lequel est installé ton site", buttons)], feedback: false };
        }

        eltInfos = hostings.map((hosting) => new Button("postback", `HOSTING_SELECTED_${hosting}`, hosting));

        return { responses: [createPostBackList("Sélectionne l'hébergement web sur lequel est installé ton site", eltInfos, "MORE_HOSTING", 0, 4)], feedback: false };
      })
      .catch((err) => {
        res.logger.error(err);
        return Bluebird.reject(error(err.error || err.statusCode || 400, err));
      });
  }
}

module.exports = { website_break: WebsiteBreak };

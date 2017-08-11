"use strict";

const { ButtonsMessage, Button, TextMessage, BUTTON_TYPE } = require("../../../platforms/generics");
const Bluebird = require("bluebird");
const translator = require("../../../utils/translator");

class DomainToHosting {
  static action (senderId, message, entities, res, locale) {
    const responses = [new TextMessage(translator("domainEditDns", locale)), new TextMessage(translator("guides-help", locale, translator("guides-modifDns", locale)))];

    if (entities.url) {
      const url = encodeURIComponent(entities.url.replace(/https?:\/\//gi, ""));
      const buttons = [new Button(BUTTON_TYPE.URL, `https://www.ovh.com/manager/web/#/configuration/domain/${url}?tab=ZONE`, translator("goToManager", locale))];

      responses.push(new ButtonsMessage(translator("dnsEditDns", locale), buttons));
    }

    return Bluebird.resolve({ responses, feedback: true });
  }
}

module.exports = { domain_to_hosting: DomainToHosting };

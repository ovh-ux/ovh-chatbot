"use strict";

const { ButtonsMessage, Button, TextMessage, BUTTON_TYPE } = require("../../../platforms/generics");
const Bluebird = require("bluebird");
const guides = require("../../../constants/guides").FR;
const responsesCst = require("../../../constants/responses").FR;

class DomainToHosting {
  static action (senderId, message, entities) {
    const responses = [new TextMessage(responsesCst.domainEditDns), new TextMessage(guides.help(guides.modifDns))];

    if (entities.url) {
      const url = encodeURIComponent(entities.url.replace(/https?:\/\//gi, ""));
      const buttons = [new Button(BUTTON_TYPE.URL, `https://www.ovh.com/manager/web/#/configuration/domain/${url}?tab=ZONE`, responses.goToManager)];

      responses.push(new ButtonsMessage(responses.dnsEditDns, buttons));
    }

    return Bluebird.resolve({ responses, feedback: true });
  }
}

module.exports = { domain_to_hosting: DomainToHosting };

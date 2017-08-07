"use strict";

const { ButtonsMessage, Button, TextMessage, BUTTON_TYPE } = require("../../../platforms/generics");
const guides = require("../../../constants/guides").FR;
const responsesCst = require("../../../constants/responses").FR;
const utils = require("../../utils");

class DnsServerConfig {
  static action (senderId, message, entities) {
    const responses = [new TextMessage(guides.help(guides.modifDnsServer))];

    return utils.getOvhClient(senderId).then((ovhClient) => ovhClient.requestPromised("GET", "/domain")).then((domains) => {
      if (entities.url) {
        const url = encodeURIComponent(entities.url.replace(/https?:\/\//gi, ""));

        if (domains.indexOf(url) !== -1) {
          const buttons = [new Button(BUTTON_TYPE.URL, `https://www.ovh.com/manager/web/#/configuration/domain/${url}?tab=DNS`, responsesCst.goToManager)];

          responses.push(new ButtonsMessage(responsesCst.dnsEditDns, buttons));
        }
      }

      return { responses, feedback: true };
    });
  }
}

module.exports = { dns_server_config: DnsServerConfig };

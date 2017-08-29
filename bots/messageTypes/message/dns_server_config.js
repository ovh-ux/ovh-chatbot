"use strict";

const { ButtonsMessage, Button, TextMessage, BUTTON_TYPE } = require("../../../platforms/generics");
const translator = require("../../../utils/translator");
const utils = require("../../../utils/ovh");

class DnsServerConfig {
  static action (senderId, message, entities, res, locale) {
    const responses = [new TextMessage(translator("guides-help", locale, translator("guides-modifDnsServer", locale)))];

    return utils.getOvhClient(senderId).then((ovhClient) => ovhClient.requestPromised("GET", "/domain")).then((domains) => {
      if (entities.url) {
        const url = encodeURIComponent(entities.url.replace(/https?:\/\//gi, ""));

        if (domains.indexOf(url) !== -1) {
          const buttons = [new Button(BUTTON_TYPE.URL, `https://www.ovh.com/manager/web/#/configuration/domain/${url}?tab=DNS`, translator("goToManager", locale))];

          responses.push(new ButtonsMessage(translator("dnsEditDns", locale), buttons));
        }
      }

      return { responses, feedback: true };
    });
  }
}

module.exports = { dns_server_config: DnsServerConfig };

"use strict";

const { ButtonsMessage, Button, TextMessage } = require("../../../platforms/generics");
const guides = require("../../../constants/guides").FR;
const utils = require("../../utils");

class DnsServerConfig {
  static action(senderId, message, entities) {
    let responses = [new TextMessage(`Voici un guide pour modifier tes serveurs DNS grâce à l'espace client OVH: ${guides.modifDnsServer}`)];

    return utils.getOvhClient(senderId)
      .then((ovhClient) => ovhClient.requestPromised("GET", "/domain"))
      .then((domains) => {
        if (Array.isArray(entities.url) && entities.url.length) {
          let url = encodeURIComponent(entities.url[0].value.replace(/https?:\/\//gi, ""));

          if (domains.indexOf(url) !== -1) {
            let buttons = [new Button("web_url", `https://www.ovh.com/manager/web/#/configuration/domain/${url}?tab=DNS`, "Gérer les serveurs DNS")];

            responses.push(new ButtonsMessage("Tu peux modifier tes serveurs via l'espace client OVH", buttons));
          }
        }

        return responses;
      });
  }
}

module.exports = { dns_server_config: DnsServerConfig };

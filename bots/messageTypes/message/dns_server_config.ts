"use strict";

import { ButtonsMessage, Button, TextMessage } from "../../../platforms/generics";
import {FR as  guides} from "../../../constants/guides";
import * as utils from "../../utils";

class DnsServerConfig {
  static action (senderId?, message?, entities?, res?): Promise<any> {
    const responses = [new TextMessage(`Voici un guide pour modifier tes serveurs DNS grâce à l'espace client OVH: ${guides.modifDnsServer}`)];

    return utils.getOvhClient(senderId).then((ovhClient) => ovhClient.requestPromised("GET", "/domain")).then((domains) => {
      if (entities.url) {
        const url = encodeURIComponent(entities.url.replace(/https?:\/\//gi, ""));

        if (domains.indexOf(url) !== -1) {
          const buttons = [new Button("web_url", `https://www.ovh.com/manager/web/#/configuration/domain/${url}?tab=DNS`, "Gérer les serveurs DNS")];

          responses.push(new ButtonsMessage("Tu peux modifier tes serveurs via l'espace client OVH", buttons));
        }
      }

      return { responses, feedback: true };
    });
  }
}

export default { dns_server_config: DnsServerConfig };

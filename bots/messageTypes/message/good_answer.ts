"use strict";

import * as Bluebird from "bluebird";
import * as request from "request";
import * as cfg from "../../../config/config-loader.js";
import { ButtonsMessage, Button } from "../../../platforms/generics";
const config = cfg.load();

class GoodAnswer {
  static action (senderId?, message?, entities?, res?): Promise<any> {
    return new Bluebird((resolve, reject) => {
      request(
        {
          uri: config.ndhURL,
          qs: {
            token: config.ndhTOKEN
          }
        },
        (err, response, body) => {
          if (err) {
            return reject(err);
          } else if (response && response.statusCode === 200) {
            const button = new Button("web_url", JSON.parse(body).url, "Obtenir le QR Code");
            return resolve({ responses: [new ButtonsMessage("Bravo tu as trouvé, voici ta récompense :)", [button])], feedback: false });
          }
          return reject(new Error(`invalid statusCode : ${response.statusCode}`));

        }
      );
    });
  }
}

export default { good_answer: GoodAnswer };

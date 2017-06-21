"use strict";

const Bluebird = require("bluebird");
const request = require("request");
const config = require("../../../config/config-loader.js").load();
const { ButtonsMessage, Button } = require("../../../platforms/generics");

class GoodAnswer {
  static action() {
    return new Bluebird((resolve, reject) => {
      request({
        uri: config.ndhURL,
        qs: {
          token: config.ndhTOKEN
        }
      }, (err, response, body) => {
        if (err) {
          return reject(err);
        } else if (response && response.statusCode === 200) {
          let button = new Button("web_url", body.url, "Obtenir le QR Code");
          return resolve({responses: [new ButtonsMessage("Bravo tu as trouvé, voici ta récompense :)", [button])], feedback: false});
        } else {
          return reject(new Error("invalid statusCode : " + response.statusCode));
        }
      });
    });
  }
}

module.exports = {good_answer: GoodAnswer};

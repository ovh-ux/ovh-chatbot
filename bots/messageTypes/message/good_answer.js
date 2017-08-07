"use strict";

const Bluebird = require("bluebird");
const request = require("request");
const config = require("../../../config/config-loader.js").load();
const { ButtonsMessage, Button, BUTTON_TYPE } = require("../../../platforms/generics");
const responsesCst = require("../../../constants/responses").FR;

class GoodAnswer {
  static action () {
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
            const button = new Button(BUTTON_TYPE.URL, JSON.parse(body).url, responsesCst.ndhGetQR);
            return resolve({ responses: [new ButtonsMessage(responsesCst.ndhWin, [button])], feedback: false });
          }
          return reject(new Error(`invalid statusCode : ${response.statusCode}`));

        }
      );
    });
  }
}

module.exports = { good_answer: GoodAnswer };

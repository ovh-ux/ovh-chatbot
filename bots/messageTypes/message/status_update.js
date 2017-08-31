"use strict";

const utils = require("../../../utils/ovh");
const { TextMessage, ButtonsMessage, Button, BUTTON_TYPE } = require("../../../platforms/generics");
const translator = require("../../../utils/translator");
const Users = require("../../../models/users.model");
const { getServicesStatus } = require("../../../diagnostics/cron");
const Bluebird = require("bluebird");

class StatusUpdate {
  static action (senderId, message, entities, res, locale) {
    let responses;
    let promise = utils.getOvhClient(senderId)
      .then((ovhClient) => getServicesStatus(ovhClient, locale))
      .then((responsesCron) => {
        responses = responsesCron;
        if (!responses.length) {
          responses = [new TextMessage(translator("allOk", locale))];
        }
        return Users.findOne({ senderId }).exec();
      }).then((user) => {
        if (user) {
          let buttons = [
            new Button(BUTTON_TYPE.POSTBACK, "SETTINGS_UPDATES_true", translator("on", locale)),
            new Button(BUTTON_TYPE.POSTBACK, "SETTINGS_UPDATES_false", translator("off", locale))
          ];
          responses.push(new ButtonsMessage(translator(`settings-updates-${user.updates}`, locale), buttons));
        }
        return responses;
      });

    return Bluebird.resolve({ responses: [new TextMessage(translator("scanInProgress", locale)), promise], feedback: false });

  }
}

module.exports = { status_update: StatusUpdate };

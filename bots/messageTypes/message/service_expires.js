"use strict";

const utils = require("../../../utils/ovh");
const { TextMessage, ButtonsMessage, Button, BUTTON_TYPE } = require("../../../platforms/generics");
const translator = require("../../../utils/translator");
const Users = require("../../../models/users.model");
const { getServicesExpires } = require("../../../diagnostics/cron");


class ServiceExpires {
  static action (senderId, message, entities, res, locale) {
    let user;
    return Users.findOne({ senderId }).exec()
      .then((userLocal) => {
        user = userLocal;
        return utils.getOvhClient(senderId);
      })
      .then((ovhClient) => getServicesExpires(ovhClient, locale, user.expiresPeriod || 14))
      .then((responsesCron) => {
        let responses = responsesCron;
        if (!responses.length) {
          responses = [new TextMessage(translator("expires-allOk", locale))];
        }
        return responses;
      })
      .then((responses) => {
        if (user) {
          let buttons = [
            new Button(BUTTON_TYPE.POSTBACK, "SETTINGS_EXPIRES_true", translator("on", locale)),
            new Button(BUTTON_TYPE.POSTBACK, "SETTINGS_EXPIRES_false", translator("off", locale)),
            new Button(BUTTON_TYPE.POSTBACK, "SETTINGS_EXPIRES_edit", translator("settings-expires-edit", locale))
          ];
          responses.push(new ButtonsMessage(translator(`settings-expires-${user.expires}`, locale, user.expiresPeriod), buttons));
        }
        return { responses, feedback: true };
      });
  }
}

module.exports = { service_expires: ServiceExpires };

"use strict";

const { TextMessage, Button, ButtonsListMessage, BUTTON_TYPE } = require("../../../platforms/generics");
const translator = require("../../../utils/translator");
const Users = require("../../../models/users.model");

module.exports = [
  {
    regx: "SETTINGS_UPDATES_(true|false)",
    action (senderId, postback, regx, entities, res, locale) {
      const updates = postback.match(new RegExp(regx))[1];

      return Users.findOne({ senderId }).exec()
        .then((user) => {
          user.updates = updates;
          return user.save();
        }).then(() => ({ responses: [new TextMessage(translator(`settings-updates-${updates}`, locale))], feedback: false }));
    }
  },
  {
    regx: "SETTINGS_EXPIRES_(\\d+)",
    action (senderId, postback, regx, entities, res, locale) {
      const period = parseInt(postback.match(new RegExp(regx))[1], 10);

      return Users.findOne({ senderId }).exec()
        .then((user) => {
          user.expiresPeriod = period;
          return user.save();
        }).then(() => ({ responses: [new TextMessage(translator("settings-expires-period", locale, period))], feedback: false }));


    }
  },
  {
    regx: "SETTINGS_EXPIRES_edit",
    action (senderId, postback, regx, entities, res, locale) {
      const days = [2, 7, 14, 30, 60];

      return Users.findOne({ senderId }).exec()
        .then((user) => {
          let buttons = days.map((day) => new Button(BUTTON_TYPE.POSTBACK, `SETTINGS_EXPIRES_${day}`, translator("settings-expires-days", locale, day)));

          return { responses: [new ButtonsListMessage(translator("settings-expires-edit", locale, user.expiresPeriod), buttons)], feedback: false };
        });
    }
  },
  {
    regx: "SETTINGS_EXPIRES_(true|false)",
    action (senderId, postback, regx, entities, res, locale) {
      const expires = postback.match(new RegExp(regx))[1];

      return Users.findOne({ senderId }).exec()
        .then((user) => {
          user.expires = expires;
          return user.save();
        }).then((user) => ({ responses: [new TextMessage(translator(`settings-expires-${expires}`, locale, user.expiresPeriod))], feedback: false }));

    }
  }
];

"use strict";

const { TextMessage } = require("../../../platforms/generics");
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
  }
];

"use strict";

const postbackActions = require("./messageTypes/postback");
const messageActions = require("./messageTypes/message");
const Bluebird = require("bluebird");
const Users = require("../models/users.model");
const { TextMessage } = require("../platforms/generics");
const responsesCst = require("../constants/responses").FR;

module.exports = () => ({
  ask (type, senderId, message, intent, entities, res) {
    Users.where({ senderId }).update({ $inc: { messageNumber: 1 } }).exec();

    switch (type) {
    case "postback": {
      let promise;

      postbackActions.some((postback) => {
        if (message.match(new RegExp(postback.regx))) {
          promise = postback.action(senderId, message, postback.regx, entities, res);
          return true;
        }
        return false;
      });

      return promise.catch(isDisconnected);
    }
    case "message": {
      if (!messageActions[intent] || !messageActions[intent].action) {
        return Bluebird.resolve({ responses: [new TextMessage(responsesCst.noAnswer)], feedback: false });
      }

      return messageActions[intent].action(senderId, message, entities, res).catch(isDisconnected);
    }
    default:
      return null;
    }
  }
});

function isDisconnected (err) {
  let error;
  if (err.statusCode === 403 || err.statusCode === 401) {
    error = Object.assign({}, err, { message: responsesCst.disconnected });
  } else {
    error = err;
  }

  return Bluebird.reject(error);
}

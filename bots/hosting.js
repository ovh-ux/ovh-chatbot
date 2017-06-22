"use strict";

const postbackActions = require("./messageTypes/postback");
const messageActions = require("./messageTypes/message");
const Bluebird = require("bluebird");
const Users = require("../models/users.model");

module.exports = () => {
  return {
    ask(type, senderId, message, intent, entities, res) {

      Users.where({ senderId })
        .update({ $inc: { messageNumber: 1 }})
        .exec();

      switch (type) {

      case "postback":
        let promise;

        postbackActions.some((postback) => {
          if(message.match(new RegExp(postback.regx))) {
            promise = postback.action(senderId, message, postback.regx, entities, res);
            return true;
          }
        });

        return promise
          .catch(isDisconnected);
      case "message":
        if (!messageActions[intent] || !messageActions[intent].action) {
          return Bluebird.resolve({responses: "Je ne peux pas encore répondre à cette question", feedback: false});
        }

        return messageActions[intent].action(senderId, message, entities, res)
          .catch(isDisconnected);
      default:
        break;
      }
    }
  };
};

function isDisconnected(err) {
  let error;
  if (err.statusCode === 403 || err.statusCode === 401) {
    error = Object.assign({}, err, { message: "Tu n'es pas correctement connecté à ton compte OVH :( , il te suffit de me demander 'connecte moi' pour te reconnecter."});
  } else {
    error = err;
  }

  return Bluebird.reject(error);
}

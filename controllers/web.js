"use strict";

const web = require("../platforms/web/web");
const bot = require("../bots/hosting")();
const config = require("../config/config-loader").load();
const apiai = require("../utils/apiai");
const Bluebird = require("bluebird");
const { ButtonsListMessage, Button} = require("../platforms/generics");
const uuid = require("uuid/v4");

module.exports = () => {

  function postbackReceived(res, senderId, payload) {
    return bot.ask("postback", senderId, payload, null, null, res)
      .then((answer) => {
        answer.intent = payload;
        answer.message = "message";
        return answer;
      })
      .catch(err => Bluebird.resolve(err));
  }

  function messageReceived(res, senderId, message) {
    return apiai.textRequestAsync(message, { sessionId: senderId })
      .then((resp) => {
        let senderId = resp.sessionId;
        if (resp.status && resp.status.code === 200 && resp.result) {
          //successful request

          //if user need to login
          if (resp.result.action === "connection" || resp.result.action === "welcome") {
            let but = [
              new Button("web_url", `${config.server.url}${config.server.basePath}/authorize?state=${senderId}-web`,"Se connecter !")
            ];
            return Bluebird.resolve(new ButtonsListMessage("Tu peux te connecter en cliquant sur ce bouton", but));
          }

          //if api.ai has a premade response
          if (resp.result.fulfillment && resp.result.fulfillment.speech && Array.isArray(resp.result.fulfillment.messages) && resp.result.fulfillment.messages.length) {
            let smalltalk = resp.result.action && resp.result.action.indexOf("smalltalk") !== -1;
            let quickResponses = resp.result.fulfillment.messages;

            if (smalltalk && Math.floor((Math.random() * 2))) { //random to change response from original smalltalk to our custom sentence
              quickResponses = [{ speech: resp.result.fulfillment.speech, type: 0 }];
            }

            return sendQuickResponses(res, senderId, quickResponses);
          }
          //else bot take over
          return bot.ask("message", senderId, message, resp.result.action, resp.result.parameters, res)
            .then((result) => {
              result.intent = resp.result.action;
              result.message = message;
              return result;
            })
            .catch(err => Bluebird.resolve(err));
        }
      });
  }

  function getHistory(req, res) {
    let senderId = req.params.senderId;
    web.getHistory(res, senderId)
      .then(result => res.status(200).json(result))
      .catch(err => res.status(400).json(err));
  }

  function onGet(req, res) {
    let senderId = res.senderId = req.query.senderId;

    if (senderId) {
      return web.getUnread(res, senderId)
        .then(result => res.status(200).json(result))
        .catch(err => res.status(400).json(err));
    } else {
      senderId = uuid();
      let but = [
        new Button("web_url", `${config.server.url}${config.server.basePath}/authorize?state=${senderId}-web`,"Se connecter")
      ];
      return web.send(null, senderId, new ButtonsListMessage("Pour commencer, connecter vous :)", but))
        .then(() => res.status(200).json(senderId))
        .catch(err => res.status(503).json(err));
    }
  }
  function onPost(req, res) {
    let message = req.body.message;
    let senderId = res.senderId = req.body.senderId;
    let type = req.body.type;

    //check the data sent first;
    if (!senderId) {
      return res.status(403).json(new Error("Missing senderid"));
    }

    if (!message) {
      return res.status(400).json(new Error("Missing message"));
    }

    if (!type) {
      return res.status(400).json(new Error("Missing message type"));
    }

    //save user message to db first
    let userMsg = {
      message,
      origin: "user"
    };

    if (type === "postback") {
      userMsg.origin = "user_postback";
    }

    return web
      .pushToHistory(senderId, userMsg)
      .then(() => {
        if (type === "message") {
          return messageReceived(res, senderId, message);
        } else if(type === "postback") {
          return postbackReceived(res, senderId, message);
        }
      })
      .then((result) => {
        //if result.responses then the origin is the bot, ie there might be a feedback request
        if (result.responses) {
          return web.send(res, senderId, result.responses, result);
        }
        return web.send(res, senderId, result);
      })
      .then((result) => res.status(200).json(result))
      .catch(err => {
        res.logger.error(err);
        return res.status(503).json(err);
      });
  }

  function sendQuickResponses(res, senderId, responses) {
    return Bluebird.mapSeries(responses, (response) => {
      switch (response.type) {
      case 0:
      default:
        let textResponse = response.speech.replace(/<(.*)\|+(.*)>/, "$1");
        return Bluebird.resolve(textResponse);
      }
    });
  }

  return {
    onGet,
    onPost,
    getHistory
  };

};

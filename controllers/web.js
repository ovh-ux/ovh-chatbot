"use strict";

const web = require("../platforms/web/web");
const bot = require("../bots/common")();
const apiai = require("../utils/apiai");
const Bluebird = require("bluebird");
const { TextMessage } = require("../platforms/generics");
const ovh = require("../utils/ovh");
const translator = require("../utils/translator");

module.exports = () => {
  const sendQuickResponses = (res, nichandle, responses) =>
    Bluebird.mapSeries(responses, (response) => {
      switch (response.type) {
      case 0: {
        const textResponse = response.speech.replace(/<(.*)\|+(.*)>/, "$1");
        return Bluebird.resolve(textResponse);
      }
      default: {
        const textResponse = response.speech.replace(/<(.*)\|+(.*)>/, "$1");
        return Bluebird.resolve(textResponse);
      }
      }
    });

  const postbackReceived = (res, nichandle, payload, locale) =>
    bot
      .ask("postback", nichandle, payload, null, null, res, locale)
      .then((answer) => {
        answer.intent = payload;
        answer.message = "message";
        return answer;
      })
      .catch((err) => Bluebird.resolve(err));

  const messageReceived = (res, nic, message, locale) =>
      apiai.textRequestAsync(message, { sessionId: nic }, locale)
      .then((resp) => {
        const nichandle = resp.sessionId;
        if (resp.status && resp.status.code === 200 && resp.result) {
          // successful request
          if (resp.result.action === "welcome") {
            return Bluebird.resolve({ responses: [new TextMessage(translator("welcome", locale))], feedback: false });
          }

          if (resp.result.action === "connection") {
            return Bluebird.resolve({ responses: [new TextMessage(translator("connectedAs", locale, nichandle))], feedback: false });
          }

          // if api.ai has a premade response
          if (
            resp.result.fulfillment &&
            resp.result.fulfillment.speech &&
            Array.isArray(resp.result.fulfillment.messages) &&
            resp.result.fulfillment.messages.length
          ) {
            const smalltalk =
              resp.result.action &&
              resp.result.action.indexOf("smalltalk") !== -1;
            let quickResponses = resp.result.fulfillment.messages;

            if (smalltalk && Math.floor(Math.random() * 2)) {
              // random to change response from original smalltalk to our custom sentence
              quickResponses = [
                { speech: resp.result.fulfillment.speech, type: 0 }
              ];
            }

            return sendQuickResponses(res, nichandle, quickResponses);
          }

          // else bot take over
          return bot
            .ask(
              "message",
              nichandle,
              message,
              resp.result.action,
              resp.result.parameters,
              res
            )
            .then((result) => {
              result.intent = resp.result.action;
              result.message = message;
              return result;
            })
            .catch((err) => Bluebird.resolve(err));
        }
        return null;
      });

  function onGet (req, res) {
    const nichandle = req.user.nichandle;
    let locale;
    return ovh.getOvhClient(nichandle)
      .then((ovhClient) => ovhClient.requestPromised("GET", "/me"))
      .then((meInfos) => meInfos.language)
      .then((localeLocal) => {
        locale = localeLocal;
      })
      .then(() => web.getHistory(res, nichandle))
      .then((result) => {
        if (!result.length) {
          web.send(null, nichandle, translator("welcomeWeb", locale, nichandle));
        }
        return res.status(200).json(result);
      })
      .catch((err) => res.status(400).json(err));
  }

  function onPost (req, res) {
    const message = req.body.message;
    const nichandle = req.user.nichandle;
    const type = req.body.type;

    // check the data sent first;
    if (!nichandle) {
      return res.status(403).json(new Error("Missing nichandle"));
    }

    if (!message) {
      return res.status(400).json(new Error("Missing message"));
    }

    if (!type || (type !== "postback" && type !== "message")) {
      return res.status(400).json(new Error(`Unknown message type : ${type}`));
    }

    // save user message to db first
    const userMsg = {
      message,
      origin: "user"
    };

    if (type === "postback") {
      userMsg.origin = "user_postback";
    }

    return web
      .pushToHistory(nichandle, userMsg)
      .then(() => ovh.getOvhClient(nichandle))
      .then((ovhClient) => ovhClient.requestPromised("GET", "/me"))
      .then((meInfos) => meInfos.language)
      .then((locale) => {
        if (type === "message") {
          return messageReceived(res, nichandle, message, locale);
        } else if (type === "postback") {
          return postbackReceived(res, nichandle, message, locale);
        }
        throw new Error(`unknown type, ${type}`);
      })
      .then((result) => {
        // if result.responses then the origin is the bot, ie there might be a feedback request
        if (result.responses) {
          return web.send(res, nichandle, result.responses, result);
        }
        return web.send(res, nichandle, result);
      })
      .then((result) => res.status(200).json(result))
      .catch((err) => {
        res.logger.error(err);
        return res.status(503).json(err);
      });
  }

  return {
    onGet,
    onPost
  };
};

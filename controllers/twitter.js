"use strict";

const twitter = require("../platforms/twitter/twitter");
const bot = require("../bots/common")();
const config = require("../config/config-loader").load();
const apiai = require("../utils/apiai");
const Bluebird = require("bluebird");
const { Button, ButtonsMessage, BUTTON_TYPE, createFeedback } = require("../platforms/generics");
const translator = require("../utils/translator");
const logger = require("../providers/logging/logger");
const ovh = require("../utils/ovh");

const crypto = require("crypto");
const base64 = require("base-64");
const hmac = crypto.createHmac("sha256", config.twitter.appSecret);

module.exports = () => {
  function webhookCRC (req, res) {
    let crc = req.body.crc_token;
    logger.log("Challenging!", req.body);

    hmac.update(crc);
    let response_token = `sha256=${base64.encode(hmac.digest("base64"))}`;

    return res.status(200).json({
      response_token
    });
  }

  function webhookEvent (req, res) {
    let dmEvents = req.body.direct_message_events;
    dmEvents.forEach((dmEvent) => {
      let event = dmEvent.message_create;
      let sender_id = event.sender_id;

      // checks if we send the message
      if (sender_id === config.twitter.appId) {
        return null;
      }

      logger.log(dmEvent);

      if (event.message_data.quick_reply_response) {
        // Postback
        return onPostbackRecieved(res, event);
      } else if (event.message_data.text) {
        // Message
        return onMessageRecieved(res, event);
      }

      return null;
    });

    return res.status(200).end();
  }

  function getSenderLocale (senderId) {
    return ovh.getOvhClient(senderId)
      .then((client) => client.requestPromised("GET", "/me"))
      .then((meInfos) => meInfos.language)
      .catch(() => twitter.getUserInfo(senderId).then((userInfo) => userInfo.lang)) // TODO twitter format is not ISO 15897 complient
      .catch((err) => {
        logger.error(err);
        return "en_US";
      });
  }

  function onPostbackRecieved (res, event) {
    let needFeedback = false;
    let senderId = event.sender_id;
    let payload = event.message_data.quick_reply_response.metadata;

    logger.log("postback:", senderId, payload);
    return getSenderLocale(senderId)
      .then((locale) => bot
      .ask("postback", senderId, payload, null, null, res, locale)
      .then((answer) => {
        needFeedback = answer.feedback || needFeedback;
        return sendResponses(res, senderId, answer.responses);
      }))
      .then(() => {
        if (needFeedback) {
          return sendFeedback(res, senderId, payload, "message");
        }
        return null;
      }) // Ask if it was useful
      .catch((err) => {
        logger.error(err);
        twitter.send(senderId, `Oups ! ${err.message}`);
      });
  }

  function onMessageRecieved (res, event) {
    let needFeedback = false;
    let senderId = event.sender_id;
    let message = event.message_data.text;
    let locale;

    return getSenderLocale(senderId)
      .then((localeLocal) => {
        locale = localeLocal;
        return apiai.textRequestAsync(message, {
          sessionId: senderId
        }, locale);
      })
      .then((resp) => {
        if (resp.status && resp.status.code === 200 && resp.result) {
          if (resp.result.action === "connection" || resp.result.action === "welcome") {
            const accountLinkButton = new Button(BUTTON_TYPE.ACCOUNT_LINKING, `${config.server.url}${config.server.basePath}/authorize?state=${senderId}-twitter`, "");
            return sendResponse(res, senderId, new ButtonsMessage(translator("welcome", locale), [accountLinkButton]));
          }

          if (resp.result.fulfillment && resp.result.fulfillment.speech && Array.isArray(resp.result.fulfillment.messages) && resp.result.fulfillment.messages.length) {
            const smalltalk = resp.result.action && resp.result.action.indexOf("smalltalk") !== -1;
            let quickResponses = resp.result.fulfillment.messages;

            if (smalltalk && Math.floor(Math.random() * 2)) {
              // random to change response from original smalltalk to our custom sentence
              quickResponses = [{ speech: resp.result.fulfillment.speech, type: 0 }];
            }

            return sendQuickResponses(res, senderId, quickResponses).then(() => sendFeedback(res, senderId, resp.result.action, message, locale)); // Ask if it was useful
          }

          return bot
          .ask("message", senderId, message, resp.result.action, resp.result.parameters, res, locale)
          .then((answer) => {
            needFeedback = answer.feedback || needFeedback;

            return sendResponses(res, senderId, answer.responses);
          })
          .then(() => {
            if (needFeedback) {
              sendFeedback(res, senderId, resp.result.action, message, locale);
            }
          }) // Ask if it was useful
          .catch((err) => {
            logger.error(err);
            return twitter.send(senderId, `Oups ! ${err.message}`);
          });
        }
        return null;
      })
      .catch(res.logger.error);
  }

  function sendFeedback (res, senderId, intent, rawMessage, locale) {
    return sendResponse(res, senderId, createFeedback(intent, rawMessage, locale));
  }

  function sendQuickResponses (res, senderId, responses) {
    return Bluebird.mapSeries(responses, (response) => {
      switch (response.type) {
      default: {
        const textResponse = response.speech.replace(/<(.*)\|+(.*)>/, "$1");
        return sendResponse(res, senderId, textResponse);
      }
      }
    });
  }

  function sendResponses (res, senderId, responses) {
    return Bluebird.mapSeries(responses, (response) =>
    Bluebird.resolve(response)
    .then((resp) => Array.isArray(resp) ? sendResponses(res, senderId, resp) : sendResponse(res, senderId, resp)));
  }

  function sendResponse (res, senderId, response) {
    return twitter.send(senderId, response);
  }


  return {
    webhookCRC,
    webhookEvent
  };
};

"use strict";

const messenger = require("../platforms/messenger/messenger");
const bot = require("../bots/hosting")();
const config = require("../config/config-loader").load();
const apiai = require("../utils/apiai");
const Bluebird = require("bluebird");
const responsesCst = require("../constants/responses").FR;
const { ButtonsListMessage, Button } = require("../platforms/generics");
const { camelCase } = require("lodash");

function getWebhook(req, res) {
  if (req.query["hub.mode"] === "subscribe" &&
      req.query["hub.verify_token"] === config.facebook.validationToken) {
    console.log("Validating webhook");
    res.status(200).send(req.query["hub.challenge"]);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);
  }
}

module.exports = () => {
  function postWebhook(req, res) {
    let data = req.body;
    // Make sure this is a page subscription
    if (data.object === "page") {
      // Iterate over each entry
      // There may be multiple if batched
      data.entry.forEach(function(pageEntry) {
        // var pageID = pageEntry.id;
        // let timeOfEvent = pageEntry.time;

        // Iterate over each messaging event
        pageEntry.messaging.forEach(function(messagingEvent) {
          if (messagingEvent.optin) {
            messenger.receivedAuthentication(messagingEvent);
          } else if (messagingEvent.message) {
            receivedMessage(res, messagingEvent);
          } else if (messagingEvent.delivery) {
            messenger.receivedDeliveryConfirmation(messagingEvent);
          } else if (messagingEvent.postback) {
            receivedPostback(res, messagingEvent);
          } else if (messagingEvent.read) {
            messenger.receivedMessageRead(messagingEvent);
          } else if (messagingEvent.account_linking) {
            messenger.receivedAccountLink(messagingEvent);
          } else {
            console.log("Webhook received unknown messagingEvent: ", messagingEvent);
          }
        });
      });

      // Assume all went well.
      //
      // You must send back a 200, within 20 seconds, to let us know you"ve
      // successfully received the callback. Otherwise, the request will time out.
      return res.sendStatus(200);
    }

    return res.sendStatus(200);
  }

  /*
   * Message Event
   *
   * This event is called when a message is sent to your page. The "message"
   * object format can vary depending on the kind of message that was received.
   * Read more at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-received
   *
   * For this example, we"re going to echo any text that we get. If we get some
   * special keywords ("button", "generic", "receipt"), then we"ll send back
   * examples of those bubbles to illustrate the special message bubbles we"ve
   * created. If we receive a message with an attachment (image, video, audio),
   * then we"ll simply confirm that we"ve received the attachment.
   *
   */
  function receivedMessage(res, event) {
    let senderID = event.sender.id;
    let recipientID = event.recipient.id;
    let timeOfMessage = event.timestamp;
    let message = event.message;
    let isEcho = message.is_echo;
    let messageId = message.mid;
    let appId = message.app_id;
    let metadata = message.metadata;

    console.log("Received message for user %d and page %d at %d with message:",
      senderID, recipientID, timeOfMessage);

    // You may get a text or attachment but not both
    let messageText = message.text;

    if (isEcho) {
      // Just logging message echoes to console
      console.log("Received echo for message %s and app %d with metadata %s",
        messageId, appId, metadata);
      return;
    }

    if (messageText) {
      sendCustomMessage(res, senderID, messageText);
    }
  }

  function receivedPostback(res, event) {
    let needFeedback = false;
    let senderId = event.sender.id;
    let payload = event.postback.payload;

    bot.ask("postback", senderId, payload, null, null, res)
      .then((answer) => {
        needFeedback = answer.feedback || needFeedback;

        return sendResponses(res, senderId, answer.responses);
      })
      .then(() => {
        if (needFeedback) {
          return sendFeedback(res, senderId, payload, "message");
        }
      }) // Ask if it was useful
      .catch((err) => {
        res.logger.error(err);
        messenger.sendTextMessage(senderId, `Oups ! ${err.message}`);
      });
  }

  function sendCustomMessage(res, senderId, message) {
    let needFeedback = false;

    apiai.textRequestAsync(message, {
      sessionId: senderId
    })
    .then((resp) => {
      if (resp.status && resp.status.code === 200 && resp.result) {
        if (resp.result.action === "connection" || resp.result.action === "welcome") {
          messenger.sendTextMessage(senderId, responsesCst.welcome);
          return messenger.sendAccountLinking(senderId, `${config.server.url}${config.server.basePath}/authorize?state=${senderId}-facebook_messenger`);
        }

        if (resp.result.fulfillment && resp.result.fulfillment.speech && Array.isArray(resp.result.fulfillment.messages) && resp.result.fulfillment.messages.length) {
          let smalltalk = resp.result.action && resp.result.action.indexOf("smalltalk") !== -1;
          let quickResponses = resp.result.fulfillment.messages;

          if (smalltalk && Math.floor((Math.random() * 2))) { //random to change response from original smalltalk to our custom sentence
            quickResponses = [{ speech: resp.result.fulfillment.speech }];
          }

          return sendQuickResponses(res, senderId, quickResponses)
            .then(() => sendFeedback(res, senderId, resp.result.action, message)); // Ask if it was useful
        }

        return bot.ask("message", senderId, message, resp.result.action, resp.result.parameters, res)
          .then((answer) => {
            needFeedback = answer.feedback || needFeedback;

            return sendResponses(res, senderId, answer.responses);
          })
          .then(() => {
            if (needFeedback) {
              sendFeedback(res, senderId, resp.result.action, message);
            }
          }) // Ask if it was useful
          .catch((err) => {
            res.logger.error(err);
            return messenger.sendTextMessage(senderId, `Oups ! ${err.message}`);
          });
      }
    })
    .catch(res.logger.error);
  }

  function sendFeedback(res, senderId, intent, message) {
    if (intent === "unknown") {
      return;
    }

    message = message.length >= 1000 ? "TOOLONG" : message;

    let buttons = [
      new Button("postback", `FEEDBACK_MISUNDERSTOOD_${camelCase(intent)}_${message}`, "Mauvaise compréhension"),
      new Button("postback", `FEEDBACK_BAD_${camelCase(intent)}_${message}`, "Non"),
      new Button("postback", `FEEDBACK_GOOD_${camelCase(intent)}_${message}`, "Oui")
    ];

    return sendResponse(res, senderId, new ButtonsListMessage("Est-ce que cette réponse vous a aidé ?", buttons));
  }

  function sendQuickResponses(res, senderId, responses) {
    return Bluebird.mapSeries(responses, (response) => {
      switch (response.type) {
      case 0:
      default:
        let textResponse = response.speech.replace(/<(.*)\|+(.*)>/, "$1");
        return sendResponse(res, senderId, textResponse);
      }
    });
  }

  function sendResponses(res, senderId, responses) {
    return Bluebird.mapSeries(responses, (response) => sendResponse(res, senderId, response));
  }

  function sendResponse(res, senderId, response) {
    return messenger.send(senderId, response);
  }

  return {
    getWebhook,
    postWebhook
  };
};

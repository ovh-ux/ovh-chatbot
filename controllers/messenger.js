"use strict";

const messenger = require("../platforms/messenger/messenger");
const bot = require("../bots/hosting")();
const config = require("../config/config-loader").load();
const wit = require("../utils/wit");
const Bluebird = require("bluebird");
const responsesCst = require("../constants/responses").FR;

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
    let senderId = event.sender.id;
    let payload = event.postback.payload;

    bot.ask("postback", senderId, payload, null, null, res)
      .then((responses) => sendResponses(res, senderId, responses))
      .catch((err) => {
        res.logger.error(err);
        messenger.sendTextMessage(senderId, `Oups ! ${err.message}`);
      });
  }

  function sendCustomMessage(res, senderId, message) {
    wit.message(message, {}) //Get intention
      .then((resp) => {
        if (resp.entities && Array.isArray(resp.entities.intent) && resp.entities.intent.length > 0) {
          if (resp.entities.intent[0].value === "connection") {
            messenger.sendTextMessage(senderId, responsesCst.welcome);
            return messenger.sendAccountLinking(senderId, `${config.server.url}${config.server.basePath}/authorize?state=${senderId}-facebook_messenger`);
          }

          return bot.ask("message", senderId, message, resp.entities.intent[0].value, resp.entities, res)
            .then((responses) => sendResponses(res, senderId, responses))
            .catch((err) => {
              res.logger.error(err);
              messenger.sendTextMessage(senderId, `Oups ! ${err.message}`);
            });
        }

        messenger.sendTextMessage(senderId, responsesCst.noIntent);
      })
      .catch(res.logger.error);
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

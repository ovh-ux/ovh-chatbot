"use strict";

const messenger = require("../platforms/messenger/messenger");
const bot = require("../bots/common")();
const config = require("../config/config-loader").load();
const apiai = require("../utils/apiai");
const Bluebird = require("bluebird");
const { Button, ButtonsMessage, BUTTON_TYPE, createFeedback } = require("../platforms/generics");
const ovh = require("../utils/ovh");
const translator = require("../utils/translator");

function getWebhook (req, res) {
  if (req.query["hub.mode"] === "subscribe" && req.query["hub.verify_token"] === config.facebook.validationToken) {
    console.log("Validating webhook");
    res.status(200).send(req.query["hub.challenge"]);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);
  }
}

module.exports = () => {
  function postWebhook (req, res) {
    const data = req.body;

    // Make sure this is a page subscription
    if (data.object === "page") {
      // Iterate over each entry
      // There may be multiple if batched
      data.entry.forEach((pageEntry) => {
        // var pageID = pageEntry.id;
        // let timeOfEvent = pageEntry.time;

        // Iterate over each messaging event
        pageEntry.messaging.forEach((messagingEvent) => {
          if (messagingEvent.optin) {
            messenger.receivedAuthentication(messagingEvent);
          } else if (messagingEvent.message) {
            // checks for quick_replies => use postback handler
            if (messagingEvent.message.quick_reply) {
              receivedPostback(res, Object.assign(messagingEvent, { postback: messagingEvent.message.quick_reply }));
            } else {
              receivedMessage(res, messagingEvent);
            }
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
  function receivedMessage (res, event) {
    const senderID = event.sender.id;
    const recipientID = event.recipient.id;
    const timeOfMessage = event.timestamp;
    const message = event.message;
    const isEcho = message.is_echo;
    const messageId = message.mid;
    const appId = message.app_id;
    const metadata = message.metadata;

    console.log("Received message for user %d and page %d at %d with message:", senderID, recipientID, timeOfMessage);

    // You may get a text or attachment but not both
    const messageText = message.text;

    if (isEcho) {
      // Just logging message echoes to console
      console.log("Received echo for message %s and app %d with metadata %s", messageId, appId, metadata);
      return;
    }

    if (messageText) {
      getSenderLocale(senderID).then((local) => sendCustomMessage(res, senderID, messageText, local));
    }
  }

  function getSenderLocale (senderId) {
    return ovh.getOvhClient(senderId)
      .then((client) => client.requestPromised("GET", "/me"))
      .then((meInfos) => meInfos.language)
      .catch(() => messenger.getUserProfile(senderId).then((body) => JSON.parse(body).locale))
      .catch((err) => {
        console.error(err);
        return "en_US";
      });
  }

  function receivedPostback (res, event) {
    let needFeedback = false;
    const senderId = event.sender.id;
    const payload = event.postback.payload;
    getSenderLocale(senderId)
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
        res.logger.error(err);
        messenger.send(senderId, `Oups ! ${err.message}`);
      });
  }

  function sendCustomMessage (res, senderId, message, locale) {
    let needFeedback = false;

    apiai
      .textRequestAsync(message, {
        sessionId: senderId
      }, locale)
      .then((resp) => {
        if (resp.status && resp.status.code === 200 && resp.result) {
          if (resp.result.action === "connection" || resp.result.action === "welcome") {
            const accountLinkButton = new Button(BUTTON_TYPE.ACCOUNT_LINKING, `${config.server.url}${config.server.basePath}/authorize?state=${senderId}-facebook_messenger`, "");
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
              res.logger.error(err);
              return messenger.send(senderId, `Oups ! ${err.message}`);
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
    return messenger.send(senderId, response);
  }

  return {
    getWebhook,
    postWebhook
  };
};

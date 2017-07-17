"use strict";

const request = require("request");
const Bluebird = require("bluebird");
const config = require("../../config/config-loader").load();
const { emojify } = require("node-emoji");
const { ButtonsListMessage, ButtonsMessage, TextMessage } = require("../generics");
const { textMessageAdapter, buttonsListMessageAdapter, buttonsMessageAdapter } = require("./messenger_adapters");

/*
 * Be sure to setup your config values before running this code. You can
 * set them using environment variables or modifying the config file in /config.
 *
 */

// Generate a page access token for your page from the App Dashboard
const PAGE_ACCESS_TOKEN = config.facebook.pageAccessToken;

// URL where the app is running (include protocol). Used to point to scripts and
// assets located at this address.
const SERVER_URL = config.server.url;

/*
 * Authorization Event
 *
 * The value for "optin.ref" is defined in the entry point. For the "Send to
 * Messenger" plugin, it is the "data-ref" field. Read more at
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/authentication
 *
 */
function receivedAuthentication (event) {
  const senderID = event.sender.id;
  const recipientID = event.recipient.id;
  const timeOfAuth = event.timestamp;

  // The "ref" field is set in the "Send to Messenger" plugin, in the "data-ref"
  // The developer can set this to an arbitrary value to associate the
  // authentication callback with the "Send to Messenger" click event. This is
  // a way to do account linking when the user clicks the "Send to Messenger"
  // plugin.
  const passThroughParam = event.optin.ref;

  console.log("Received authentication for user %d and page %d with pass through param '%s' at %d", senderID, recipientID, passThroughParam, timeOfAuth);

  // When an authentication is received, we"ll send a message back to the sender
  // to let them know it was successful.
  sendTextMessage(senderID, "Authentication successful");
}

/*
 * Delivery Confirmation Event
 *
 * This event is sent to confirm the delivery of a message. Read more about
 * these fields at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-delivered
 *
 */
function receivedDeliveryConfirmation (event) {
  // var senderID = event.sender.id;
  // var recipientID = event.recipient.id;
  const delivery = event.delivery;
  const messageIDs = delivery.mids;
  const watermark = delivery.watermark;

  // var sequenceNumber = delivery.seq;

  if (messageIDs) {
    messageIDs.forEach((messageID) => {
      console.log("Received delivery confirmation for message ID: %s", messageID);
    });
  }

  console.log("All message before %d were delivered.", watermark);
}

/*
 * Postback Event
 *
 * This event is called when a postback is tapped on a Structured Message.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/postback-received
 *
 */
function receivedPostback (event) {
  const senderID = event.sender.id;
  const recipientID = event.recipient.id;
  const timeOfPostback = event.timestamp;

  // The "payload" param is a developer-defined field which is set in a postback
  // button for Structured Messages.
  const payload = event.postback.payload;

  console.log("Received postback for user %d and page %d with payload '%s' at %d", senderID, recipientID, payload, timeOfPostback);

  // When a postback is called, we"ll send a message back to the sender to
  // let them know it was successful
  sendTextMessage(senderID, "Postback called");
}

/*
 * Message Read Event
 *
 * This event is called when a previously-sent message has been read.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-read
 *
 */
function receivedMessageRead (event) {
  // var senderID = event.sender.id;
  // var recipientID = event.recipient.id;

  // All messages before watermark (a timestamp) or sequence have been seen.
  const watermark = event.read.watermark;
  const sequenceNumber = event.read.seq;

  console.log("Received message read event for watermark %d and sequence number %d", watermark, sequenceNumber);
}

/*
 * Account Link Event
 *
 * This event is called when the Link Account or UnLink Account action has been
 * tapped.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/account-linking
 *
 */
function receivedAccountLink (event) {
  const senderID = event.sender.id;

  // var recipientID = event.recipient.id;

  const status = event.account_linking.status;
  const authCode = event.account_linking.authorization_code;

  console.log("Received account link event with for user %d with status %s and auth code %s ", senderID, status, authCode);
}

/*
 * Send an image using the Send API.
 *
 */
function sendImageMessage (recipientId) {
  const messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: `${SERVER_URL}/assets/rift.png`
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a Gif using the Send API.
 *
 */
function sendGifMessage (recipientId) {
  const messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: `${SERVER_URL}/assets/instagram_logo.gif`
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send audio using the Send API.
 *
 */
function sendAudioMessage (recipientId) {
  const messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "audio",
        payload: {
          url: `${SERVER_URL}/assets/sample.mp3`
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a video using the Send API.
 *
 */
function sendVideoMessage (recipientId) {
  const messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "video",
        payload: {
          url: `${SERVER_URL}/assets/allofus480.mov`
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a file using the Send API.
 *
 */
function sendFileMessage (recipientId) {
  const messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "file",
        payload: {
          url: `${SERVER_URL}/assets/test.txt`
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a text message using the Send API.
 *
 */
function sendTextMessage (recipientId, messageText) {
  if (!messageText) {
    return Bluebird.resolve({});
  }

  const messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  return callSendAPI(messageData);
}

/*
 * Send a button message using the Send API.
 *
 */
function sendButtonMessage (recipientId, buttonMessage) {
  const messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: buttonMessage
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a Structured Message (Generic Message type) using the Send API.
 *
 */
function sendListMessage (recipientId, list) {
  const messageData = {
    recipient: {
      id: recipientId
    },

    message: {
      attachment: {
        type: "template",
        payload: list
      }
    }
  };

  return callSendAPI(messageData);
}

/*
 * Send a Structured Message (Generic Message type) using the Send API.
 *
 */
function sendGenericMessage (recipientId, elements) {
  const messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a receipt message using the Send API.
 *
 */
function sendReceiptMessage (recipientId) {
  // Generate a random receipt ID as the API requires a unique ID
  const receiptId = `order${Math.floor(Math.random() * 1000)}`;

  const messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "receipt",
          recipient_name: "Peter Chang",
          order_number: receiptId,
          currency: "USD",
          payment_method: "Visa 1234",
          timestamp: "1428444852",
          elements: [
            {
              title: "Oculus Rift",
              subtitle: "Includes: headset, sensor, remote",
              quantity: 1,
              price: 599.00,
              currency: "USD",
              image_url: `${SERVER_URL}/assets/riftsq.png`
            },
            {
              title: "Samsung Gear VR",
              subtitle: "Frost White",
              quantity: 1,
              price: 99.99,
              currency: "USD",
              image_url: `${SERVER_URL}/assets/gearvrsq.png`
            }
          ],
          address: {
            street_1: "1 Hacker Way",
            street_2: "",
            city: "Menlo Park",
            postal_code: "94025",
            state: "CA",
            country: "US"
          },
          summary: {
            subtotal: 698.99,
            shipping_cost: 20.00,
            total_tax: 57.67,
            total_cost: 626.66
          },
          adjustments: [
            {
              name: "New Customer Discount",
              amount: -50
            },
            {
              name: "$100 Off Coupon",
              amount: -100
            }
          ]
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a message with Quick Reply buttons.
 *
 */
function sendQuickReply (recipientId, message) {
  const messageData = {
    recipient: {
      id: recipientId
    },
    message
  };

  callSendAPI(messageData);
}

/*
 * Send a read receipt to indicate the message has been read
 *
 */
function sendReadReceipt (recipientId) {
  console.log("Sending a read receipt to mark message as seen");

  const messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "mark_seen"
  };

  callSendAPI(messageData);
}

/*
 * Turn typing indicator on
 *
 */
function sendTypingOn (recipientId) {
  console.log("Turning typing indicator on");

  const messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_on"
  };

  callSendAPI(messageData);
}

/*
 * Turn typing indicator off
 *
 */
function sendTypingOff (recipientId) {
  console.log("Turning typing indicator off");

  const messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_off"
  };

  callSendAPI(messageData);
}

/*
 * Send a message with the account linking call-to-action
 */
function sendAccountLinking (recipientId, url) {
  const messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "",
          buttons: [
            {
              type: "account_link",
              url
            }
          ]
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Call the Send API. The message data goes in the body. If successful, we"ll
 * get the message id in a response
 *
 */
function callSendAPI (messageData) {
  return new Bluebird((resolve) => {
    request(
      {
        uri: "https://graph.facebook.com/v2.6/me/messages",
        qs: { access_token: PAGE_ACCESS_TOKEN },
        method: "POST",
        json: messageData
      },
      (error, response, body) => {
        if (!error && response.statusCode === 200) {
          const recipientId = body.recipient_id;
          const messageId = body.message_id;

          if (messageId) {
            console.log("Successfully sent message with id %s to recipient %s", messageId, recipientId);
          } else {
            console.log("Successfully called Send API for recipient %s", recipientId);
          }
        } else {
          console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error);
        }

        return resolve({ body, message: messageData.message });
      }
    );
  });
}

function send (recipientId, message) {
  if (typeof message === "string") {
    return sendTextMessage(recipientId, emojify(message));
  }

  if (message instanceof TextMessage) {
    return sendTextMessage(recipientId, textMessageAdapter(message));
  }

  if (message instanceof ButtonsListMessage) {
    return sendQuickReply(recipientId, buttonsListMessageAdapter(message));
  }

  if (message instanceof ButtonsMessage) {
    return sendButtonMessage(recipientId, buttonsMessageAdapter(message));
  }

  return callSendAPI(message);
}

module.exports = {
  receivedAuthentication,
  receivedDeliveryConfirmation,
  receivedPostback,
  receivedMessageRead,
  receivedAccountLink,
  sendImageMessage,
  sendGifMessage,
  sendAudioMessage,
  sendVideoMessage,
  sendFileMessage,
  sendTextMessage,
  sendButtonMessage,
  sendGenericMessage,
  sendListMessage,
  sendReceiptMessage,
  sendQuickReply,
  sendReadReceipt,
  sendTypingOn,
  sendTypingOff,
  sendAccountLinking,
  callSendAPI,
  send
};

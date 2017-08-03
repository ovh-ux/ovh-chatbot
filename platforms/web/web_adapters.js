"use strict";

function textMessageAdapter (message) {
  return {
    message,
    buttons: []
  };
}

function buttonAdapter (button) {
  return {
    message: null,
    buttons: [button]
  };
}

function buttonListAdapter (buttonList) {
  return {
    message: buttonList.text,
    buttons: buttonList.attachments.buttons || []
  };
}

function cardMessageAdapter (cardMessage) {
  return {
    message: "",
    buttons: cardMessage.attachments.buttons || [],
    items: cardMessage.attachments.items || []
  };
}

module.exports = {
  textMessageAdapter,
  buttonAdapter,
  buttonListAdapter,
  cardMessageAdapter
};

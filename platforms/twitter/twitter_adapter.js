"use strict";

const { emojify } = require("node-emoji");
const { BUTTON_TYPE } = require("../generics");
const _ = require("lodash");

function textMessageAdapter (message) {
  return {
    text: emojify(message.text || message)
  };
}

function buttonsMessageAdapter (buttonsMessage) {
  let partitions = _.partitions(buttonsMessage.attachments.buttons, (btn) => btn.type !== BUTTON_TYPE.URL && btn.type !== BUTTON_TYPE.ACCOUNT_LINKING);
  return {
    text: emojify(buttonsMessage.text),
    ctas: partitions[1].map(buttonAdapter),
    quick_reply: {
      type: "options",
      options: partitions[0].map(buttonAdapter)
    }
  };
}

function buttonAdapter (button) {
  switch (button.type) {
  case BUTTON_TYPE.ACCOUNT_LINKING:
  case BUTTON_TYPE.URL: {
    return {
      type: "web_url",
      label: button.text,
      url: button.value
    };
  }
  case BUTTON_TYPE.MORE:
  case BUTTON_TYPE.POSTBACK: {
    return {
      label: button.text,
      metadata: button.value
    };
  }
  default: {
    return null;
  }
  }
}

module.exports = {
  textMessageAdapter,
  buttonsMessageAdapter
};

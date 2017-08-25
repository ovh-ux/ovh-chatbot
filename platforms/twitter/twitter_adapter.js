"use strict";

const { emojify } = require("node-emoji");

function textMessageAdapter (message) {
  return {
    text: emojify(message.text || message)
  };
}

function buttonsMessageAdapter (buttonsMessage) {
  return {
    text: emojify(buttonsMessage.text),
    quick_reply: {
      type: "options",
      options: buttonsMessage.attachemment.buttons.map((button) => ({
        label: emojify(button.text),
        metadata: button.value
      }))
    }
  };
}

module.exports = {
  textMessageAdapter,
  buttonsMessageAdapter
};

"use strict";

const { BUTTON_TYPE } = require("../generics");

function textMessageAdapter(message) {
  return message.text;
}

function buttonAdapter(button) {
  switch (button.type) {
  case BUTTON_TYPE.URL:
    return `<${button.value}|${button.text}>`;
  case BUTTON_TYPE.POSTBACK:
  case BUTTON_TYPE.MORE:
    return {
      type: "button",
      text: button.text,
      value: button.value,
      name: button.value
    };
  default:
    return button;
  }
}

function buttonsMessageAdapter(message) {
  let actionsStr = [];
  let buttons = message.attachments.buttons
    .map(buttonAdapter)
    .filter((button) => {
      if (typeof button === "string") {
        actionsStr.push(button);
        return false;
      }

      return true;
    });

  return {
    actionsStr,
    attachments: [
      {
        text: message.text,
        fallback: "Vous ne pouvez pas utiliser cette fonctionnalité avec ce navigateur",
        callback_id: "button_list",
        attachment_type: "default",
        actions: buttons
      }
    ]
  };
}

module.exports = {
  textMessageAdapter,
  buttonAdapter,
  buttonsMessageAdapter
};
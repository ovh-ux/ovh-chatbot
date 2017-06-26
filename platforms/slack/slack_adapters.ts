"use strict";

import { BUTTON_TYPE } from "../generics";

export function textMessageAdapter (message) {
  return message.text;
}

export function buttonAdapter (button) {
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

export function buttonsMessageAdapter (message) {
  const actionsStr: Array<string> = [];
  const buttons = message.attachments.buttons.map(buttonAdapter).filter((button) => {
    if (typeof button === "string") {
      actionsStr.push(button);
      return false;
    }

    return true;
  });

  return {
    delete_original: message.delete_original,
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

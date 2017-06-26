"use strict";

import { BUTTON_TYPE, Button } from "../generics";

export function textMessageAdapter (message) {
  return message.text;
}

export function buttonAdapter (button) {
  switch (button.type) {
  case BUTTON_TYPE.POSTBACK:
  case BUTTON_TYPE.MORE:
    return {
      type: button.type,
      title: button.text,
      payload: button.value
    };
  case BUTTON_TYPE.URL:
    return {
      type: button.type,
      url: button.value,
      title: button.text
    };
  default:
    return button;
  }
}

export function buttonsMessageAdapter (message) {
  return {
    template_type: "button",
    text: message.text,
    buttons: message.attachments.buttons.map(buttonAdapter)
  };
}

export function elementAdapter (button) {
  return {
    title: button.title,
    buttons: [button]
  };
}

export function buttonsListMessageAdapter (message) {
  const moreButtons: Array<Button> = [];
  const eltButtons = message.attachments.buttons.filter((button) => {
    if (button.type !== BUTTON_TYPE.MORE) {
      return true;
    }

    button.type = BUTTON_TYPE.POSTBACK;
    moreButtons.push(button);
    return false;
  });

  return {
    template_type: "list",
    top_element_style: "compact",
    elements: eltButtons.map((button) => elementAdapter(buttonAdapter(button))),
    buttons: moreButtons
  };
}
